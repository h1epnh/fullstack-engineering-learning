from app import config
from app import db
from app.services import api_service
from app.routes import quy_hoach_routes
import json
import time

def main():
    """Main function to retrieve data and interact with the API."""
    api_url = config.Config.API_URL

    conn = db.get_db_connection()
    if not conn:
        print("Failed to connect to the database.")
        return

    try:
        # Fetch maphuongxa and maquanhuyen from ttqh_phuong_xa
        
        ma_quan_huyen = "762" 
        
        phuong_xa_data = db.fetch_mathuadat_from_ttqh_maquanhuyen(conn, ma_quan_huyen)

        if phuong_xa_data:
            print("Fetching data for maphuongxa values...", "Length: ", len(phuong_xa_data))
            for maphuongxa, maquanhuyen in phuong_xa_data:
                
                try:
                    print("Starting data retrieval and insertion...")
                    count = 1 
                    
                    if count > 3:
                            i = 500 
                            
                    for i in range(1, 500):
                        count_fail = 1 
                        
                        
                            
                        for j in range(1, 500):
                            # Check if the ma_thua_dat already exists in the database
                            ma_thua_dat = maphuongxa + str(i).zfill(3) + str(j).zfill(4)
                            # print(f"Processing ma_thua_dat: {ma_thua_dat}")
                            existing_data = db.fetch_mathuadat_exist(conn, ma_thua_dat)
                            if not existing_data:
                                print(f"Processing ma_thua_dat {ma_thua_dat} is not exists in the databases.")                                
                                api_data = api_service.get_quy_hoach_data(ma_thua_dat, api_url)
                                if api_data:
                                    # Process or insert the api_data here
                                    db.insert_data_into_db(conn, api_data, maphuongxa, maquanhuyen, "76", ma_thua_dat)
                                else:
                                    print(f"Failed to retrieve API data for ma_thua_dat: {ma_thua_dat}, times: {count_fail}")
                                    
                                    count_fail += 1
                                    if count_fail > 3:
                                        count += 1 
                                        break
                            else:
                                print(f"Data for ma_thua_dat {ma_thua_dat} already exists in the database.")
                                
                        
                            
                except Exception as e:
                    print(f"An error occurred: {e}")

        else:
            print("No data found in ttqh_phuong_xa table.")

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()