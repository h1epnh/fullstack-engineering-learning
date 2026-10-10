#!/usr/bin/env python3
"""
Test verification script for Issue #33:
Mua vé xe khách, tàu hoả, máy bay (Travel & Transport Ticketing)

Kiểm thử độc lập qua Ingress Nginx (cổng 18080, Host: api.ewallet-lab.local):
1. Tra cứu danh mục chuyến đi (Tất cả, Lọc theo Phương tiện, Điểm đi).
2. Đặt vé thành công: trừ tiền ví chính, giảm ghế trống, sinh mã đặt chỗ BK-* và mã vé TK-*.
3. Từ chối khi ví chính không đủ số dư (409 Conflict).
4. Tra cứu lịch sử vé đã đặt của người dùng.
5. Huỷ vé thành công: hoàn lại đúng 85% giá vé về ví chính, trả lại 1 ghế trống cho chuyến đi.
6. Chặn các trường hợp huỷ vé không hợp lệ (người khác huỷ -> 403, vé đã huỷ huỷ tiếp -> 400).
7. Concurrency Race Test: Khi chuyến đi chỉ còn đúng 1 ghế trống, 10 luồng bắn đồng thời ->
   ĐÚNG 1 luồng thành công, 9 luồng bị từ chối (409), không overselling, số dư ví toàn vẹn 100%.
"""

import http.client
import json
import random
import time
import uuid
import concurrent.futures

INGRESS_HOST = "127.0.0.1"
INGRESS_PORT = 18080
API_HOST_HEADER = "api.ewallet-lab.local"

def do_request(method, path, body=None):
    conn = http.client.HTTPConnection(INGRESS_HOST, INGRESS_PORT, timeout=15)
    headers = {
        "Host": API_HOST_HEADER,
        "Content-Type": "application/json"
    }
    body_data = json.dumps(body) if body is not None else None
    try:
        conn.request(method, path, body=body_data, headers=headers)
        res = conn.getresponse()
        status = res.status
        content = res.read().decode("utf-8")
        try:
            res_json = json.loads(content)
        except Exception:
            res_json = content
        return status, res_json
    except Exception as e:
        return 500, str(e)
    finally:
        conn.close()

def create_user(prefix="user"):
    phone = "09" + "".join([str(random.randint(0, 9)) for _ in range(8)])
    status, res = do_request("POST", "/users/register", {
        "phone": phone,
        "name": f"Nguyen Van {prefix.title()}"
    })
    assert status == 201, f"Register user failed: {status} {res}"
    return res["id"], phone

def credit_wallet(user_id, amount):
    status, res = do_request("POST", f"/wallets/{user_id}/credit", {
        "amount": amount,
        "type": "TOPUP",
        "reference": "INIT_TEST",
        "note": "Nạp tiền test du lịch"
    })
    assert status == 200, f"Credit wallet failed: {status} {res}"
    return res["balance"]

def get_wallet(user_id):
    status, res = do_request("GET", f"/wallets/{user_id}/balance")
    assert status == 200, f"Get wallet failed: {status} {res}"
    return res

def err_msg(res):
    return res.get("message", str(res)) if isinstance(res, dict) else str(res)

