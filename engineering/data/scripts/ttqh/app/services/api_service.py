import requests
import json
from app.utils import helpers

def get_quy_hoach_data(ma_thua_dat, api_url):
    """Retrieves data from the API and decodes it."""
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
        response = requests.post(api_url, headers=headers, data=data)
        response.raise_for_status()
        json_data = response.json()
        decoded_json_data = helpers.decode_recursively(json_data)
        return decoded_json_data

    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None