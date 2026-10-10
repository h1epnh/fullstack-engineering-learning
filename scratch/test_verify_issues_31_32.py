import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
from datetime import datetime, timezone, date

INGRESS_HOST = "127.0.0.1"
INGRESS_PORT = 18080
BASE_URL = f"http://{INGRESS_HOST}:{INGRESS_PORT}"

def log(msg):
    print(f"[TEST Issues #31 & #32] {msg}")

def do_request(method, path, body=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Host": "api.ewallet-lab.local",
        "Content-Type": "application/json"
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    elif method in ("POST", "PUT"):
        data = b"{}"
    else:
        data = None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
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

def create_user(name, initial_balance=1000000):
    phone = f"09{uuid.uuid4().int % 100000000:08d}"
    status, user = do_request("POST", "/users/register", {"phone": phone, "name": name})
    assert status == 201, f"Failed to register user: {user}"
    user_id = user["id"]

    if initial_balance > 0:
        status, _ = do_request("POST", f"/wallets/{user_id}/credit", {
            "amount": initial_balance,
            "type": "TOPUP",
            "note": "Initial test deposit",
            "stepUpConfirmed": False
        })
        assert status == 200

    return user_id, phone

def run_tests():
    log("=== BẮT ĐẦU KIỂM THỬ ĐỘC LẬP ISSUES #31 & #32: DANH BẠ THỤ HƯỞNG & CHUYỂN TIỀN ĐỊNH KỲ ===")

    # 1. Khởi tạo 2 users
    log("1. Khởi tạo User A (người gửi: 1.000.000đ) và User B (người nhận)...")
    user_a_id, user_a_phone = create_user("Sender A", 1000000)
    user_b_id, user_b_phone = create_user("Receiver B", 100000)
    log(f"   -> User A: {user_a_id} ({user_a_phone}), User B: {user_b_id} ({user_b_phone})")

    # ========================================================
    # PHẦN 1: ISSUE #32 - DANH BẠ NGƯỜI THỤ HƯỞNG & QUICK PAY
    # ========================================================
    log("\n--- [ISSUE #32] KIỂM THỬ DANH BẠ NGƯỜI THỤ HƯỞNG (SAVED PAYEES) ---")

    # 1.1 Lưu User B vào danh bạ của User A
    log("1.1. User A lưu User B vào danh bạ (POST /payees/{userA})...")
    status, payee = do_request("POST", f"/payees/{user_a_id}", {
        "payeePhone": user_b_phone,
        "nickname": "Bạn B Thân",
        "isFavorite": True
    })
    assert status == 201, f"Expected 201 Created, got {status}: {payee}"
    payee_id = payee["id"]
    assert payee["payeePhone"] == user_b_phone
    assert payee["payeeName"] == "Receiver B"
    assert payee["nickname"] == "Bạn B Thân"
    assert payee["isFavorite"] is True
    log("   -> Lưu danh bạ thành công, họ tên tự động tra cứu từ user-service!")

    # 1.2 Tra cứu danh bạ
    log("1.2. Tra cứu danh bạ User A (GET /payees/{userA})...")
    status, payees = do_request("GET", f"/payees/{user_a_id}")
    assert status == 200
    assert len(payees) == 1
    assert payees[0]["id"] == payee_id
    log("   -> Tra cứu danh bạ chính xác, trả về đúng bản ghi vừa lưu.")

    # 1.3 Cập nhật nickname và toggle yêu thích
    log("1.3. Cập nhật nickname và bỏ yêu thích (PUT /payees/{userA}/{id})...")
    status, updated_payee = do_request("PUT", f"/payees/{user_a_id}/{payee_id}", {
        "nickname": "Đồng nghiệp B",
        "isFavorite": False
    })
    assert status == 200
    assert updated_payee["nickname"] == "Đồng nghiệp B"
    assert updated_payee["isFavorite"] is False
    log("   -> Cập nhật nickname và trạng thái yêu thích thành công.")

    # 1.4 Test Validation: Chặn tự lưu chính mình (400)
    log("1.4. Kiểm tra chặn tự lưu số điện thoại của chính mình (400 Bad Request)...")
    status, err = do_request("POST", f"/payees/{user_a_id}", {
        "payeePhone": user_a_phone,
        "nickname": "Chính tôi"
    })
    assert status == 400, f"Expected 400, got {status}: {err}"
    log("   -> Chặn tự lưu chính mình chính xác (400 Bad Request).")

    # 1.5 Test Validation: Chặn lưu trùng số điện thoại (409 Conflict)
    log("1.5. Kiểm tra chặn lưu trùng số điện thoại đã có (409 Conflict)...")
    status, err = do_request("POST", f"/payees/{user_a_id}", {
        "payeePhone": user_b_phone
    })
    assert status == 409, f"Expected 409, got {status}: {err}"
    log("   -> Chặn lưu trùng chính xác (409 Conflict).")

    # 1.6 Thực hiện chuyển tiền thật và kiểm tra tự động cập nhật lastTransferredAt
    log("1.6. Chuyển tiền từ A sang B và kiểm tra cập nhật lastTransferredAt tự động...")
    status, tx_res = do_request("POST", "/transfers", {
        "fromUserId": user_a_id,
        "toPhone": user_b_phone,
        "amount": 50000,
        "stepUpConfirmed": False
    })
    assert status == 200, f"Transfer failed: {tx_res}"

    status, payees = do_request("GET", f"/payees/{user_a_id}")
    assert status == 200
    assert payees[0]["lastTransferredAt"] is not None
    log(f"   -> lastTransferredAt được tự động cập nhật chính xác: {payees[0]['lastTransferredAt']}")

    # 1.7 Xoá người thụ hưởng khỏi danh bạ
    log("1.7. Xoá người thụ hưởng (DELETE /payees/{userA}/{id})...")
    status, _ = do_request("DELETE", f"/payees/{user_a_id}/{payee_id}")
    assert status == 204
    status, payees = do_request("GET", f"/payees/{user_a_id}")
    assert len(payees) == 0
    log("   -> Xoá thành công, danh bạ trống sạch.")

    # ========================================================
    # PHẦN 2: ISSUE #31 - CHUYỂN TIỀN ĐỊNH KỲ (RECURRING TRANSFERS)
    # ========================================================
    log("\n--- [ISSUE #31] KIỂM THỬ LẬP LỊCH CHUYỂN TIỀN ĐỊNH KỲ (RECURRING TRANSFERS) ---")

    today = date.today()
    today_dow = today.isoweekday() # 1=Mon, 7=Sun
    today_str = today.isoformat()

    # 2.1 Tạo lịch chuyển tiền định kỳ: Hàng tuần vào đúng thứ của hôm nay (nextExecutionDate == today)
    log(f"2.1. Tạo lịch chuyển tiền định kỳ hàng tuần vào Thứ {today_dow} (hôm nay: {today_str})...")
    status, sched = do_request("POST", "/recurring-transfers", {
        "senderId": user_a_id,
        "recipientPhone": user_b_phone,
        "amount": 75000,
        "message": "Tiền tiêu vặt định kỳ",
        "frequency": "WEEKLY",
        "executionDay": today_dow,
        "startDate": today_str
    })
    assert status == 201, f"Expected 201 Created, got {status}: {sched}"
    sched_id = sched["id"]
    assert sched["status"] == "ACTIVE"
    assert sched["nextExecutionDate"] == today_str
    log(f"   -> Lịch đã tạo thành công với ID {sched_id}, nextExecutionDate = {sched['nextExecutionDate']}.")

    # 2.2 Trigger chạy scheduler lần 1 (Happy path)
    log("2.2. Kích hoạt trigger chạy scheduler (POST /recurring-transfers/trigger-run)...")
    status, summary = do_request("POST", "/recurring-transfers/trigger-run")
    assert status == 200, f"Trigger run failed: {summary}"
    log(f"   -> Kết quả scheduler: scanned={summary['scannedCount']}, success={summary['successCount']}, failed={summary['failedCount']}, skipped={summary['skippedCount']}")
    assert summary["successCount"] >= 1

    # Kiểm tra log thực thi
    status, logs = do_request("GET", f"/recurring-transfers/{sched_id}/logs")
    assert status == 200
    assert len(logs) >= 1
    assert logs[0]["status"] == "SUCCESS"
    assert logs[0]["amount"] == 75000.0
    log("   -> Log thực thi ghi nhận trạng thái SUCCESS khớp 100%!")

    # Kiểm tra lịch đã được dời sang chu kỳ kế tiếp (nextExecutionDate = today + 7)
    status, sched_list = do_request("GET", f"/recurring-transfers?senderId={user_a_id}")
    assert status == 200
    cur_sched = [s for s in sched_list if s["id"] == sched_id][0]
    assert cur_sched["lastExecutionDate"] == today_str
    assert cur_sched["nextExecutionDate"] > today_str
    log(f"   -> lastExecutionDate = {cur_sched['lastExecutionDate']}, nextExecutionDate đã dời sang {cur_sched['nextExecutionDate']}.")

    # 2.3 Kiểm tra tính Idempotent (chạy lại trigger trong cùng ngày không trừ tiền lặp lại)
    log("2.3. Kiểm tra tính Idempotent: chạy trigger lần 2 trong cùng ngày...")
    status, summary2 = do_request("POST", "/recurring-transfers/trigger-run")
    assert status == 200
    # Lịch vừa chạy đã có nextExecutionDate > today nên không bị quét hoặc bị skip
    status, logs_after = do_request("GET", f"/recurring-transfers/{sched_id}/logs")
    assert len(logs_after) == len(logs), "Không được có thêm log hay chuyển tiền lặp!"
    log("   -> Tuyệt đối không bị chuyển tiền lần 2 trong cùng ngày (Đảm bảo Idempotency).")

    # 2.4 Kiểm tra xử lý an toàn khi số dư không đủ (FAILED_INSUFFICIENT_FUNDS)
    log("2.4. Kiểm tra khi số dư không đủ (lịch chuyển 500.000.000đ)...")
    status, huge_sched = do_request("POST", "/recurring-transfers", {
        "senderId": user_a_id,
        "recipientPhone": user_b_phone,
        "amount": 9000000, # 9M < 10M (chưa chạm step-up, nhưng lớn hơn số dư còn lại ~875k)
        "message": "Chuyển số tiền lớn vượt số dư",
        "frequency": "WEEKLY",
        "executionDay": today_dow,
        "startDate": today_str
    })
    assert status == 201
    huge_sched_id = huge_sched["id"]

    status, summary_huge = do_request("POST", "/recurring-transfers/trigger-run")
    assert status == 200
    assert summary_huge["failedCount"] >= 1

    status, huge_logs = do_request("GET", f"/recurring-transfers/{huge_sched_id}/logs")
    assert status == 200
    assert len(huge_logs) >= 1
    assert huge_logs[0]["status"] == "FAILED_INSUFFICIENT_FUNDS"
    log(f"   -> Ghi nhận chính xác lỗi FAILED_INSUFFICIENT_FUNDS: {huge_logs[0]['errorMessage']}")

    # 2.5 Kiểm tra Ràng buộc Step-Up #15 (> 10.000.000đ)
    log("2.5. Kiểm tra ràng buộc Step-Up QĐ 2345 (> 10.000.000đ -> FAILED_STEP_UP_REQUIRED)...")
    status, stepup_sched = do_request("POST", "/recurring-transfers", {
        "senderId": user_a_id,
        "recipientPhone": user_b_phone,
        "amount": 15000000, # 15M > 10M
        "message": "Chuyển vượt ngưỡng 10M",
        "frequency": "WEEKLY",
        "executionDay": today_dow,
        "startDate": today_str
    })
    assert status == 201
    stepup_sched_id = stepup_sched["id"]

    status, summary_stepup = do_request("POST", "/recurring-transfers/trigger-run")
    assert status == 200
    assert summary_stepup["failedCount"] >= 1

    status, stepup_logs = do_request("GET", f"/recurring-transfers/{stepup_sched_id}/logs")
    assert status == 200
    assert len(stepup_logs) >= 1
    assert stepup_logs[0]["status"] == "FAILED_STEP_UP_REQUIRED"
    log(f"   -> Chặn an toàn chính xác với FAILED_STEP_UP_REQUIRED: {stepup_logs[0]['errorMessage']}")

    # 2.6 Kiểm tra Tạm dừng (PAUSED) và Huỷ bỏ (CANCELLED)
    log("2.6. Kiểm tra tạm dừng lịch chuyển tiền (PUT /recurring-transfers/{id}/status)...")
    status, paused = do_request("PUT", f"/recurring-transfers/{sched_id}/status", {
        "status": "PAUSED"
    })
    assert status == 200
    assert paused["status"] == "PAUSED"
    log("   -> Chuyển trạng thái sang PAUSED thành công.")

    log("\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP ISSUES #31 & #32 ĐÃ VƯỢT QUA 100%! ===")

if __name__ == "__main__":
    run_tests()
