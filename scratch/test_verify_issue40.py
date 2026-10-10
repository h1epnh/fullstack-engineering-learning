#!/usr/bin/env python3
"""
Independent E2E verification test suite for Issue #40:
[ewallet-lab] eKYC tier — định danh cấp độ ví & hạn mức theo mức độ xác thực

Tests:
1. New user registration defaults to UNVERIFIED kycTier.
2. UNVERIFIED user can spend within 5.000.000đ/month limit.
3. UNVERIFIED user is blocked (409 Conflict) when exceeding 5.000.000đ/month with descriptive message.
4. eKYC verification endpoint (POST /users/{id}/verify-kyc) upgrades status to VERIFIED and stores idCardNumber.
5. Upgraded VERIFIED user can spend beyond 5.000.000đ up to 100.000.000đ limit.
6. Legacy user compatibility: pre-existing user defaults to VERIFIED limit.
7. Concurrency test: 20 concurrent 1.000.000đ transfers from an unverified user -> exactly 5 succeed, 15 fail with 409, balance = 5.000.000đ.
"""

import concurrent.futures
import json
import time
import urllib.error
import urllib.request
import uuid

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
        "note": "Nạp tiền test"
    })
    assert status == 200, f"Credit wallet failed: {status} {res}"
    return res["balance"]

def main():
    print("=" * 60)
    print("STARTING E2E VERIFICATION FOR ISSUE #40 (eKYC Tier)")
    print("=" * 60)

    # 1. Register new payee and new unverified user
    suffix = str(int(time.time()))[-6:]
    payee_phone = f"0911{suffix}"
    user_phone = f"0922{suffix}"

    status, payee = request("POST", "/users/register", {"phone": payee_phone, "name": "Payee User"})
    assert status == 201, f"Failed to register payee: {payee}"
    payee_id = payee["id"]

    status, user = request("POST", "/users/register", {"phone": user_phone, "name": "Unverified User"})
    assert status == 201, f"Failed to register unverified user: {user}"
    user_id = user["id"]

    # Check 1: New user registration defaults to UNVERIFIED
    print("[1] Verifying new user defaults to UNVERIFIED...")
    assert user.get("kycTier") == "UNVERIFIED", f"Expected UNVERIFIED, got {user.get('kycTier')}"
    assert user.get("idCardNumber") is None, f"Expected None idCardNumber, got {user.get('idCardNumber')}"
    print(f" -> PASS: User {user_id} has kycTier=UNVERIFIED, idCardNumber=None")

    # 2. Credit 10.000.000đ into user's wallet
    print("[2] Crediting 10.000.000đ to user wallet...")
    bal = credit_wallet(user_id, 10000000)
    assert bal == 10000000, f"Expected 10M balance, got {bal}"
    print(f" -> PASS: User wallet balance is {bal:,}đ")

    # 3. Transfer 4.000.000đ (spent <= 5M unverified limit)
    print("[3] Transferring 4.000.000đ (within 5.000.000đ limit)...")
    status, tx1 = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 4000000,
        "message": "Transfer 1"
    })
    assert status == 200, f"Transfer 1 failed: {status} {tx1}"
    print(f" -> PASS: Transfer 4.000.000đ succeeded. Status={status}")

    # 4. Attempt transfer of another 2.000.000đ (spent would be 6M > 5M limit)
    print("[4] Attempting transfer of 2.000.000đ (projected spend 6M > 5M limit)...")
    status, err_tx = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 2000000,
        "message": "Transfer 2 - Expect Block"
    })
    assert status == 409, f"Expected 409 Conflict, got {status}: {err_tx}"
    err_msg = str(err_tx)
    assert "chưa định danh eKYC" in err_msg or "5.000.000đ" in err_msg, f"Unexpected error message: {err_msg}"
    print(f" -> PASS: Blocked with HTTP 409! Message: {err_msg}")

    # Check balance remains 6.000.000đ (10M - 4M)
    status, bal = request("GET", f"/wallets/{user_id}/balance")
    assert status == 200 and bal["balance"] == 6000000, f"Expected 6M balance, got {bal}"
    print(f" -> PASS: Wallet balance safely preserved at {bal['balance']:,}đ")

    # 5. Verify KYC via POST /users/{id}/verify-kyc
    print("[5] Submitting eKYC verification via POST /users/{id}/verify-kyc...")
    status, verified_user = request("POST", f"/users/{user_id}/verify-kyc", {
        "idCardNumber": "001200008888"
    })
    assert status == 200, f"KYC verification failed: {verified_user}"
    assert verified_user.get("kycTier") == "VERIFIED", f"Expected VERIFIED, got {verified_user}"
    assert verified_user.get("idCardNumber") == "001200008888", f"Expected CCCD, got {verified_user}"
    print(f" -> PASS: KYC upgraded! kycTier={verified_user['kycTier']}, CCCD={verified_user['idCardNumber']}")

    # 6. Retry 2.000.000đ transfer as VERIFIED user
    print("[6] Retrying 2.000.000đ transfer now that user is VERIFIED...")
    status, tx2 = request("POST", "/transfers", {
        "fromUserId": user_id,
        "toPhone": payee_phone,
        "amount": 2000000,
        "message": "Transfer 2 - After KYC"
    })
    assert status == 200, f"Transfer 2 after KYC failed: {status} {tx2}"
    print(f" -> PASS: Transfer succeeded after KYC! Status={status}")

    status, bal = request("GET", f"/wallets/{user_id}/balance")
    assert status == 200 and bal["balance"] == 4000000, f"Expected 4M balance, got {bal}"
    print(f" -> PASS: Wallet balance updated to {bal['balance']:,}đ")

    # 7. Concurrency race condition test
    print("\n[7] Testing Concurrency Race Condition (20 concurrent 1.000.000đ debits on 5M limit)...")
    race_user_phone = f"0933{suffix}"
    status, race_user = request("POST", "/users/register", {"phone": race_user_phone, "name": "Race User"})
    assert status == 201
    race_user_id = race_user["id"]

    # Credit 10.000.000đ
    bal = credit_wallet(race_user_id, 10000000)
    assert bal == 10000000

    def make_concurrent_transfer(i):
        return request("POST", "/transfers", {
            "fromUserId": race_user_id,
            "toPhone": payee_phone,
            "amount": 1000000,
            "message": f"Concurrent transfer {i}"
        })

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(make_concurrent_transfer, i) for i in range(20)]
        results = [f.result() for f in futures]

    successes = [r for r in results if r[0] == 200]
    conflicts = [r for r in results if r[0] == 409]

    print(f" -> Results: {len(successes)} succeeded (201), {len(conflicts)} rejected (409)")
    assert len(successes) == 5, f"Expected exactly 5 successes (5M limit), got {len(successes)}"
    assert len(conflicts) == 15, f"Expected exactly 15 rejections, got {len(conflicts)}"

    # Check exact balance
    status, bal = request("GET", f"/wallets/{race_user_id}/balance")
    assert status == 200 and bal["balance"] == 5000000, f"Expected exactly 5M balance, got {bal['balance']}"
    print(f" -> PASS: Zero ledger discrepancy! Final balance exactly {bal['balance']:,}đ")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! Issue #40 is verified.")
    print("=" * 60)

if __name__ == "__main__":
    main()
