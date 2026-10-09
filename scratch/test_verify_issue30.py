import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
import re
import concurrent.futures
import time

INGRESS_HOST = "127.0.0.1"
INGRESS_PORT = 18080
BASE_URL = f"http://{INGRESS_HOST}:{INGRESS_PORT}"

def log(msg):
    print(f"[TEST Issue #30] {msg}")

def do_request(method, path, body=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Host": "api.ewallet-lab.local",
        "Content-Type": "application/json"
    }
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                res_json = json.loads(content)
            except Exception:
                res_json = content
            return status, res_json
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read().decode("utf-8")
        try:
            res_json = json.loads(content)
        except Exception:
            res_json = content
        return status, res_json

def create_user_with_balance(name, initial_balance):
    phone = f"09{uuid.uuid4().int % 100000000:08d}"
    status, user = do_request("POST", "/users/register", {
        "phone": phone,
        "name": name
    })
    assert status == 201, f"Failed to register user: {user}"
    user_id = user["id"]

    if initial_balance > 0:
        status, bal = do_request("POST", f"/wallets/{user_id}/credit", {
            "amount": initial_balance,
            "type": "TOPUP",
            "note": "Initial test balance",
            "stepUpConfirmed": False
        })
        assert status == 200, f"Failed to credit wallet: {bal}"
        return user_id, phone, bal["balance"]
    else:
        status, bal = do_request("GET", f"/wallets/{user_id}/balance")
        assert status == 200
        return user_id, phone, bal["balance"]

