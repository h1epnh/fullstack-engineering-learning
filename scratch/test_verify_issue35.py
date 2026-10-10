#!/usr/bin/env python3
"""
Kiểm thử độc lập End-to-End cho Issue #35:
[ewallet-lab] Bảo hiểm vi mô (Micro-insurance: Xe máy TNDS, Tai nạn cá nhân)
Chạy trực tiếp qua Ingress cổng 18080 (api.ewallet-lab.local).
"""

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
    
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8")
            status = resp.status
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            return status, parsed
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = content
        return e.code, parsed

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def create_user(prefix="user"):
    phone = "09" + "".join([str(random.randint(0, 9)) for _ in range(8)])
    status, res = do_request("POST", "/users/register", {
        "phone": phone,
        "name": f"Nguyen Van {prefix.title()}"
    })
    assert status == 201, f"Register failed: {status} {res}"
    return res["id"], phone

def credit_wallet(user_id, amount):
    status, res = do_request("POST", f"/wallets/{user_id}/credit", {
        "amount": amount,
        "type": "TOPUP",
        "reference": "INIT_TEST",
        "note": "Nạp tiền test"
    })
    assert status == 200, f"Credit wallet failed: {status} {res}"
    return res["balance"]

def get_wallet_balance(user_id):
    status, res = do_request("GET", f"/wallets/{user_id}/balance")
    assert status == 200, f"Get wallet failed: {status} {res}"
    return res["balance"]

