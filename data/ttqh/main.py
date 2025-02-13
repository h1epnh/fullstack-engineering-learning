from app import config
from app import db
from app.services import api_service
from app.routes import quy_hoach_routes
import json
import time

def main():
    """Main function to retrieve data and interact with the API."""
    db_host = config.Config.DB_HOST
    db_name = config.Config.DB_NAME
    db_user = config.Config.DB_USER
    db_password = config.Config.DB_PASSWORD
    api_url = config.Config.API_URL

    conn = db.get_db_connection()
    if not conn:
        print("Failed to connect to the database.")
        return

    try:
        # Fetch maphuongxa and maquanhuyen from ttqh_phuong_xa
        phuong_xa_data = db.fetch_mathuadat_from_ttqh_phuong_xa(conn)

        if phuong_xa_data:
            print("Fetching data for maphuongxa values...")
            for maphuongxa, maquanhuyen in phuong_xa_data:
                
                # Hardcode the maphuongxa for testing
                ma_thua_dat = maphuongxa + "0100015"
                
                # Call the API for each maphuongxa (now used as MaThuaDat)
                api_data = api_service.get_quy_hoach_data(ma_thua_dat, api_url)

                if api_data:
                    print(f"API data retrieved for maphuongxa: {maphuongxa}, maquanhuyen: {maquanhuyen}")
                    # Process or insert the api_data here
                    existing_data = db.fetch_quy_hoach_data(conn, maphuongxa)
                    if not existing_data:
                        db.insert_data_into_db(conn, api_data, maphuongxa)
                    else:
                        print(f"Data for maphuongxa {maphuongxa} already exists in the database.")
                else:
                    print(f"Failed to retrieve API data for maphuongxa: {maphuongxa}")
                time.sleep(0.5) #Important to avoid problems

        else:
            print("No data found in ttqh_phuong_xa table.")

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()