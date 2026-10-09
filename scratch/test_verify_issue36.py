import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
import time
from datetime import datetime, timezone

INGRESS_HOST = "127.0.0.1"
INGRESS_PORT = 18080
BASE_URL = f"http://{INGRESS_HOST}:{INGRESS_PORT}"

def log(msg):
    print(f"[TEST Issue #36] {msg}")

def do_request(method, path, body=None, expect_raw=False):
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
            if expect_raw:
                return status, content, resp.headers
            try:
                res_json = json.loads(content)
            except Exception:
                res_json = content
            return status, res_json, resp.headers
    except urllib.error.HTTPError as e:
        status = e.code
        content = e.read().decode("utf-8")
        if expect_raw:
            return status, content, e.headers
        try:
            res_json = json.loads(content)
        except Exception:
            res_json = content
        return status, res_json, e.headers

def create_user_with_transactions(name):
    phone = f"09{uuid.uuid4().int % 100000000:08d}"
    status, user, _ = do_request("POST", "/users/register", {"phone": phone, "name": name})
    assert status == 201, f"Failed to register user: {user}"
    user_id = user["id"]

    # 1. Topup 1,000,000 VND (IN)
    status, _, _ = do_request("POST", f"/wallets/{user_id}/credit", {
        "amount": 1000000,
        "type": "TOPUP",
        "note": "Topup 1M",
        "stepUpConfirmed": False
    })
    assert status == 200

    # 2. Withdraw 200,000 VND (OUT)
    status, _, _ = do_request("POST", f"/wallets/{user_id}/debit", {
        "amount": 200000,
        "type": "WITHDRAW",
        "note": "Withdraw 200k",
        "stepUpConfirmed": False
    })
    assert status == 200

    # 3. Topup 300,000 VND (IN)
    status, _, _ = do_request("POST", f"/wallets/{user_id}/credit", {
        "amount": 300000,
        "type": "TOPUP",
        "note": "Topup 300k",
        "stepUpConfirmed": False
    })
    assert status == 200

    # 4. Bill payment 150,000 VND (OUT)
    status, _, _ = do_request("POST", f"/wallets/{user_id}/debit", {
        "amount": 150000,
        "type": "BILL_PAYMENT",
        "note": "Bill 150k",
        "stepUpConfirmed": False
    })
    assert status == 200

    return user_id

