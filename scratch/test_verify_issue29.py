import urllib.request
import json
import uuid
import sys
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://127.0.0.1:18080"
HEADERS = {
    "Host": "api.ewallet-lab.local",
    "Content-Type": "application/json"
}

def http_req(method, path, body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            parsed = json.loads(content)
        except:
            parsed = {"raw": content}
        return e.code, parsed

def create_user_with_balance(name, phone, initial_balance):
    # 1. Create user
    random_phone = f"09{uuid.uuid4().int % 100000000:08d}"
    status, user = http_req("POST", "/users/register", {
        "phone": random_phone,
        "name": name
    })
    assert status == 201, f"Failed to register user: {user}"
    user_id = user["id"]
    
    # 2. Credit balance to wallet
    status, bal = http_req("POST", f"/wallets/{user_id}/credit", {
        "amount": initial_balance,
        "type": "TOPUP",
        "note": "Initial test balance",
        "stepUpConfirmed": False
    })
    assert status == 200, f"Failed to credit wallet: {bal}"
    return user_id, bal["balance"]

def run_tests():
    print("=== STARTING E2E VERIFICATION FOR ISSUE #29 (TELCO SERVICE) ===")
    
    # Test 1: GET /telco/packages
    print("\n--- Test 1: GET /telco/packages ---")
    status, packages = http_req("GET", "/telco/packages")
    assert status == 200, f"Expected 200, got {status}: {packages}"
    assert len(packages) == 18, f"Expected 18 packages, got {len(packages)}"
    print(f"SUCCESS: Retrieved {len(packages)} telco packages across Viettel, Vinaphone, Mobifone.")
    
    # Create test user with 500,000 VND
    user_id, initial_bal = create_user_with_balance("Nguyen Van Telco", "0987654321", 500000)
    print(f"Created test user {user_id} with initial balance: {initial_bal:,.0f} VND")
    
    # Test 2: DIRECT_TOPUP Viettel 50k (2% discount -> 49,000 VND)
    print("\n--- Test 2: DIRECT_TOPUP Viettel 50k ---")
    status, order1 = http_req("POST", "/telco/orders", {
        "userId": user_id,
        "telcoProvider": "VIETTEL",
        "orderType": "DIRECT_TOPUP",
        "denomination": 50000,
        "phoneNumber": "0981234567"
    })
    assert status == 201, f"Expected 201, got {status}: {order1}"
    assert order1["status"] == "COMPLETED", f"Order status is {order1['status']}"
    assert float(order1["finalPrice"]) == 49000.0, f"Final price expected 49000, got {order1['finalPrice']}"
    assert order1["phoneNumber"] == "0981234567"
    assert order1["pinCode"] is None
    
    # Verify wallet balance decreased by 49,000
    _, bal1 = http_req("GET", f"/wallets/{user_id}/balance")
    expected_bal = initial_bal - 49000
    assert float(bal1["balance"]) == expected_bal, f"Expected {expected_bal}, got {bal1['balance']}"
    print(f"SUCCESS: Direct top-up completed. Wallet debited: 49,000 VND. Current balance: {bal1['balance']:,.0f} VND")
    
    # Test 3: CARD_PIN Vinaphone 100k (2.5% discount -> 97,500 VND)
    print("\n--- Test 3: CARD_PIN Vinaphone 100k ---")
    status, order2 = http_req("POST", "/telco/orders", {
        "userId": user_id,
        "telcoProvider": "VINAPHONE",
        "orderType": "CARD_PIN",
        "denomination": 100000
    })
    assert status == 201, f"Expected 201, got {status}: {order2}"
    assert order2["status"] == "COMPLETED"
    assert float(order2["finalPrice"]) == 97500.0
    assert len(order2["pinCode"]) == 14, f"PIN length expected 14, got {len(order2['pinCode'])}"
    assert len(order2["serialNumber"]) == 12, f"Serial length expected 12, got {len(order2['serialNumber'])}"
    print(f"SUCCESS: Card PIN generated. PIN: {order2['pinCode']}, Serial: {order2['serialNumber']}")
    
    # Verify wallet balance
    _, bal2 = http_req("GET", f"/wallets/{user_id}/balance")
    expected_bal -= 97500
    assert float(bal2["balance"]) == expected_bal, f"Expected {expected_bal}, got {bal2['balance']}"
    print(f"SUCCESS: Wallet debited 97,500 VND. Current balance: {bal2['balance']:,.0f} VND")
    
    # Test 4: Lịch sử đơn hàng GET /telco/orders?userId=...
    print("\n--- Test 4: Query Order History ---")
    status, history = http_req("GET", f"/telco/orders?userId={user_id}")
    assert status == 200
    assert len(history) == 2, f"Expected 2 orders, got {len(history)}"
    print(f"SUCCESS: Order history retrieved ({len(history)} orders).")
    
    # Test 5: Simulated Gateway Failure & Compensating Refund
    print("\n--- Test 5: Simulated Failure & Compensating Refund (Phone 0900000000) ---")
    bal_before = float(bal2["balance"])
    status, order_fail = http_req("POST", "/telco/orders", {
        "userId": user_id,
        "telcoProvider": "VIETTEL",
        "orderType": "DIRECT_TOPUP",
        "denomination": 20000,
        "phoneNumber": "0900000000"
    })
    assert status == 200, f"Expected 200 for refunded order, got {status}: {order_fail}"
    assert order_fail["status"] == "FAILED_REFUNDED", f"Expected FAILED_REFUNDED, got {order_fail['status']}"
    assert "Thuê bao không tồn tại" in order_fail["failureReason"]
    
    # Verify wallet balance was fully refunded (net change = 0)
    _, bal_after = http_req("GET", f"/wallets/{user_id}/balance")
    assert float(bal_after["balance"]) == bal_before, f"Net balance mismatch! Before: {bal_before}, After: {bal_after['balance']}"
    print(f"SUCCESS: Failure triggered compensating refund. Balance conserved: {bal_after['balance']:,.0f} VND.")
    
    # Test 6: Validation Errors
    print("\n--- Test 6: Validation Errors ---")
    status, err_denom = http_req("POST", "/telco/orders", {
        "userId": user_id,
        "telcoProvider": "VIETTEL",
        "orderType": "CARD_PIN",
        "denomination": 15000
    })
    assert status == 400, f"Expected 400 for bad denomination, got {status}"
    
    status, err_phone = http_req("POST", "/telco/orders", {
        "userId": user_id,
        "telcoProvider": "VIETTEL",
        "orderType": "DIRECT_TOPUP",
        "denomination": 20000,
        "phoneNumber": "12345"
    })
    assert status == 400, f"Expected 400 for bad phone, got {status}"
    print("SUCCESS: Input validation properly rejected bad requests with HTTP 400.")
    
    # Test 7: Concurrency Race Test (10 concurrent purchases with limited balance)
    print("\n--- Test 7: Concurrency Race Test (10 concurrent threads) ---")
    # Create new user with exactly 100,000 VND
    race_user_id, _ = create_user_with_balance("Nguyen Van Race", "0912345678", 100000)
    # Card PIN Viettel 20,000 (finalPrice 19,600). 100,000 / 19,600 = exactly 5 cards allowed.
    card_price = 19600.0
    
    def buy_card():
        return http_req("POST", "/telco/orders", {
            "userId": race_user_id,
            "telcoProvider": "VIETTEL",
            "orderType": "CARD_PIN",
            "denomination": 20000
        })
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(buy_card) for _ in range(10)]
        results = [f.result() for f in futures]
    
    success_count = sum(1 for status, res in results if status == 201)
    conflict_count = sum(1 for status, res in results if status == 409)
    
    print(f"Race Test Results: Success: {success_count}, Conflict (Insufficient Balance): {conflict_count}")
    assert success_count == 5, f"Expected exactly 5 successes, got {success_count}"
    assert conflict_count == 5, f"Expected exactly 5 conflicts, got {conflict_count}"
    
    # Verify final balance is exactly 100,000 - 5 * 19,600 = 2,000 VND
    _, race_bal = http_req("GET", f"/wallets/{race_user_id}/balance")
    expected_race_bal = 100000 - 5 * card_price
    assert float(race_bal["balance"]) == expected_race_bal, f"Expected {expected_race_bal}, got {race_bal['balance']}"
    print(f"SUCCESS: Concurrency race test passed! Exactly 5 purchases succeeded. Remaining balance: {race_bal['balance']:,.0f} VND.")
    
    print("\n=======================================================")
    print("ALL VERIFICATION CHECKS PASSED FOR ISSUE #29 (TELCO SERVICE)!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
