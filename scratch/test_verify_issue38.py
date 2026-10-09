import urllib.request
import urllib.parse
import urllib.error
import json
import uuid
import concurrent.futures
import time

INGRESS_HOST = "127.0.0.1"
INGRESS_PORT = 18080
BASE_URL = f"http://{INGRESS_HOST}:{INGRESS_PORT}"

def log(msg):
    print(f"[TEST Issue #38] {msg}")

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

def create_user(name):
    phone = f"09{uuid.uuid4().int % 100000000:08d}"
    status, user = do_request("POST", "/users/register", {
        "phone": phone,
        "name": name
    })
    assert status == 201, f"Failed to register user: {user}"
    return user["id"]

def run_tests():
    log("=== BẮT ĐẦU KIỂM THỬ ĐỘC LẬP ISSUE #38: NHIỆM VỤ & ĐIỂM DANH HÀNG NGÀY ===")

    # 1. Tạo test user
    log("1. Tạo tài khoản người dùng kiểm thử...")
    user_id = create_user("Gamification User")
    log(f"   -> Tạo thành công user {user_id}")

    # 2. Tra cứu trạng thái ban đầu
    log("2. Kiểm tra trạng thái điểm danh ban đầu (GET /loyalty/check-in/status)...")
    status, checkin_status = do_request("GET", f"/loyalty/check-in/status?userId={user_id}")
    assert status == 200, f"Expected 200, got {status}: {checkin_status}"
    assert checkin_status["checkedInToday"] is False
    assert checkin_status["currentStreakDay"] == 1
    log(f"   -> Chưa điểm danh hôm nay, streak kế tiếp: ngày {checkin_status['currentStreakDay']}/7")

    # Tra cứu số điểm ban đầu
    status, initial_loyalty = do_request("GET", f"/loyalty/{user_id}")
    assert status == 200
    initial_points = initial_loyalty["pointsBalance"]
    log(f"   -> Điểm loyalty ban đầu: {initial_points}")

    # 3. Thực hiện điểm danh ngày 1
    log("3. Thực hiện điểm danh ngày đầu tiên (POST /loyalty/check-in)...")
    status, checkin_res = do_request("POST", "/loyalty/check-in", {"userId": user_id})
    assert status == 200, f"Expected 200, got {status}: {checkin_res}"
    assert checkin_res["streakDay"] == 1
    assert checkin_res["pointsAwarded"] == 5
    log(f"   -> Điểm danh ngày 1 thành công! Thưởng: {checkin_res['pointsAwarded']} điểm, Streak: {checkin_res['streakDay']}")

    # Kiểm tra điểm đã được cộng
    status, updated_loyalty = do_request("GET", f"/loyalty/{user_id}")
    assert status == 200
    assert updated_loyalty["pointsBalance"] == initial_points + 5, f"Expected {initial_points + 5}, got {updated_loyalty['pointsBalance']}"
    log(f"   -> Điểm loyalty sau khi điểm danh: {updated_loyalty['pointsBalance']} (tăng đúng 5 điểm)")

    # Kiểm tra lại trạng thái sau khi đã điểm danh
    status, checkin_status2 = do_request("GET", f"/loyalty/check-in/status?userId={user_id}")
    assert status == 200
    assert checkin_status2["checkedInToday"] is True
    assert checkin_status2["currentStreakDay"] == 1
    log("   -> Trạng thái check-in cập nhật chính xác: checkedInToday = True, streak = 1")

    # 4. Thử điểm danh lại lần thứ 2 trong cùng ngày -> 409 Conflict
    log("4. Kiểm tra chặn điểm danh trùng lặp trong cùng ngày...")
    status, duplicate_res = do_request("POST", "/loyalty/check-in", {"userId": user_id})
    assert status == 409, f"Expected 409 Conflict, got {status}: {duplicate_res}"
    log(f"   -> Bị từ chối chính xác với HTTP 409 Conflict: {duplicate_res}")

    # 5. Kiểm tra danh sách nhiệm vụ hàng ngày (GET /loyalty/missions)
    log("5. Kiểm tra danh sách nhiệm vụ hàng ngày (GET /loyalty/missions)...")
    status, missions = do_request("GET", f"/loyalty/missions?userId={user_id}")
    assert status == 200, f"Expected 200, got {status}: {missions}"
    assert len(missions) >= 3, f"Expected >= 3 missions, got {len(missions)}"
    mission_codes = [m["code"] for m in missions]
    log(f"   -> Danh sách nhiệm vụ sẵn sàng: {mission_codes}")
    assert "DAILY_TRANSFER" in mission_codes
    assert "DAILY_BILL" in mission_codes
    assert "DAILY_SAVINGS" in mission_codes

    # 6. Concurrency Race Test: 10 luồng điểm danh đồng thời cho cùng 1 user mới
    log("6. Concurrency Race Test: 10 luồng bắn POST /loyalty/check-in đồng thời cho 1 user mới...")
    race_user_id = create_user("Race Checkin User")

    def attempt_checkin(thread_idx):
        st, _ = do_request("POST", "/loyalty/check-in", {"userId": race_user_id})
        return st

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_checkin, i) for i in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for r in results if r == 200)
    conflict_count = sum(1 for r in results if r == 409)
    log(f"   -> Kết quả 10 luồng đồng thời: {success_count} thành công (200), {conflict_count} xung đột (409). Chi tiết: {results}")

    assert success_count == 1, f"Expected exactly 1 success, got {success_count}"
    assert conflict_count == 9, f"Expected exactly 9 conflicts, got {conflict_count}"

    # Kiểm tra điểm của race user chỉ được cộng đúng 1 lần (5 điểm)
    status, race_loyalty = do_request("GET", f"/loyalty/{race_user_id}")
    assert race_loyalty["pointsBalance"] == 5, f"Expected exactly 5 points, got {race_loyalty['pointsBalance']}"
    log("   -> Điểm thưởng tuyệt đối chỉ được trao 1 lần duy nhất (5 điểm)! Chống double-check-in 100%!")

    log("=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP CHO ISSUE #38 ĐÃ VƯỢT QUA 100% ===")

if __name__ == "__main__":
    run_tests()