def main():
    print("[TEST Issue #33] === BẮT ĐẦU KIỂM THỬ ĐỘC LẬP TÍNH NĂNG MUA VÉ DU LỊCH & ĐẶT VÉ (ISSUE #33) ===")

    # 1. Tra cứu danh mục chuyến đi
    print("\n--- 1. Tra cứu danh mục chuyến đi ---")
    status, all_trips = do_request("GET", "/travel/trips/search")
    assert status == 200, f"Search all trips failed: {status} {all_trips}"
    assert len(all_trips) >= 8, f"Kỳ vọng >= 8 chuyến đi, thực tế: {len(all_trips)}"
    print(f"   -> Tổng số chuyến đi tìm thấy: {len(all_trips)} chuyến.")

    # 1.1 Lọc theo phương tiện BUS
    status, bus_trips = do_request("GET", "/travel/trips/search?type=BUS")
    assert status == 200
    assert all(t["tripType"] == "BUS" for t in bus_trips)
    print(f"   -> Lọc theo Xe khách (BUS): {len(bus_trips)} chuyến (100% khớp loại BUS).")

    # 1.2 Lọc theo phương tiện FLIGHT
    status, flight_trips = do_request("GET", "/travel/trips/search?type=FLIGHT")
    assert status == 200
    assert all(t["tripType"] == "FLIGHT" for t in flight_trips)
    print(f"   -> Lọc theo Máy bay (FLIGHT): {len(flight_trips)} chuyến (100% khớp loại FLIGHT).")

    # 2. Đặt vé thành công cho User A
    print("\n--- 2. Kiểm thử luồng Đặt vé thành công (User A) ---")
    user_a, phone_a = create_user("TravelerA")
    credit_wallet(user_a, 5000000)
    w_a_init = get_wallet(user_a)
    assert float(w_a_init["balance"]) == 5000000.0
    print(f"   -> User A: {user_a} ({phone_a}), số dư ban đầu: 5.000.000đ")

    # Chọn 1 chuyến bay Vietnam Airlines
    selected_trip = next(t for t in flight_trips if "Vietnam Airlines" in t["carrierName"])
    trip_id = selected_trip["id"]
    trip_price = float(selected_trip["price"])
    initial_seats = selected_trip["availableSeats"]
    print(f"   -> Chọn chuyến: {selected_trip['carrierName']} ({selected_trip['origin']} -> {selected_trip['destination']}), Giá: {trip_price:,.0f}đ, Ghế trống: {initial_seats}")

    # Đặt vé
    status, booking = do_request("POST", "/travel/bookings", {
        "userId": user_a,
        "tripId": trip_id,
        "passengerName": "Nguyen Van Traveler A",
        "passengerPhone": phone_a,
        "seatNumber": "12A"
    })
    assert status == 201, f"Đặt vé thất bại: {status} {booking}"
    booking_id = booking["id"]
    booking_code = booking["bookingCode"]
    ticket_code = booking["ticketCode"]
    assert booking_code.startswith("BK-"), f"Mã booking không đúng format BK-*: {booking_code}"
    assert ticket_code.startswith("TK-"), f"Mã vé không đúng format TK-*: {ticket_code}"
    assert booking["status"] == "CONFIRMED"
    assert booking["seatNumber"] == "12A"
    print(f"   -> Đặt vé thành công! Mã đặt chỗ: {booking_code}, Mã vé: {ticket_code}, Trạng thái: {booking['status']}")

    # Kiểm tra số dư ví User A và số ghế trống của chuyến đi
    w_a_after = get_wallet(user_a)
    expected_balance = 5000000.0 - trip_price
    assert float(w_a_after["balance"]) == expected_balance, f"Số dư ví bị trừ sai: {w_a_after['balance']}, kỳ vọng: {expected_balance}"
    print(f"   -> Ví chính bị trừ chính xác {trip_price:,.0f}đ, còn lại: {float(w_a_after['balance']):,.0f}đ")

    status, trip_after = do_request("GET", f"/travel/trips/{trip_id}")
    assert status == 200
    assert trip_after["availableSeats"] == initial_seats - 1
    print(f"   -> Số ghế trống của chuyến đi giảm chính xác 1 ghế: {initial_seats} -> {trip_after['availableSeats']}")

    # 3. Kiểm thử từ chối khi số dư ví không đủ
    print("\n--- 3. Kiểm thử từ chối khi số dư ví không đủ (409 Conflict) ---")
    user_b, phone_b = create_user("TravelerB")
    credit_wallet(user_b, 50000)
    w_b_init = get_wallet(user_b)
    assert float(w_b_init["balance"]) == 50000.0
    print(f"   -> User B chỉ có 50.000đ, thử đặt chuyến bay {trip_price:,.0f}đ...")

    status, res_b = do_request("POST", "/travel/bookings", {
        "userId": user_b,
        "tripId": trip_id,
        "passengerName": "Nguyen Van B",
        "passengerPhone": phone_b,
        "seatNumber": "15C"
    })
    assert status == 409, f"Kỳ vọng 409 Conflict nhưng nhận {status}: {res_b}"
    print(f"   -> Từ chối an toàn chính xác (409 Conflict): {err_msg(res_b)}")
    w_b_check = get_wallet(user_b)
    assert float(w_b_check["balance"]) == 50000.0, "Số dư User B bị thay đổi bất thường!"

    # 4. Tra cứu danh sách vé đã đặt của User A
    print("\n--- 4. Tra cứu vé điện tử đã đặt của User A ---")
    status, my_bookings = do_request("GET", f"/travel/bookings?userId={user_a}")
    assert status == 200
    assert len(my_bookings) >= 1
    found = any(b["id"] == booking_id and b["bookingCode"] == booking_code for b in my_bookings)
    assert found, "Không tìm thấy vé vừa đặt trong danh sách vé của User A"
    print(f"   -> Tra cứu thành công: Tìm thấy vé {booking_code} trong lịch sử của User A.")

    # 5. Huỷ vé & Hoàn tiền 85%
    print("\n--- 5. Kiểm thử Huỷ vé & Hoàn tiền 85% về ví chính ---")
    # Thử User B huỷ vé của User A -> 403 Forbidden
    status, res_forbid = do_request("POST", f"/travel/bookings/{booking_id}/cancel?userId={user_b}")
    assert status == 403, f"Kỳ vọng 403 Forbidden nhưng nhận {status}: {res_forbid}"
    print(f"   -> Chặn User B huỷ vé User A chính xác (403 Forbidden): {err_msg(res_forbid)}")

    # User A thực hiện huỷ vé của mình
    seats_before_cancel = trip_after["availableSeats"]
    status, cancelled_bk = do_request("POST", f"/travel/bookings/{booking_id}/cancel?userId={user_a}")
    assert status == 200, f"Huỷ vé thất bại: {status} {cancelled_bk}"
    assert cancelled_bk["status"] == "CANCELLED_REFUNDED"
    print(f"   -> Huỷ vé thành công! Trạng thái: {cancelled_bk['status']}")

    # Kiểm tra số tiền hoàn lại: 85% của trip_price
    refund_amount = round(trip_price * 0.85)
    w_a_refunded = get_wallet(user_a)
    expected_refunded_balance = expected_balance + refund_amount
    assert float(w_a_refunded["balance"]) == expected_refunded_balance, f"Số dư hoàn tiền sai: {w_a_refunded['balance']}, kỳ vọng: {expected_refunded_balance}"
    print(f"   -> Số dư User A được hoàn lại đúng 85% ({refund_amount:,.0f}đ): {expected_balance:,.0f}đ -> {float(w_a_refunded['balance']):,.0f}đ!")

    # Kiểm tra ghế trống được phục hồi
    status, trip_restored = do_request("GET", f"/travel/trips/{trip_id}")
    assert status == 200
    assert trip_restored["availableSeats"] == seats_before_cancel + 1
    print(f"   -> Số ghế trống của chuyến đi được trả lại 1 ghế: {seats_before_cancel} -> {trip_restored['availableSeats']}")

    # Huỷ tiếp vé đã huỷ -> 400 Bad Request
    status, res_repeat = do_request("POST", f"/travel/bookings/{booking_id}/cancel?userId={user_a}")
    assert status == 400, f"Kỳ vọng 400 Bad Request nhưng nhận {status}: {res_repeat}"
    print(f"   -> Chặn huỷ lần hai chính xác (400 Bad Request): {err_msg(res_repeat)}")

    # 6. Concurrency Race Test trên chiếc ghế cuối cùng (10 luồng đồng thời)
    print("\n--- 6. Concurrency Race Test: 10 luồng đồng thời tranh chiếc ghế cuối cùng ---")
    # Chọn 1 chuyến đi ít tiền (vd xe khách Hoàng Long 120.000đ)
    bus_cheap = next(t for t in bus_trips if "Hoàng Long" in t["carrierName"])
    cheap_trip_id = bus_cheap["id"]
    cheap_price = float(bus_cheap["price"])

    # Đặt trước cho đến khi chuyến này chỉ còn đúng 1 ghế trống
    st, curr_trip = do_request("GET", f"/travel/trips/{cheap_trip_id}")
    avail = curr_trip["availableSeats"]
    print(f"   -> Chuyến {curr_trip['carrierName']} hiện có {avail} ghế trống.")

    # Tạo 1 user tạm để rút sạch ghế chỉ để lại 1 ghế
    drain_user, _ = create_user("Drainer")
    credit_wallet(drain_user, cheap_price * (avail - 1) + 1000000)
    for seat_i in range(avail - 1):
        st, b = do_request("POST", "/travel/bookings", {
            "userId": drain_user,
            "tripId": cheap_trip_id,
            "passengerName": f"Khách phụ {seat_i}",
            "passengerPhone": "0988888888",
            "seatNumber": f"DRAIN-{seat_i}"
        })
        assert st == 201

    st, final_1_trip = do_request("GET", f"/travel/trips/{cheap_trip_id}")
    assert final_1_trip["availableSeats"] == 1, f"Chuyến đi chưa đúng 1 ghế trống: {final_1_trip['availableSeats']}"
    print(f"   -> Đã chuẩn bị chuyến đi với DUY NHẤT 1 GHẾ TRỐNG!")

    # Tạo 10 người dùng khác nhau, mỗi người nạp 500.000đ
    race_users = []
    for i in range(10):
        u, p = create_user(f"RaceRunner{i}")
        credit_wallet(u, 500000)
        race_users.append((u, p, f"GHE-RACE-{i}"))

    print(f"   -> Đã tạo 10 người dùng độc lập, mỗi người có 500.000đ sẵn sàng tranh ghế.")

    def book_race(user_info):
        u_id, u_phone, seat_no = user_info
        return u_id, do_request("POST", "/travel/bookings", {
            "userId": u_id,
            "tripId": cheap_trip_id,
            "passengerName": f"Hành khách Race {seat_no}",
            "passengerPhone": u_phone,
            "seatNumber": seat_no
        })

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        race_results = list(executor.map(book_race, race_users))

    successes = [r for r in race_results if r[1][0] == 201]
    conflicts = [r for r in race_results if r[1][0] == 409]

    print(f"   -> Kết quả 10 luồng: {len(successes)} thành công (201), {len(conflicts)} bị chặn xung đột/hết ghế (409)")
    assert len(successes) == 1, f"Kỳ vọng đúng 1 luồng thành công, nhưng có: {len(successes)}"
    assert len(conflicts) == 9, f"Kỳ vọng 9 luồng bị từ chối 409, nhưng có: {len(conflicts)}"

    # Kiểm tra tồn kho ghế cuối cùng
    st, trip_end = do_request("GET", f"/travel/trips/{cheap_trip_id}")
    assert trip_end["availableSeats"] == 0, f"Ghế trống cuối cùng phải là 0: {trip_end['availableSeats']}"
    print(f"   -> Số ghế trống cuối cùng: 0 (hoàn toàn KHÔNG bị overselling hay âm số ghế!)")

    # Kiểm tra số dư của 10 người dùng
    winner_id = successes[0][0]
    w_winner = get_wallet(winner_id)
    assert float(w_winner["balance"]) == 500000.0 - cheap_price
    print(f"   -> Người chiến thắng ({winner_id}) bị trừ đúng {cheap_price:,.0f}đ.")

    for u_id, _ in conflicts:
        w_loser = get_wallet(u_id)
        assert float(w_loser["balance"]) == 500000.0, f"Người thua ({u_id}) bị trừ tiền nhầm!"
    print(f"   -> Toàn bộ 9 người thua giữ nguyên 100% số dư (500.000đ), tính toàn vẹn tài chính đạt mức tuyệt đối!")

    print("\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỘC LẬP ISSUE #33 ĐÃ VƯỢT QUA 100%! ===")

if __name__ == "__main__":
    main()
