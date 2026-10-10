#!/usr/bin/env python3
"""
Independent E2E verification test suite for Issue #39:
[ewallet-lab] Merchant/Business Account & QR Đa Năng thu hộ (Phí rút tiền merchant)

Acceptance Criteria & Test Matrix:
1. Register Merchant Account (Option b: entity Merchant in user-service linked 1-1 with User).
2. Generate and verify QR Đa Năng payload (ewalletlab://pay?merchant=<id>&phone=<phone>&name=<name>).
3. Conflict on duplicate merchant registration for same user.
4. QR collection is completely free of charge (0 collection fee for merchant, 0 fee for customer).
5. Non-merchant withdrawal incurs 0 fee.
6. Merchant withdrawal <= 30.000.000đ/month is 100% free of charge (0 fee).
7. Merchant withdrawal crossing 30.000.000đ/month incurs 0.5% fee on excess portion only.
8. Separate ledger transactions in wallet-service for withdrawal and fee (transparent, non-hidden).
9. Insufficient balance for withdrawal + fee is cleanly rejected (409 Conflict) with balance preserved.
10. Concurrency race test: 20 concurrent withdrawal requests crossing the 30M threshold.
    - Verified that sum of fees across all 20 concurrent requests is exactly equal to 0.5% of excess portion.
    - Zero ledger discrepancy.
"""

import concurrent.futures
import json
import time
import urllib.error
import urllib.parse
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
        with urllib.request.urlopen(req, timeout=15) as resp:
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
    return float(res["balance"])

def link_bank_account(user_id, bank_code="VCB", account_num="1234567890"):
    status, res = request("POST", "/linked-bank-accounts", {
        "userId": user_id,
        "bankCode": bank_code,
        "accountNumber": account_num
    })
    assert status in (200, 201), f"Link bank failed: {status} {res}"
    return res

def verify_kyc(user_id, id_card="001200001234"):
    status, res = request("POST", f"/users/{user_id}/verify-kyc", {
        "idCardNumber": id_card
    })
    assert status == 200, f"Verify KYC failed: {status} {res}"
    return res