def run_tests():
    log("=== BẮT ĐẦU KIỂM THỬ ĐỘC LẬP ISSUE #30: THANH TOÁN DỊCH VỤ SỐ & GIẢI TRÍ ===")

    # 1. Test Catalog
    log("1. Kiểm tra danh mục gói dịch vụ số (GET /bills/digital-services)...")
    status, catalog = do_request("GET", "/bills/digital-services")
    assert status == 200, f"Expected 200, got {status}: {catalog}"
    assert len(catalog) >= 5, f"Expected >= 5 packages, got {len(catalog)}"
    
    package_codes = {p["packageCode"]: p for p in catalog}
    assert "SPOTIFY_PREMIUM_1M" in package_codes
    assert "NETFLIX_STANDARD_1M" in package_codes
    assert "VIEON_VIP_1M" in package_codes
    assert "GOOGLE_PLAY_CODE_100K" in package_codes
    assert "APPLE_SERVICES_CODE_100K" in package_codes
    
    assert package_codes["SPOTIFY_PREMIUM_1M"]["price"] == 59000
    assert package_codes["NETFLIX_STANDARD_1M"]["price"] == 260000
    assert package_codes["VIEON_VIP_1M"]["price"] == 69000
    assert package_codes["GOOGLE_PLAY_CODE_100K"]["price"] == 100000
    assert package_codes["APPLE_SERVICES_CODE_100K"]["price"] == 100000
    log(f"   -> Danh mục hợp lệ: {len(catalog)} gói sẵn sàng.")

    # 2. Tạo test user & ví
    log("2. Khởi tạo tài khoản và nạp tiền kiểm thử 500,000 VND...")
    user_id, phone, current_balance = create_user_with_balance("Nguyen Van Digital", 500000)
    assert current_balance == 500000
    log(f"   -> Tạo thành công user {user_id} ({phone}), số dư ban đầu: {current_balance} VND")

    # 3. Mua gói Spotify Premium 1 tháng (59,000 VND)
    log("3. Mua gói Spotify Premium (POST /bills/digital-services/subscribe)...")
    status, spotify_order = do_request("POST", "/bills/digital-services/subscribe", {
        "userId": user_id,
        "packageCode": "SPOTIFY_PREMIUM_1M",
        "accountIdentifier": "spotify.tester@gmail.com",
        "stepUpConfirmed": False
    })
    assert status == 201, f"Expected 201, got {status}: {spotify_order}"
    assert spotify_order["packageCode"] == "SPOTIFY_PREMIUM_1M"
    assert spotify_order["price"] == 59000
    assert spotify_order["accountIdentifier"] == "spotify.tester@gmail.com"
    assert spotify_order["status"] == "COMPLETED"
    assert spotify_order["activationCode"]
    # Check regex: 4 chars - 4 chars - 4 chars
    assert re.match(r"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$", spotify_order["activationCode"]), \
        f"Mã kích hoạt không đúng định dạng: {spotify_order['activationCode']}"
    log(f"   -> Thành công! Đơn hàng {spotify_order['id']}, Mã kích hoạt: {spotify_order['activationCode']}")

    # Kiểm tra số dư ví giảm đúng 59,000 VND
    status, w_res2 = do_request("GET", f"/wallets/{user_id}/balance")
    assert status == 200
    new_bal = w_res2["balance"]
    assert new_bal == current_balance - 59000, f"Expected {current_balance - 59000}, got {new_bal}"
    current_balance = new_bal
    log(f"   -> Ledger kiểm tra số dư khớp chính xác: còn {current_balance} VND")

    # 4. Mua mã nạp Google Play 100,000 VND
    log("4. Mua mã thẻ Google Play 100K...")
    status, gp_order = do_request("POST", "/bills/digital-services/subscribe", {
        "userId": user_id,
        "packageCode": "GOOGLE_PLAY_CODE_100K",
        "accountIdentifier": phone,
        "stepUpConfirmed": False
    })
    assert status == 201, f"Expected 201, got {status}: {gp_order}"
    assert gp_order["price"] == 100000
    assert re.match(r"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$", gp_order["activationCode"])
    log(f"   -> Thành công! Mã nạp Google Play: {gp_order['activationCode']}")

    status, w_res3 = do_request("GET", f"/wallets/{user_id}/balance")
    assert w_res3["balance"] == current_balance - 100000
    current_balance -= 100000
    log(f"   -> Ledger kiểm tra số dư khớp chính xác: còn {current_balance} VND")

    # 5. Kiểm tra lịch sử mua
    log("5. Kiểm tra lịch sử đăng ký dịch vụ số (GET /bills/digital-services/history)...")
    status, history = do_request("GET", f"/bills/digital-services/history?userId={user_id}")
    assert status == 200
    assert len(history) == 2, f"Expected 2 orders, got {len(history)}"
    assert history[0]["id"] == gp_order["id"] # newest first
    assert history[1]["id"] == spotify_order["id"]
    log("   -> Lịch sử trả về chính xác 2 đơn hàng theo thứ tự thời gian mới nhất.")

    # 6. Kiểm tra xem chi tiết đơn hàng theo ID
    log("6. Kiểm tra xem chi tiết đơn hàng theo ID (GET /bills/digital-services/{id})...")
    status, detail_order = do_request("GET", f"/bills/digital-services/{spotify_order['id']}")
    assert status == 200
    assert detail_order["activationCode"] == spotify_order["activationCode"]
    log("   -> Chi tiết đơn hàng khớp 100%.")

    # 7. Kiểm tra xử lý số dư không đủ (Insufficient balance)
    log("7. Kiểm tra chặn khi số dư không đủ...")
    poor_user_id, _, _ = create_user_with_balance("Poor Tester", 0)
    
    status, fail_res = do_request("POST", "/bills/digital-services/subscribe", {
        "userId": poor_user_id,
        "packageCode": "NETFLIX_STANDARD_1M",
        "accountIdentifier": "netflix@example.com"
    })
    assert status == 409, f"Expected 409 Insufficient balance, got {status}: {fail_res}"
    log(f"   -> Bị từ chối chính xác với 409 Conflict: {fail_res}")

    # 8. Concurrency Race Test (Kiểm thử tải đồng thời chống Race Condition / Double Debit)
    log("8. Concurrency Race Test: 10 luồng mua đồng thời với số dư chỉ đủ cho đúng 3 gói Spotify (177,000 VND)...")
    race_user_id, _, _ = create_user_with_balance("Race Tester", 59000 * 3)

    def attempt_subscribe(thread_idx):
        st, _ = do_request("POST", "/bills/digital-services/subscribe", {
            "userId": race_user_id,
            "packageCode": "SPOTIFY_PREMIUM_1M",
            "accountIdentifier": f"race_{thread_idx}@example.com"
        })
        return st

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_subscribe, i) for i in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for r in results if r == 201)
    conflict_count = sum(1 for r in results if r == 409)
    log(f"   -> Kết quả 10 luồng đồng thời: {success_count} thành công (201), {conflict_count} xung đột (409). Chi tiết: {results}")

    assert success_count == 3, f"Expected exactly 3 successes, got {success_count}"
    assert conflict_count == 7, f"Expected exactly 7 conflicts, got {conflict_count}"

    # Kiểm tra số dư cuối cùng phải là đúng 0 VND
    status, final_race_wallet = do_request("GET", f"/wallets/{race_user_id}/balance")
    assert final_race_wallet["balance"] == 0, f"Expected balance 0, got {final_race_wallet['balance']}"
    log("   -> Số dư ví cuối cùng chính xác tuyệt đối: 0 VND! Không double-debit, không rò rỉ tiền tệ!")

    log("=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP CHO ISSUE #30 ĐÃ VƯỢT QUA 100% ===")

if __name__ == "__main__":
    run_tests()