def run_tests():
    log("=== BẮT ĐẦU KIỂM THỬ ĐỘC LẬP ISSUE #36: BỘ LỌC GIAO DỊCH & SAO KÊ TÀI CHÍNH ===")

    # 1. Khởi tạo user và các giao dịch mẫu
    log("1. Khởi tạo user và thực hiện 4 giao dịch (2 IN: +1.3M, 2 OUT: -350k)...")
    user_id = create_user_with_transactions("Statement User")
    log(f"   -> User {user_id} đã có 4 giao dịch.")

    # 2. Test Smart Search: Lọc theo dòng tiền IN
    log("2. Kiểm tra bộ lọc dòng tiền IN (GET /wallets/{userId}/transactions/search?direction=IN)...")
    status, res_in, _ = do_request("GET", f"/wallets/{user_id}/transactions/search?direction=IN")
    assert status == 200, f"Expected 200, got {status}: {res_in}"
    items_in = res_in.get("transactions", res_in.get("content", []))
    assert len(items_in) == 2, f"Expected 2 IN transactions, got {len(items_in)}"
    for tx in items_in:
        assert tx["type"] in ("TOPUP", "TRANSFER_IN", "REFUND", "LOYALTY_REDEMPTION", "INVESTMENT_SELL", "SAVINGS_GOAL_WITHDRAW")
    log("   -> Lọc chính xác 2 giao dịch tiền vào (IN).")

    # 3. Test Smart Search: Lọc theo dòng tiền OUT
    log("3. Kiểm tra bộ lọc dòng tiền OUT (GET /wallets/{userId}/transactions/search?direction=OUT)...")
    status, res_out, _ = do_request("GET", f"/wallets/{user_id}/transactions/search?direction=OUT")
    assert status == 200
    items_out = res_out.get("transactions", res_out.get("content", []))
    assert len(items_out) == 2, f"Expected 2 OUT transactions, got {len(items_out)}"
    for tx in items_out:
        assert tx["type"] in ("WITHDRAW", "TRANSFER_OUT", "BILL_PAYMENT", "BNPL_REPAYMENT", "INVESTMENT_BUY", "SAVINGS_GOAL_DEPOSIT", "VOUCHER_PASS_PURCHASE")
    log("   -> Lọc chính xác 2 giao dịch tiền ra (OUT).")

    # 4. Test phân trang
    log("4. Kiểm tra phân trang (page=0, size=2)...")
    status, res_page0, _ = do_request("GET", f"/wallets/{user_id}/transactions/search?page=0&size=2")
    assert status == 200
    page_items = res_page0.get("transactions", res_page0.get("content", []))
    assert len(page_items) == 2
    assert res_page0["totalPages"] == 2
    assert res_page0["totalElements"] == 4
    log(f"   -> Phân trang chính xác: trang 0 có 2/4 phần tử, tổng số trang = {res_page0['totalPages']}")

    # 5. Test Sao kê tháng (GET /wallets/{userId}/statement?month=yyyy-MM)
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    log(f"5. Kiểm tra tính sao kê tháng {current_month}...")
    status, statement, _ = do_request("GET", f"/wallets/{user_id}/statement?month={current_month}")
    assert status == 200, f"Expected 200, got {status}: {statement}"
    
    opening_bal = float(statement["openingBalance"])
    total_credits = float(statement["totalCredits"])
    total_debits = float(statement["totalDebits"])
    closing_bal = float(statement["closingBalance"])
    
    log(f"   -> Số dư đầu kỳ: {opening_bal:,.0f} | Tiền vào: {total_credits:,.0f} | Tiền ra: {total_debits:,.0f} | Cuối kỳ: {closing_bal:,.0f}")
    
    # Kiểm tra đẳng thức toán học cốt lõi
    expected_closing = opening_bal + total_credits - total_debits
    assert closing_bal == expected_closing, f"Invariant violated: {closing_bal} != {expected_closing}"
    assert total_credits == 1300000, f"Expected credits 1.3M, got {total_credits}"
    assert total_debits == 350000, f"Expected debits 350k, got {total_debits}"
    assert closing_bal == 950000, f"Expected closing 950k, got {closing_bal}"
    log("   -> Đẳng thức số dư đầu kỳ + tiền vào - tiền ra = cuối kỳ KHỚP TUYỆT ĐỐI 100%!")

    # 6. Test Xuất CSV sao kê (GET /wallets/{userId}/statement/export?month=yyyy-MM&format=csv)
    log(f"6. Kiểm tra xuất file CSV sao kê tháng {current_month}...")
    status, csv_content, headers = do_request("GET", f"/wallets/{user_id}/statement/export?month={current_month}&format=csv", expect_raw=True)
    assert status == 200, f"Expected 200, got {status}: {csv_content}"
    content_type = headers.get("Content-Type", "")
    assert "text/csv" in content_type, f"Expected text/csv, got {content_type}"
    
    lines = csv_content.strip().split("\n")
    log(f"   -> Header dòng đầu: {lines[0]}")
    assert "Mã GD" in lines[0] and "Thời gian" in lines[0] and "Loại" in lines[0] and "Số tiền" in lines[0] and "Số dư sau GD" in lines[0]
    assert len(lines) == 5, f"Expected 1 header + 4 transaction lines = 5 lines, got {len(lines)}"
    log("   -> Định dạng CSV và số lượng dòng dữ liệu khớp chính xác 100%!")

    # 7. Test Validate Month Format (400 Bad Request)
    log("7. Kiểm tra chặn khi tháng sai format...")
    status, err_resp, _ = do_request("GET", f"/wallets/{user_id}/statement?month=202610")
    assert status == 400, f"Expected 400 Bad Request, got {status}: {err_resp}"
    log(f"   -> Bị từ chối chính xác với 400 Bad Request: {err_resp}")

    log("=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP CHO ISSUE #36 ĐÃ VƯỢT QUA 100% ===")

if __name__ == "__main__":
    run_tests()
