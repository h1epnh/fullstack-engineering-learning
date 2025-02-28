import psycopg2
from app import config

def get_db_connection():
    """Creates a PostgreSQL connection."""
    try:
        conn = psycopg2.connect(
            host=config.Config.DB_HOST,
            database=config.Config.DB_NAME,
            user=config.Config.DB_USER,
            password=config.Config.DB_PASSWORD
        )
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        return None

def insert_data_into_db(conn, api_data, ma_phuong_xa, ma_quan_huyen, ma_tinh_thanh, ma_thua_dat):
  """Inserts API data into the PostgreSQL database"""
  from app.services import data_service
  if not data_service.validate_quy_hoach_data(api_data):
    print("Data does not pass validation! Will not insert")
    return
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
            INSERT INTO ttqh_chi_tiet (ThongTinChung, LoGioi, QHPK, CTXD, DCCB, QHNganh, QHChiTiet, VatGoc, blocked, maphuongxa, maquanhuyen, matinhthanh, mathuadat)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (ThongTinChung, LoGioi, QHPK, CTXD, DCCB, QHNganh, QHChiTiet, VatGoc, blocked, ma_phuong_xa, ma_quan_huyen, ma_tinh_thanh, ma_thua_dat))
    conn.commit()
    cur.close()
    # print("Data inserted successfully into the database.")
    print(f"Data inserted successfully into the database. ma_phuong_xa: {ma_phuong_xa}, ma_quan_huyen: {ma_quan_huyen}, -> ma_thua_dat: {ma_thua_dat}")

  except Exception as e:
    print(f"Error inserting data into database: {e}")
    conn.rollback() #prevent from saving

def fetch_quy_hoach_data(conn, ma_thua_dat):
    """Fetches quy hoach data from the database and returns it as a dictionary."""
    try:
        cur = conn.cursor()  # Standard cursor
        cur.execute(
            """
            SELECT id, ThongTinChung, LoGioi, QHPK, CTXD, DCCB, QHNganh, QHChiTiet, VatGoc, blocked
            FROM ttqh_chi_tiet
            WHERE ThongTinChung ->> 'mathuadat' = %s;
            """,
            (ma_thua_dat,),
        )
        row = cur.fetchone()
        cur.close()

        if row:
            # Manually convert the row to a dictionary
            column_names = [desc[0] for desc in cur.description]
            return dict(zip(column_names, row))
        else:
            return None

    except psycopg2.Error as e:
        print(f"Database query error: {e}")
        return None
    
    
def fetch_mathuadat_from_ttqh_phuong_xa(conn, ma_quan_huyen):
    """Fetches maphuongxa and maquanhuyen from ttqh_phuong_xa table."""
    try:
        cur = conn.cursor()
        cur.execute("SELECT maphuongxa, maquanhuyen FROM ttqh_phuong_xa where maquanhuyen = %s and maphuongxa = '26851';", (ma_quan_huyen,))
        results = cur.fetchall()  # Fetch all rows
        cur.close()
        return results  # Return list of (maphuongxa, maquanhuyen) tuples
    except psycopg2.Error as e:
        print(f"Database query error: {e}")
        return []
    
def fetch_mathuadat_exist(conn, ma_thua_dat):
    """Fetches maphuongxa and maquanhuyen from ttqh_phuong_xa table."""
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM ttqh_chi_tiet where mathuadat = %s;", (ma_thua_dat,))
        results = cur.fetchall()  # Fetch all rows
        cur.close()
        return results  # Return list of (maphuongxa, maquanhuyen) tuples
    except psycopg2.Error as e:
        print(f"Database query error: {e}")
        return []