def test_verify_issue35():
    log("=== Starting Issue #35 Verification Suite ===")

    # 1. Product Catalog
    log("1. Testing GET /insurance/products...")
    status, products = do_request("GET", "/insurance/products")
    assert status == 200, f"Expected 200, got {status}: {products}"
    assert len(products) == 2, f"Expected 2 products, got {len(products)}"
    product_codes = [p["productCode"] for p in products]
    assert "MOTORCYCLE_TNDS" in product_codes, "Missing MOTORCYCLE_TNDS"
    assert "PERSONAL_ACCIDENT_BASIC" in product_codes, "Missing PERSONAL_ACCIDENT_BASIC"
    
    tnds = next(p for p in products if p["productCode"] == "MOTORCYCLE_TNDS")
    assert tnds["premiumAmount"] == 66000, f"Expected 66,000, got {tnds['premiumAmount']}"
    assert tnds["requiresVehiclePlate"] is True
    
    accident = next(p for p in products if p["productCode"] == "PERSONAL_ACCIDENT_BASIC")
    assert accident["premiumAmount"] == 30000, f"Expected 30,000, got {accident['premiumAmount']}"
    assert accident["requiresVehiclePlate"] is False
    log("  Catalog validated successfully.", "PASS")

    # 2. Setup User A with 1,000,000 VND
    user_a_id, phone_a = create_user("A")
    log(f"2. User A registered: phone={phone_a}, id={user_a_id}")
    bal = credit_wallet(user_a_id, 1000000)
    assert bal == 1000000, f"Expected 1,000,000, got {bal}"
    log(f"  User A funded with 1,000,000 VND", "PASS")

    # 3. Buy MOTORCYCLE_TNDS without vehiclePlate -> expect 400
    log("3. Testing MOTORCYCLE_TNDS purchase without vehiclePlate (validation check)...")
    status, err_resp = do_request("POST", "/insurance/policies", {
        "userId": user_a_id,
        "productCode": "MOTORCYCLE_TNDS",
        "insuredName": "Nguyen Van A",
        "insuredIdCard": "001200000001",
        "vehiclePlate": ""
    })
    assert status == 400, f"Expected 400 Bad Request, got {status}: {err_resp}"
    log(f"  Correctly rejected with 400: {err_resp}", "PASS")

    # 4. Buy MOTORCYCLE_TNDS with valid vehiclePlate
    log("4. Buying MOTORCYCLE_TNDS with plate 29A1-123.45...")
    status, policy_tnds = do_request("POST", "/insurance/policies", {
        "userId": user_a_id,
        "productCode": "MOTORCYCLE_TNDS",
        "insuredName": "Nguyen Van A",
        "insuredIdCard": "001200000001",
        "vehiclePlate": "29A1-123.45"
    })
    assert status == 201, f"Expected 201 Created, got {status}: {policy_tnds}"
    assert policy_tnds["status"] == "ACTIVE"
    assert policy_tnds["certificateNumber"].startswith("BH-XM-"), f"Invalid cert format: {policy_tnds['certificateNumber']}"
    assert policy_tnds["premiumAmount"] == 66000
    assert policy_tnds["coverageAmount"] == 150000000
    assert policy_tnds["vehiclePlate"] == "29A1-123.45"
    log(f"  Policy created: {policy_tnds['certificateNumber']} (ID: {policy_tnds['id']})", "PASS")

    # Verify wallet debited by 66,000
    bal_after_tnds = get_wallet_balance(user_a_id)
    assert bal_after_tnds == 1000000 - 66000, f"Expected 934,000, got {bal_after_tnds}"
    log(f"  Wallet A balance debited correctly to {bal_after_tnds} VND", "PASS")

    # 5. Buy PERSONAL_ACCIDENT_BASIC
    log("5. Buying PERSONAL_ACCIDENT_BASIC...")
    status, policy_acc = do_request("POST", "/insurance/policies", {
        "userId": user_a_id,
        "productCode": "PERSONAL_ACCIDENT_BASIC",
        "insuredName": "Nguyen Van A",
        "insuredIdCard": "001200000001"
    })
    assert status == 201, f"Expected 201 Created, got {status}: {policy_acc}"
    assert policy_acc["status"] == "ACTIVE"
    assert policy_acc["certificateNumber"].startswith("BH-TN-"), f"Invalid cert format: {policy_acc['certificateNumber']}"
    assert policy_acc["premiumAmount"] == 30000
    assert policy_acc["coverageAmount"] == 20000000
    log(f"  Policy created: {policy_acc['certificateNumber']} (ID: {policy_acc['id']})", "PASS")

    # Verify wallet debited by 30,000
    bal_after_acc = get_wallet_balance(user_a_id)
    assert bal_after_acc == 1000000 - 66000 - 30000, f"Expected 904,000, got {bal_after_acc}"
    log(f"  Wallet A balance debited correctly to {bal_after_acc} VND", "PASS")

    # 6. Insufficient funds test with User B
    user_b_id, phone_b = create_user("B")
    log(f"6. Testing insufficient funds with User B ({phone_b}, id={user_b_id})...")
    credit_wallet(user_b_id, 10000)

    # Attempt to buy 66,000 VND policy
    status, err_b = do_request("POST", "/insurance/policies", {
        "userId": user_b_id,
        "productCode": "MOTORCYCLE_TNDS",
        "insuredName": "Le Van B",
        "insuredIdCard": "001200000002",
        "vehiclePlate": "30F-999.88"
    })
    assert status in (400, 409), f"Expected 400/409 Insufficient funds, got {status}: {err_b}"
    log(f"  Correctly rejected insufficient balance with HTTP {status}: {err_b}", "PASS")

    # Check User B balance remains 10,000
    bal_b = get_wallet_balance(user_b_id)
    assert bal_b == 10000
    log("  User B balance untouched at 10,000 VND", "PASS")

    # 7. Query User A policies
    log("7. Testing GET /insurance/policies?userId=...")
    status, user_policies = do_request("GET", f"/insurance/policies?userId={user_a_id}")
    assert status == 200
    assert len(user_policies) == 2, f"Expected 2 policies, got {len(user_policies)}"
    log(f"  Retrieved {len(user_policies)} policies for User A", "PASS")

    # 8. Query policy certificate
    log("8. Testing GET /insurance/policies/{id}/certificate...")
    tnds_id = policy_tnds["id"]
    status, cert = do_request("GET", f"/insurance/policies/{tnds_id}/certificate")
    assert status == 200
    assert cert["certificateNumber"] == policy_tnds["certificateNumber"]
    assert cert["insuredName"] == "Nguyen Van A"
    assert cert["vehiclePlate"] == "29A1-123.45"
    assert cert["status"] == "ACTIVE"
    log(f"  Certificate validated for {cert['certificateNumber']}", "PASS")

    # 9. Verify Frontend MFE bill payment is serving
    log("9. Testing Ingress route to mfe-bill-payment /remoteEntry.js...")
    status, _ = do_request("GET", "/remoteEntry.js", headers={"Host": "mfe-bill-payment.ewallet-lab.local"})
    assert status == 200, f"MFE returned {status}"
    log("  mfe-bill-payment /remoteEntry.js responded 200 OK from Ingress", "PASS")

    print("\n=======================================================")
    print("ALL 9/9 VERIFICATION CHECKS FOR ISSUE #35 PASSED CLEANLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    try:
        test_verify_issue35()
    except Exception as e:
        log(f"TEST FAILED: {e}", "FAIL")
        sys.exit(1)
