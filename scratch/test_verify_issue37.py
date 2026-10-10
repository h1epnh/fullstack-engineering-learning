#!/usr/bin/env python3
"""
Kiểm thử độc lập End-to-End cho Issue #37:
[ewallet-lab] Nguồn tiền thanh toán ưu tiên & Trả góp Ví Trả Sau (Payment Source Priority & BNPL)
Chạy trực tiếp qua Ingress cổng 18080 (api.ewallet-lab.local).
"""

import concurrent.futures
import json
import random
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE_URL = "http://localhost:18080"
HEADERS = {
    "Host": "api.ewallet-lab.local",
    "Content-Type": "application/json"
}

def do_request(method, path, body=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = dict(HEADERS)
    if headers:
        req_headers.update(headers)
    
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    elif method in ("POST", "PUT"):
        data = b"{}"
    else:
        data = None

    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
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
    except Exception as e:
        return 500, str(e)

def create_user(prefix="user"):
    phone = "09" + "".join([str(random.randint(0, 9)) for _ in range(8)])
    status, res = do_request("POST", "/users/register", {
        "phone": phone,
        "name": f"Nguyen Van {prefix.title()}"
    })
    assert status == 201, f"Register failed: {status} {res}"
    user_id = res["id"]
    return user_id, phone

def credit_wallet(user_id, amount):
    status, res = do_request("POST", f"/wallets/{user_id}/credit", {
        "amount": amount,
        "type": "TOPUP",
        "reference": "INIT_TEST",
        "note": "Nạp tiền test"
    })
    assert status == 200, f"Credit wallet failed: {status} {res}"
    return res["balance"]

def get_wallet(user_id):
    status, res = do_request("GET", f"/wallets/{user_id}/balance")
    assert status == 200, f"Get wallet failed: {status} {res}"
    return res

def get_bnpl(user_id):
    status, res = do_request("GET", f"/bnpl/{user_id}")
    assert status == 200, f"Get BNPL failed: {status} {res}"
    return res

def err_msg(res):
    return res.get('message', str(res)) if isinstance(res, dict) else str(res)

def open_bnpl(user_id):
    status, res = do_request("POST", f"/bnpl/{user_id}/open", {
        "acceptedDisclaimer": True
    })
    assert status == 200, f"Open BNPL failed: {status} {res}"
    return res

def main():
    print("[TEST Issue #37] === BẮT ĐẦU KIỂM THỬ ĐỘC LẬP NGUỒN TIỀN THANH TOÁN & VÍ TRẢ SAU (ISSUE #37) ===")

    # 1. Khởi tạo User A, nạp 2.000.000đ vào ví chính
    print("[TEST Issue #37] 1. Khởi tạo User A với 2.000.000đ ví chính...")
    user_a, phone_a = create_user("bnplA")
    credit_wallet(user_a, 2000000)
    w_init = get_wallet(user_a)
    assert float(w_init["balance"]) == 2000000.0, f"Số dư ví ban đầu sai: {w_init['balance']}"
    print(f"   -> User A: {user_a} ({phone_a}), số dư ví chính = 2.000.000đ")

    ts = int(time.time())
    cust_elec = f"PE{ts % 10000000:07d}"
    cust_water = f"PA{(ts + 1) % 10000000:07d}"
    cust_net = f"NET{(ts + 2) % 100000:05d}"
    cust_stepup = f"STEPUP_{ts % 1000000:06d}"

    # 2. Tra cứu hoá đơn điện
    print(f"[TEST Issue #37] 2. Tra cứu hoá đơn điện cho mã KH {cust_elec}...")
    status, bill = do_request("GET", f"/bills/lookup?category=ELECTRICITY&customerCode={cust_elec}")
    assert status == 200, f"Lookup bill failed: {status} {bill}"
    bill_amount = float(bill["amount"])
    print(f"   -> Số tiền hoá đơn: {bill_amount:,.0f}đ")

    # 3. Test thanh toán bằng BNPL_WALLET khi CHƯA MỞ Ví Trả Sau -> 400 Bad Request
    print("[TEST Issue #37] 3. Thử thanh toán hoá đơn bằng BNPL_WALLET khi chưa mở Ví Trả Sau...")
    status, res = do_request("POST", "/bills/pay", {
        "userId": user_a,
        "category": "ELECTRICITY",
        "customerCode": cust_elec,
        "paymentSource": "BNPL_WALLET"
    })
    assert status == 400, f"Mong đợi 400 Bad Request nhưng nhận {status}: {res}"
    print(f"   -> Chặn an toàn chính xác (400 Bad Request): {err_msg(res)}")
    w_check = get_wallet(user_a)
    assert float(w_check["balance"]) == 2000000.0, "Số dư ví chính bị thay đổi trái phép!"

    # 4. Mở Ví Trả Sau cho User A
    print("[TEST Issue #37] 4. Mở Ví Trả Sau cho User A...")
    bnpl_a = open_bnpl(user_a)
    assert bnpl_a["opened"] is True
    assert float(bnpl_a["availableLimit"]) == 20000000.0
    print(f"   -> Mở Ví Trả Sau thành công, hạn mức khả dụng: {float(bnpl_a['availableLimit']):,.0f}đ")

    # 5. Thanh toán hoá đơn bằng BNPL_WALLET
    print("[TEST Issue #37] 5. Thanh toán hoá đơn điện bằng BNPL_WALLET...")
    status, receipt = do_request("POST", "/bills/pay", {
        "userId": user_a,
        "category": "ELECTRICITY",
        "customerCode": cust_elec,
        "paymentSource": "BNPL_WALLET"
    })
    assert status == 200, f"Thanh toán BNPL thất bại: {status} {receipt}"
    assert receipt["paymentSource"] == "BNPL_WALLET", f"paymentSource sai: {receipt['paymentSource']}"
    assert float(receipt["amount"]) == bill_amount
    print(f"   -> Thanh toán thành công! Biên lai ghi nhận nguồn tiền: {receipt['paymentSource']}")

    # 5.1 Kiểm tra số dư ví chính và hạn mức BNPL sau thanh toán
    w_after = get_wallet(user_a)
    bnpl_after = get_bnpl(user_a)
    assert float(w_after["balance"]) == 2000000.0, f"Ví chính không được bị trừ! Hiện tại: {w_after['balance']}"
    expected_limit = 20000000.0 - bill_amount
    assert float(bnpl_after["availableLimit"]) == expected_limit, f"Hạn mức BNPL sai: {bnpl_after['availableLimit']} (kỳ vọng {expected_limit})"
    print(f"   -> Xác nhận: Ví chính giữ nguyên 100% ({float(w_after['balance']):,.0f}đ), BNPL bị trừ đúng {bill_amount:,.0f}đ còn {float(bnpl_after['availableLimit']):,.0f}đ!")

    # 6. Backward Compatibility: Thanh toán hoá đơn khác bằng MAIN_WALLET
    print(f"[TEST Issue #37] 6. Kiểm tra Backward Compatibility: Thanh toán nước {cust_water} bằng MAIN_WALLET...")
    status, water_bill = do_request("GET", f"/bills/lookup?category=WATER&customerCode={cust_water}")
    water_amount = float(water_bill["amount"])
    status, water_receipt = do_request("POST", "/bills/pay", {
        "userId": user_a,
        "category": "WATER",
        "customerCode": cust_water,
        "paymentSource": "MAIN_WALLET"
    })
    assert status == 200, f"Thanh toán MAIN_WALLET thất bại: {status} {water_receipt}"
    assert water_receipt["paymentSource"] == "MAIN_WALLET"
    w_water = get_wallet(user_a)
    bnpl_water = get_bnpl(user_a)
    assert float(w_water["balance"]) == 2000000.0 - water_amount, "Ví chính không bị trừ đúng số tiền nước!"
    assert float(bnpl_water["availableLimit"]) == expected_limit, "BNPL bị trừ nhầm khi thanh toán bằng ví chính!"
    print(f"   -> Thanh toán MAIN_WALLET hoàn hảo: Ví chính trừ {water_amount:,.0f}đ, BNPL hoàn toàn giữ nguyên!")

    # 7. Kiểm tra từ chối khi vượt hạn mức khả dụng BNPL
    print("[TEST Issue #37] 7. Kiểm tra từ chối khi vượt hạn mức khả dụng BNPL (409 Conflict)...")
    curr_limit = float(bnpl_water["availableLimit"])
    # Draw bớt gần hết hạn mức để chỉ còn lại 50.000đ
    draw_amount = int(curr_limit - 50000.0)
    status, draw_res = do_request("POST", f"/bnpl/wallets/{user_a}/draw", {
        "amount": draw_amount,
        "label": "Rút gần hết hạn mức"
    })
    assert status == 200, f"Draw BNPL failed: {status} {draw_res}"
    bnpl_low = get_bnpl(user_a)
    assert float(bnpl_low["availableLimit"]) == 50000.0
    print(f"   -> Đã giảm hạn mức BNPL còn {float(bnpl_low['availableLimit']):,.0f}đ")

    # Thử thanh toán hoá đơn internet (thường > 100.000đ)
    status, net_bill = do_request("GET", f"/bills/lookup?category=INTERNET&customerCode={cust_net}")
    net_amount = float(net_bill["amount"])
    assert net_amount > 50000.0
    status, res = do_request("POST", "/bills/pay", {
        "userId": user_a,
        "category": "INTERNET",
        "customerCode": cust_net,
        "paymentSource": "BNPL_WALLET"
    })
    assert status == 409, f"Mong đợi 409 Conflict nhưng nhận {status}: {res}"
    print(f"   -> Từ chối chính xác (409 Conflict): {err_msg(res)}")
    bnpl_final = get_bnpl(user_a)
    assert float(bnpl_final["availableLimit"]) == 50000.0, "Hạn mức bị thay đổi dù giao dịch thất bại!"

    # 8. Kiểm tra ràng buộc Step-Up QĐ 2345/QĐ-NHNN (> 10.000.000đ)
    print(f"[TEST Issue #37] 8. Kiểm tra ràng buộc Step-Up QĐ 2345/QĐ-NHNN (> 10.000.000đ) với {cust_stepup}...")
    user_b, phone_b = create_user("bnplB")
    open_bnpl(user_b)
    # Lookup hoá đơn với mã STEPUP_... -> 12.000.000đ
    status, high_bill = do_request("GET", f"/bills/lookup?category=ELECTRICITY&customerCode={cust_stepup}")
    assert status == 200
    assert float(high_bill["amount"]) == 12000000.0
    print(f"   -> Hoá đơn lớn 12.000.000đ tra cứu thành công.")

    # 8.1 Chưa xác thực Step-up -> 428 Precondition Required
    status, res = do_request("POST", "/bills/pay", {
        "userId": user_b,
        "category": "ELECTRICITY",
        "customerCode": cust_stepup,
        "paymentSource": "BNPL_WALLET",
        "stepUpConfirmed": False
    })
    assert status == 428, f"Mong đợi 428 Precondition Required nhưng nhận {status}: {res}"
    print(f"   -> Chặn Step-up chính xác (428 Precondition Required): {err_msg(res)}")
    bnpl_b = get_bnpl(user_b)
    assert float(bnpl_b["availableLimit"]) == 20000000.0, "BNPL bị trừ khi chưa qua Step-up!"

    # 8.2 Đã xác thực Step-up -> 200 OK
    status, res = do_request("POST", "/bills/pay", {
        "userId": user_b,
        "category": "ELECTRICITY",
        "customerCode": cust_stepup,
        "paymentSource": "BNPL_WALLET",
        "stepUpConfirmed": True
    })
    assert status == 200, f"Thanh toán Step-up thất bại: {status} {res}"
    bnpl_b_after = get_bnpl(user_b)
    assert float(bnpl_b_after["availableLimit"]) == 8000000.0
    print(f"   -> Xác nhận Step-up thành công, hạn mức còn: {float(bnpl_b_after['availableLimit']):,.0f}đ!")

    # 9. Concurrency Race Test trên hạn mức BNPL
    print("[TEST Issue #37] 9. Kiểm tra Concurrency Race Test trên hạn mức BNPL (5 luồng đồng thời)...")
    user_c, phone_c = create_user("bnplC")
    open_bnpl(user_c)
    # Rút 19.000.000đ để chỉ còn đúng 1.000.000đ
    status, _ = do_request("POST", f"/bnpl/wallets/{user_c}/draw", {
        "amount": 19000000,
        "label": "Rút chuẩn bị race test"
    })
    assert status == 200
    bnpl_c = get_bnpl(user_c)
    assert float(bnpl_c["availableLimit"]) == 1000000.0
    print(f"   -> User C có hạn mức còn lại: {float(bnpl_c['availableLimit']):,.0f}đ")

    # Tạo 5 mã KH khác nhau, mỗi mã có amount khoảng 400.000đ (hoặc tạo 5 customerCode để mỗi bill ~200k-400k)
    # Ta dùng 5 customer code khác nhau để không chạm unique constraint kỳ thanh toán
    test_codes = [f"RACE_CUST_{i}_{int(time.time())}" for i in range(5)]
    # Tra cứu số tiền của từng mã
    bills = []
    for code in test_codes:
        st, b = do_request("GET", f"/bills/lookup?category=ELECTRICITY&customerCode={code}")
        assert st == 200
        bills.append((code, float(b["amount"])))

    print(f"   -> 5 hoá đơn đồng thời có số tiền: {[f'{amt:,.0f}đ' for _, amt in bills]}")
    total_requested = sum(amt for _, amt in bills)
    print(f"   -> Tổng số tiền cần thanh toán: {total_requested:,.0f}đ (hạn mức chỉ có 1.000.000đ)")

    def send_pay(code):
        return do_request("POST", "/bills/pay", {
            "userId": user_c,
            "category": "ELECTRICITY",
            "customerCode": code,
            "paymentSource": "BNPL_WALLET"
        })

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(send_pay, [c for c, _ in bills]))

    successes = [r for r in results if r[0] == 200]
    conflicts = [r for r in results if r[0] == 409]
    print(f"   -> Kết quả: {len(successes)} thành công (200), {len(conflicts)} xung đột hạn mức (409)")
    assert len(successes) + len(conflicts) == 5, f"Có mã lỗi không mong đợi: {[r[0] for r in results]}"

    # Kiểm tra tính toàn vẹn số dư cuối
    bnpl_c_end = get_bnpl(user_c)
    final_limit = float(bnpl_c_end["availableLimit"])
    total_spent = sum(float(r[1]["amount"]) for r in successes)
    assert final_limit == 1000000.0 - total_spent, f"Lệch hạn mức: còn {final_limit}, đã chi {total_spent}"
    assert final_limit >= 0, f"Hạn mức bị âm: {final_limit}!"
    print(f"   -> Hạn mức BNPL cuối cùng: {final_limit:,.0f}đ, hoàn toàn khớp với tổng tiền đã duyệt ({total_spent:,.0f}đ).")
    print(f"   -> Tuyệt đối KHÔNG có hiện tượng over-limit hay race condition!")

    print("\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP ISSUE #37 ĐÃ VƯỢT QUA 100%! ===")

if __name__ == "__main__":
    main()
