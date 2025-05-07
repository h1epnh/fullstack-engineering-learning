import requests
import json
import re
import psycopg2
import psycopg2.extras  # For more flexible cursor types (DictCursor)

def decode_unicode_escapes(text):
    """Decodes Unicode escapes in a string."""
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), text)


def get_quy_hoach_data(ma_thua_dat):
    """
    Retrieves quy hoach data from the specified API.

    Args:
        ma_thua_dat (str): The MaThuaDat value to search for.

    Returns:
        dict or None: The JSON response as a dictionary with decoded Unicode, or None if there was an error.
    """

    url = "https://sqhkt-qlqh.tphcm.gov.vn/computing/930/api/v3.1/a-z/all"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://thongtinquyhoach.hochiminhcity.gov.vn",
        "Referer": "https://thongtinquyhoach.hochiminhcity.gov.vn",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Priority": "u=0",
        "Te": "trailers",
        "Connection": "keep-alive"
    }
    data = {"MaThuaDat": ma_thua_dat}

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()  # Raise an exception for bad status codes
        json_data = response.json()

        # Decode Unicode escapes recursively
        def decode_recursively(obj):
            if isinstance(obj, str):
                return decode_unicode_escapes(obj)
            elif isinstance(obj, dict):
                return {k: decode_recursively(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [decode_recursively(item) for item in obj]
            else:
                return obj

        decoded_json_data = decode_recursively(json_data)
        return decoded_json_data

    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None


def connect_and_query_postgres(db_host, db_name, db_user, db_password, ma_thua_dat, ma_phuong_xa):
    """Connects to PostgreSQL, retrieves data, and prints it."""
    try:
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password
        )

        # Use a DictCursor for easier access to column names
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Fetch data from the API if MaThuaDat is not found in the database, insert it, and then SELECT
        cur.execute("""
            SELECT * FROM ttqh_chi_tiet
            WHERE ThongTinChung ->> 'mathuadat' = %s;
        """, (ma_thua_dat,))

        row = cur.fetchone()

        if row:
            print("Data found in the database:")
            print(json.dumps(row, indent=4, ensure_ascii=False, default=str))  # use default=str in json.dumps
        else:
            print("Data not found in the database.  Fetching from API...")
            api_data = get_quy_hoach_data(ma_thua_dat)
            
            print("API raw data:")
            print(api_data)  # use default=str in json.dumps
            
            print("API data:")
            print(json.dumps(api_data, indent=4, ensure_ascii=False, default=str))  # use default=str in json.dumps
            
            if api_data:
              insert_data_into_db(conn, api_data, ma_phuong_xa)
            else:
              print("Failed to retrieve from API")
            cur.execute("""
              SELECT * FROM ttqh_chi_tiet WHERE ThongTinChung ->> 'mathuadat' = %s;
            """, (ma_thua_dat,))
            row = cur.fetchone()
            if row:
              print("Data found in the database after API fetch and insertion:")
              print(json.dumps(row, indent=4, ensure_ascii=False, default=str))  # use default=str in json.dumps
            else:
              print("Failed to retrieve from DB after insertion")


        cur.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL or during query: {e}")


def insert_data_into_db(conn, api_data, ma_phuong_xa):
  """Inserts API data into the PostgreSQL database"""
  try:
    cur = conn.cursor()
    ThongTinChung= api_data.get('ThongTinChung')
    LoGioi= api_data.get('LoGioi')
    QHPK= api_data.get('QHPK')
    CTXD= api_data.get('CTXD')
    DCCB= api_data.get('DCCB')
    QHNganh= api_data.get('QHNganh')
    QHChiTiet= api_data.get('QHChiTiet')
    VatGoc= api_data.get('VatGoc')
    blocked= api_data.get('blocked')


    cur.execute("""
            INSERT INTO ttqh_chi_tiet (ThongTinChung, LoGioi, QHPK, CTXD, DCCB, QHNganh, QHChiTiet, VatGoc, blocked, maphuongxa)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (ThongTinChung, LoGioi, QHPK, CTXD, DCCB, QHNganh, QHChiTiet, VatGoc, blocked, ma_phuong_xa))
    conn.commit()
    cur.close()
    print("Data inserted successfully into the database.")


  except Exception as e:
    print(f"Error inserting data into database: {e}")
    conn.rollback() #prevent from saving


if __name__ == "__main__":
    # PostgreSQL connection parameters
    db_host = "localhost"  # Replace with your database host
    db_name = "tthq"  # Replace with your database name
    db_user = "postgres"  # Replace with your database user
    db_password = "postgres"  # Replace with your database password
    
    ma_phuong_xa = "26797"
    so_to_ban_do = "010"
    so_thua_dat = "0016"
    ma_thua_dat_to_search = ma_phuong_xa + so_to_ban_do + so_thua_dat  # Replace with the MaThuaDat you want to search for

    connect_and_query_postgres(db_host, db_name, db_user, db_password, ma_thua_dat_to_search, ma_phuong_xa)