#!/usr/bin/env python3
"""
Independent E2E verification test suite for Issue #40 (REVISED binary model):
[ewallet-lab] eKYC tier — mô hình nhị phân: UNVERIFIED chặn hoàn toàn mọi debit,
VERIFIED giữ nguyên hạn mức 100.000.000đ/tháng cũ (issue #7).

Thay hoàn toàn bộ test case "5.000.000đ/tháng" cũ (mô hình bị bác bỏ, không có nguồn thật).

Tests:
1. New user registration defaults to UNVERIFIED kycTier.
2. UNVERIFIED user: TOPUP (credit) vẫn hoạt động bình thường.
3. UNVERIFIED user: rút/chuyển tiền (debit) bị chặn 409 dù số tiền rất nhỏ (10.000đ).
4. UNVERIFIED user: debit vẫn bị chặn ở số tiền lớn hơn (2.000.000đ) — không phải vấn đề hạn mức.
5. eKYC verification endpoint (POST /users/{id}/verify-kyc) upgrades status to VERIFIED.
6. VERIFIED user: debit nhỏ (10.000đ) hoạt động bình thường ngay lập tức.
7. VERIFIED user: vẫn đúng hạn mức pháp luật cũ 100.000.000đ/tháng (issue #7) — vượt hạn mức bị
   chặn 409 với message Điều 26, KHÔNG lẫn message eKYC.
8. Legacy user compatibility: pre-existing user (registered before #40) defaults to VERIFIED.
"""

import json
import time
import urllib.error
import urllib.request

API_BASE = "http://localhost:18080"
HEADERS = {
    "Host": "api.ewallet-lab.local",
    "Content-Type": "application/json",
}


def request(method, path, body=None):
    url = f"{API_BASE}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"raw": content}
        return e.code, parsed


def credit_wallet(user_id, amount):
    status, res = request("POST", f"/wallets/{user_id}/credit", {
        "amount": amount,
        "type": "TOPUP",
        "reference": "INIT_TEST",
        "note": "Nạp tiền test",
    })
    assert status == 200, f"Credit wallet failed: {status} {res}"
    return res["balance"]