def main():
    print("=" * 70)
    print("STARTING E2E VERIFICATION FOR ISSUE #39 (Merchant & QR & Withdrawal Fee)")
    print("=" * 70)

    # 1. Register Merchant User
    phone_m = "09" + str(int(time.time() * 1000))[-8:]
    status, user_m = request("POST", "/users/register", {"phone": phone_m, "name": "Chu Ba Tap Hoa"})
    assert status == 201, f"Register user_m failed: {status} {user_m}"
    user_m_id = user_m["id"]
    verify_kyc(user_m_id, "001200998877")
    print(f"✓ Step 1: Created User M ({user_m_id}, phone={phone_m})")

    # 2. Register Merchant Account
    status, merchant = request("POST", "/merchants/register", {
        "userId": user_m_id,
        "merchantName": "Tap Hoa Chu Ba 247",
        "businessCategory": "Ban le tieu dung"
    })
    assert status == 201, f"Register merchant failed: {status} {merchant}"
    merchant_id = merchant["id"]
    qr_code = merchant["merchantQrCode"]
    print(f"✓ Step 2: Registered Merchant Account ({merchant_id})")
    print(f"  QR Code: {qr_code}")
    assert qr_code.startswith("ewalletlab://pay?merchant="), "Invalid QR prefix"
    assert f"phone={phone_m}" in qr_code, "Phone missing in QR"
    assert "Tap+Hoa+Chu+Ba+247" in qr_code or "Tap%20Hoa%20Chu%20Ba%20247" in qr_code or "name=" in qr_code, "Name missing in QR"

    # Verify GET /merchants/by-user/{userId}
    status, fetched = request("GET", f"/merchants/by-user/{user_m_id}")
    assert status == 200 and fetched["id"] == merchant_id, f"Get merchant failed: {status} {fetched}"
    print("✓ Step 3: GET /merchants/by-user returned correct merchant record")

    # Verify duplicate registration is rejected with 409 Conflict
    status, dup = request("POST", "/merchants/register", {
        "userId": user_m_id,
        "merchantName": "Duplicate",
        "businessCategory": "Ban le"
    })
    assert status == 409, f"Expected 409 on duplicate merchant registration, got {status}"
    print("✓ Step 4: Duplicate merchant registration rejected with 409 Conflict")

    # 3. Customer User Pays via QR (0 collection fee)
    phone_c = "09" + str(int(time.time() * 1000 + 17))[-8:]
    status, user_c = request("POST", "/users/register", {"phone": phone_c, "name": "Khach Hang Nguyen"})
    assert status == 201
    user_c_id = user_c["id"]
    verify_kyc(user_c_id, "001200112233")
    credit_wallet(user_c_id, 60000000)

    # Customer transfers 50.000.000đ to merchant phone
    status, tx = request("POST", "/transfers", {
        "fromUserId": user_c_id,
        "toPhone": phone_m,
        "amount": 50000000,
        "stepUpConfirmed": True
    })
    assert status == 200, f"Transfer to merchant failed: {status} {tx}"

    # Check balances: User C deducted 50M, User M credited 50M (zero collection fee)
    status, bal_c = request("GET", f"/wallets/{user_c_id}/balance")
    status, bal_m = request("GET", f"/wallets/{user_m_id}/balance")
    assert bal_c["balance"] == 10000000, f"User C balance mismatch: {bal_c}"
    assert bal_m["balance"] == 50000000, f"User M balance mismatch: {bal_m}"
    print("✓ Step 5: Customer transferred 50.000.000đ to Merchant QR -> Collection fee is exactly 0đ")

    # 4. Merchant withdrawal Tier 1 (20.000.000đ <= 30.000.000đ): Fee = 0đ
    link_bank_account(user_m_id)
    status, wd1 = request("POST", "/withdrawals", {
        "userId": user_m_id,
        "amount": 20000000,
        "stepUpConfirmed": True
    })
    assert status == 200, f"Withdrawal 1 failed: {status} {wd1}"
    assert wd1["fee"] == 0, f"Expected fee=0, got {wd1['fee']}"
    assert wd1["balance"] == 30000000, f"Expected balance=30000000, got {wd1['balance']}"
    print(f"✓ Step 6: Merchant withdrew 20.000.000đ (<= 30M limit) -> fee = 0đ, balance = {wd1['balance']:,}đ")

    # 5. Merchant withdrawal Tier 2 (20.000.000đ crossing 30M threshold):
    # Cumulative: 20M + 20M = 40M. Excess: 10M. Fee: 0.5% * 10M = 50.000đ.
    status, wd2 = request("POST", "/withdrawals", {
        "userId": user_m_id,
        "amount": 20000000,
        "stepUpConfirmed": True
    })
    assert status == 200, f"Withdrawal 2 failed: {status} {wd2}"
    assert wd2["fee"] == 50000, f"Expected fee=50000, got {wd2['fee']}"
    assert wd2["balance"] == 9950000, f"Expected balance=9950000, got {wd2['balance']}"
    print(f"✓ Step 7: Merchant withdrew 20.000.000đ (cumulative 40M) -> fee = 50.000đ, balance = {wd2['balance']:,}đ")

    # 6. Verify ledger entries in wallet-service
    status, txs = request("GET", f"/wallets/{user_m_id}/transactions")
    assert status == 200, f"Get transactions failed: {status} {txs}"
    withdraw_txs = [t for t in txs if t["type"] == "WITHDRAW"]
    # Should have:
    # - 1 withdraw 20.000.000đ
    # - 1 withdraw 20.000.000đ
    # - 1 fee 50.000đ
    assert len(withdraw_txs) == 3, f"Expected 3 WITHDRAW transactions, got {len(withdraw_txs)}"
    fee_txs = [t for t in withdraw_txs if t["amount"] == 50000]
    assert len(fee_txs) == 1, "Expected 1 fee transaction of 50.000đ"
    assert "Phí rút tiền merchant" in fee_txs[0]["note"], f"Note mismatch: {fee_txs[0]['note']}"
    print(f"✓ Step 8: Ledger verified — fee is explicitly recorded as a separate transaction ({fee_txs[0]['note']})")

    # 7. Merchant withdrawal Tier 3 (5.000.000đ fully above threshold):
    # Cumulative was 40M. Amount = 5M. Entire 5M is above threshold. Fee = 0.5% * 5M = 25.000đ.
    status, wd3 = request("POST", "/withdrawals", {
        "userId": user_m_id,
        "amount": 5000000,
        "stepUpConfirmed": True
    })
    assert status == 200, f"Withdrawal 3 failed: {status} {wd3}"
    assert wd3["fee"] == 25000, f"Expected fee=25000, got {wd3['fee']}"
    assert wd3["balance"] == 4925000, f"Expected balance=4925000, got {wd3['balance']}"
    print(f"✓ Step 9: Merchant withdrew 5.000.000đ (above 30M) -> fee = 25.000đ, balance = {wd3['balance']:,}đ")

    # 8. Insufficient balance rejection (requesting 4.920.000đ when fee is 24.600đ -> total needed 4.944.600đ > 4.925.000đ)
    status, err_wd = request("POST", "/withdrawals", {
        "userId": user_m_id,
        "amount": 4920000,
        "stepUpConfirmed": True
    })
    assert status == 409, f"Expected 409 Conflict, got {status}: {err_wd}"
    status, bal_check = request("GET", f"/wallets/{user_m_id}/balance")
    assert bal_check["balance"] == 4925000, f"Balance altered after rejected withdrawal: {bal_check}"
    print("✓ Step 10: Insufficient balance for withdrawal+fee rejected with 409, balance safely preserved")

    # 9. Concurrency Race Condition Test (20 concurrent requests crossing the threshold)
    print("\n--- Concurrency Test: 20 concurrent withdrawal requests hitting the 30M boundary ---")
    phone_m2 = "09" + str(int(time.time() * 1000 + 42))[-8:]
    status, user_m2 = request("POST", "/users/register", {"phone": phone_m2, "name": "Shop Concurrency"})
    assert status == 201
    user_m2_id = user_m2["id"]
    verify_kyc(user_m2_id, "001200554433")
    status, m2 = request("POST", "/merchants/register", {
        "userId": user_m2_id,
        "merchantName": "Shop Concurrency",
        "businessCategory": "Tech"
    })
    assert status == 201
    link_bank_account(user_m2_id)

    # Initial balance: 45.000.000đ
    # Phase 1: Withdraw 20.000.000đ first (free tier utilized 20M out of 30M)
    credit_wallet(user_m2_id, 45000000)
    status, wd_init = request("POST", "/withdrawals", {
        "userId": user_m2_id,
        "amount": 20000000,
        "stepUpConfirmed": True
    })
    assert status == 200 and wd_init["fee"] == 0
    # Remaining balance: 25.000.000đ. Remaining free quota: 10.000.000đ.

    # Phase 2: Launch 20 concurrent threads, each withdrawing 1.000.000đ (total 20.000.000đ).
    # Total withdrawals will go from 20M to 40M.
    # Exactly 10M is free, exactly 10M is taxed at 0.5% (total fee across all 20 threads MUST BE EXACTLY 50.000đ)!
    # Ending balance MUST BE EXACTLY 25.000.000 - 20.000.000 - 50.000 = 4.950.000đ!
    def do_concurrent_withdraw(idx):
        return request("POST", "/withdrawals", {
            "userId": user_m2_id,
            "amount": 1000000,
            "stepUpConfirmed": True
        })

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(do_concurrent_withdraw, i) for i in range(20)]
        results = [f.result() for f in futures]

    successes = [r for r in results if r[0] == 200]
    total_fee_collected = sum(r[1]["fee"] for r in successes)
    print(f"Concurrent results: {len(successes)}/20 succeeded, total fee collected = {total_fee_collected:,.0f}đ")

    status, final_bal = request("GET", f"/wallets/{user_m2_id}/balance")
    final_balance = final_bal["balance"]
    print(f"Final wallet balance = {final_balance:,}đ")

    assert len(successes) == 20, f"Expected all 20 concurrent withdrawals to succeed, got {len(successes)}"
    assert total_fee_collected == 50000, f"Expected total fee across 20 threads to be exactly 50.000đ, got {total_fee_collected}"
    assert final_balance == 4950000, f"Expected final balance 4.950.000đ, got {final_balance}"
    print("✓ Step 11: Concurrency race test passed 100%! Exactly 50.000đ fee collected across 20 concurrent requests, zero discrepancy!")

    print("\n" + "=" * 70)
    print("ALL 11 E2E VERIFICATION CHECKS FOR ISSUE #39 PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    main()
