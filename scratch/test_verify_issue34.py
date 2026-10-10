#!/usr/bin/env python3
"""
Kiểm thử độc lập End-to-End cho Issue #34:
[ewallet-lab] Thiệp mừng điện tử & Lì xì theo chủ đề (E-Cards & Themed Lucky Money)
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
    return res["id"], phone, f"Nguyen Van {prefix.title()}"

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

def test_verify_issue34():
    log("=== Starting Issue #34 Verification Suite ===")

    # 1. Templates Catalog
    log("1. Testing GET /gift-cards/templates...")
    status, templates = do_request("GET", "/gift-cards/templates")
    assert status == 200, f"Expected 200, got {status}: {templates}"
    assert len(templates) == 4, f"Expected 4 templates, got {len(templates)}"
    codes = [t["templateCode"] for t in templates]
    for code in ["BIRTHDAY_CHEER", "WEDDING_LOVE", "THANK_YOU_WARM", "CONGRATS_SUCCESS"]:
        assert code in codes, f"Missing template {code}"
    log(f"  Catalog validated with {len(templates)} templates: {codes}", "PASS")

    # 2. Setup Users
    log("2. Setting up test users...")
    user_a_id, phone_a, name_a = create_user("SenderA")
    user_b_id, phone_b, name_b = create_user("RecipientB")
    user_c_id, phone_c, name_c = create_user("IntruderC")

    bal_a = credit_wallet(user_a_id, 1000000)
    bal_b = get_wallet_balance(user_b_id)
    assert bal_a == 1000000
    assert bal_b == 0
    log(f"  User A ({phone_a}): {bal_a} VND; User B ({phone_b}): {bal_b} VND", "PASS")

    # 3. Validation: Self-sending
    log("3. Testing self-sending validation (User A -> User A)...")
    status, err_self = do_request("POST", "/gift-cards/send", {
        "senderId": user_a_id,
        "senderName": name_a,
        "recipientPhone": phone_a,
        "amount": 50000,
        "templateCode": "BIRTHDAY_CHEER",
        "customMessage": "Self test"
    })
    assert status == 400, f"Expected 400 Bad Request, got {status}: {err_self}"
    log("  Self-sending correctly rejected with 400", "PASS")

    # 4. Validation: Invalid template code
    log("4. Testing invalid templateCode rejection...")
    status, err_tpl = do_request("POST", "/gift-cards/send", {
        "senderId": user_a_id,
        "senderName": name_a,
        "recipientPhone": phone_b,
        "amount": 50000,
        "templateCode": "INVALID_TEMPLATE_XYZ",
        "customMessage": "Bad template"
    })
    assert status == 400, f"Expected 400 Bad Request, got {status}: {err_tpl}"
    log("  Invalid template rejected with 400", "PASS")

    # 5. Validation: Step-up above 10M VND (QĐ 2345/QĐ-NHNN)
    log("5. Testing Step-Up check for amounts > 10,000,000 VND...")
    status, err_stepup = do_request("POST", "/gift-cards/send", {
        "senderId": user_a_id,
        "senderName": name_a,
        "recipientPhone": phone_b,
        "amount": 15000000,
        "templateCode": "CONGRATS_SUCCESS",
        "customMessage": "Qua lon",
        "stepUpConfirmed": False
    })
    assert status == 428, f"Expected 428 Precondition Required, got {status}: {err_stepup}"
    log(f"  Correctly required Step-up with HTTP 428: {err_stepup}", "PASS")

    # 6. Insufficient funds test
    log("6. Testing insufficient funds with low-balance sender...")
    credit_wallet(user_c_id, 10000)
    status, err_funds = do_request("POST", "/gift-cards/send", {
        "senderId": user_c_id,
        "senderName": name_c,
        "recipientPhone": phone_b,
        "amount": 50000,
        "templateCode": "BIRTHDAY_CHEER",
        "customMessage": "Out of money"
    })
    assert status == 409, f"Expected 409 Conflict, got {status}: {err_funds}"
    bal_c_after = get_wallet_balance(user_c_id)
    assert bal_c_after == 10000, f"Balance changed: {bal_c_after}"
    log("  Insufficient funds rejected with 409, balance untouched", "PASS")

    # 7. Successful Gift Card Transfer
    log("7. Sending gift card (50,000 VND from User A to User B)...")
    wish = "Sinh nhat vui ve! Chuc ban luon tuoi tre va hanh phuc!"
    status, card = do_request("POST", "/gift-cards/send", {
        "senderId": user_a_id,
        "senderName": name_a,
        "recipientPhone": phone_b,
        "amount": 50000,
        "templateCode": "BIRTHDAY_CHEER",
        "customMessage": wish
    })
    assert status == 201, f"Expected 201 Created, got {status}: {card}"
    card_id = card["id"]
    assert card["status"] == "SENT"
    assert card["amount"] == 50000
    assert card["templateCode"] == "BIRTHDAY_CHEER"
    assert card["customMessage"] == wish
    assert card["openedAt"] is None
    log(f"  Gift card sent successfully: ID={card_id}", "PASS")

    # Check ledger balances
    bal_a_after = get_wallet_balance(user_a_id)
    bal_b_after = get_wallet_balance(user_b_id)
    assert bal_a_after == 1000000 - 50000, f"Expected 950,000, got {bal_a_after}"
    assert bal_b_after == 50000, f"Expected 50,000, got {bal_b_after}"
    log(f"  Ledger integrity confirmed: A = {bal_a_after} VND, B = {bal_b_after} VND", "PASS")

    # 8. Query received gift cards
    log("8. Testing GET /gift-cards/received?recipientUserId=...")
    status, received_list = do_request("GET", f"/gift-cards/received?recipientUserId={user_b_id}")
    assert status == 200
    assert len(received_list) >= 1
    found = next((c for c in received_list if c["id"] == card_id), None)
    assert found is not None
    assert found["status"] == "SENT"
    log("  User B received list contains the card with status SENT", "PASS")

    # 9. Query sent gift cards
    log("9. Testing GET /gift-cards/sent?senderId=...")
    status, sent_list = do_request("GET", f"/gift-cards/sent?senderId={user_a_id}")
    assert status == 200
    assert len(sent_list) >= 1
    found_sent = next((c for c in sent_list if c["id"] == card_id), None)
    assert found_sent is not None
    log("  User A sent list contains the card", "PASS")

    # 10. Open gift card permission & action
    log("10. Testing opening card (permission check + open action)...")
    # Intruder C attempts to open
    status, err_open = do_request("POST", f"/gift-cards/{card_id}/open", {
        "recipientUserId": user_c_id
    })
    assert status == 403, f"Expected 403 Forbidden, got {status}: {err_open}"
    log("  Intruder open attempt rejected with 403 Forbidden", "PASS")

    # Intended recipient B opens
    status, opened_card = do_request("POST", f"/gift-cards/{card_id}/open", {
        "recipientUserId": user_b_id
    })
    assert status == 200, f"Expected 200, got {status}: {opened_card}"
    assert opened_card["status"] == "OPENED"
    assert opened_card["openedAt"] is not None
    log(f"  Card opened successfully: openedAt={opened_card['openedAt']}", "PASS")

    # 11. Reply to gift card (Thank you message)
    log("11. Testing replying with thank-you note...")
    # Intruder C attempts to reply
    status, err_reply = do_request("POST", f"/gift-cards/{card_id}/reply", {
        "recipientUserId": user_c_id,
        "replyMessage": "Fake reply"
    })
    assert status == 403, f"Expected 403 Forbidden, got {status}: {err_reply}"
    log("  Intruder reply attempt rejected with 403 Forbidden", "PASS")

    # Recipient B replies
    thank_msg = "Cam on ban rat nhieu vi tam thiep va tien mung nhe!"
    status, replied_card = do_request("POST", f"/gift-cards/{card_id}/reply", {
        "recipientUserId": user_b_id,
        "replyMessage": thank_msg
    })
    assert status == 200, f"Expected 200, got {status}: {replied_card}"
    assert replied_card["replyMessage"] == thank_msg
    log(f"  Reply sent: '{replied_card['replyMessage']}'", "PASS")

    # 12. Sender sees reply
    log("12. Testing sender retrieval of reply note...")
    status, check_card = do_request("GET", f"/gift-cards/{card_id}")
    assert status == 200
    assert check_card["status"] == "OPENED"
    assert check_card["replyMessage"] == thank_msg
    log("  Sender retrieved updated card with opened status and reply message", "PASS")

    # 13. Frontend bundle serving
    log("13. Testing Ingress route to mfe-transfer /remoteEntry.js...")
    status, _ = do_request("GET", "/remoteEntry.js", headers={"Host": "mfe-transfer.ewallet-lab.local"})
    assert status == 200, f"MFE transfer returned {status}"
    log("  mfe-transfer /remoteEntry.js responded 200 OK from Ingress", "PASS")

    print("\n=======================================================")
    print("ALL 13/13 VERIFICATION CHECKS FOR ISSUE #34 PASSED CLEANLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    try:
        test_verify_issue34()
    except Exception as e:
        log(f"TEST FAILED: {e}", "FAIL")
        sys.exit(1)