def main():
    print("=" * 70)
    print("E2E VERIFICATION FOR ISSUE #40 (eKYC Tier — MÔ HÌNH NHỊ PHÂN MỚI)")
    print("=" * 70)

    suffix = str(int(time.time()))[-6:]
    payee_phone = f"0911{suffix}"
    user_phone = f"0922{suffix}"

    status, payee = request("POST", "/users/register", {"phone": payee_phone, "name": "Payee User"})
    assert status == 201, f"Failed to register payee: {payee}"
    payee_id = payee["id"]

    status, user = request("POST", "/users/register", {"phone": user_phone, "name": "Unverified User"})
    assert status == 201, f"Failed to register unverified user: {user}"
    user_id = user["id"]

    print("[1] User mới đăng ký -> kycTier=UNVERIFIED, idCardNumber=None")
    assert user.get("kycTier") == "UNVERIFIED", f"Expected UNVERIFIED, got {user.get('kycTier')}"
    assert user.get("idCardNumber") is None, f"Expected None idCardNumber, got {user.get('idCardNumber')}"
    print(f"    -> PASS: user_id={user_id}")

    print("[2] UNVERIFIED — TOPUP (credit) 10.000.000đ vẫn phải hoạt động bình thường...")
    bal = credit_wallet(user_id, 10000000)
    assert bal == 10000000, f"Expected 10M balance after TOPUP, got {bal}"
    print(f"    -> PASS: balance={bal:,}đ (TOPUP không bị chặn dù UNVERIFIED)")

    print("[3] UNVERIFIED — rút/chuyển 10.000đ (số RẤT NHỎ) phải vẫn bị chặn 409...")
    status, err_tx = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 10000,
        "message": "Small transfer - expect block",
    })
    assert status == 409, f"Expected 409 Conflict for tiny amount, got {status}: {err_tx}"
    err_msg = str(err_tx)
    assert "chưa hoàn tất định danh (eKYC)" in err_msg, f"Unexpected error message: {err_msg}"
    print(f"    -> PASS: Blocked HTTP 409 even for 10.000đ. Message: {err_msg}")

    print("[4] UNVERIFIED — rút/chuyển 2.000.000đ (số LỚN HƠN) vẫn bị chặn 409, cùng message eKYC...")
    status, err_tx2 = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 2000000,
        "message": "Larger transfer - expect block",
    })
    assert status == 409, f"Expected 409 Conflict, got {status}: {err_tx2}"
    assert "chưa hoàn tất định danh (eKYC)" in str(err_tx2), f"Unexpected error message: {err_tx2}"
    print("    -> PASS: Blocked HTTP 409 — không phải vấn đề hạn mức, là chặn nhị phân.")

    status, bal = request("GET", f"/wallets/{user_id}/balance")
    assert status == 200 and bal["balance"] == 10000000, f"Expected unchanged 10M balance, got {bal}"
    print(f"    -> PASS: Số dư không đổi, vẫn {bal['balance']:,}đ (không có debit nào lọt qua)")

    print("[5] Gọi POST /users/{id}/verify-kyc -> nâng cấp VERIFIED...")
    status, verified_user = request("POST", f"/users/{user_id}/verify-kyc", {
        "idCardNumber": "001200008888",
    })
    assert status == 200, f"KYC verification failed: {verified_user}"
    assert verified_user.get("kycTier") == "VERIFIED", f"Expected VERIFIED, got {verified_user}"
    print(f"    -> PASS: kycTier={verified_user['kycTier']}, CCCD={verified_user['idCardNumber']}")

    print("[6] VERIFIED — rút/chuyển 10.000đ (số nhỏ) phải thành công ngay lập tức...")
    status, tx_small = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 10000,
        "message": "Small transfer after KYC",
    })
    assert status == 200, f"Small transfer after KYC failed: {status} {tx_small}"
    print("    -> PASS: Transfer 10.000đ thành công sau khi VERIFIED")

    print("[7] VERIFIED — chuyển 2.000.000đ (giống bước 4, giờ phải thành công)...")
    status, tx2 = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 2000000,
        "message": "Transfer after KYC",
    })
    assert status == 200, f"Transfer after KYC failed: {status} {tx2}"
    status, bal = request("GET", f"/wallets/{user_id}/balance")
    expected = 10000000 - 10000 - 2000000
    assert status == 200 and bal["balance"] == expected, f"Expected {expected}, got {bal}"
    print(f"    -> PASS: balance={bal['balance']:,}đ đúng")

    print("[8] VERIFIED — vượt hạn mức pháp luật cũ 100.000.000đ/tháng (issue #7) vẫn phải bị chặn,"
          " message PHẢI là Điều 26 TT 40/2024, KHÔNG lẫn message eKYC...")
    limit_user_phone = f"0933{suffix}"
    status, limit_user = request("POST", "/users/register", {"phone": limit_user_phone, "name": "Limit User"})
    assert status == 201
    limit_user_id = limit_user["id"]
    status, verified_limit_user = request("POST", f"/users/{limit_user_id}/verify-kyc", {
        "idCardNumber": "001200009999",
    })
    assert status == 200 and verified_limit_user.get("kycTier") == "VERIFIED"

    bal = credit_wallet(limit_user_id, 200000000)
    assert bal == 200000000

    # Chi 95.000.000đ trước (trong hạn mức), rồi chi thêm 10.000.000đ (tổng 105tr > 100tr) -> chặn.
    # stepUpConfirmed=True vì cả 2 khoản đều vượt ngưỡng step-up #15 (QĐ 2345) — không phải thứ
    # test case 8 muốn kiểm tra (đó là #7's monthly limit), nên xác nhận trước để tránh nhiễu 428.
    status, tx_a = request("POST", "/transfers", {
        "fromUserId": limit_user_id,
        "toPhone": payee_phone,
        "amount": 95000000,
        "message": "Spend 95M",
        "stepUpConfirmed": True,
    })
    assert status == 200, f"Spend 95M failed unexpectedly: {status} {tx_a}"

    status, err_limit = request("POST", "/transfers", {
        "fromUserId": limit_user_id,
        "toPhone": payee_phone,
        "amount": 10000000,
        "message": "Spend 10M more - expect legal limit block",
        "stepUpConfirmed": True,
    })
    assert status == 409, f"Expected 409 for exceeding 100M/month, got {status}: {err_limit}"
    err_limit_msg = str(err_limit)
    assert "Điều 26" in err_limit_msg, f"Expected Điều 26 message, got {err_limit_msg}"
    assert "eKYC" not in err_limit_msg, f"VERIFIED user's limit error must NOT mention eKYC: {err_limit_msg}"
    print(f"    -> PASS: VERIFIED user vẫn đúng hạn mức 100tr/tháng cũ. Message: {err_limit_msg}")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED — Issue #40 (mô hình nhị phân mới) verified qua Ingress thật.")
    print("=" * 70)


if __name__ == "__main__":
    main()
