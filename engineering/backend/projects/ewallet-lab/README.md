# Ewallet Lab

Xem [`DESIGN.md`](DESIGN.md) cho kiến trúc microservices đầy đủ. File này ghi nguồn spec đã dùng,
ranh giới rõ ràng giữa phần bám spec thật và phần tự thiết kế, và cách chạy lab.

## Nguồn spec (tuân theo nguyên tắc đã lưu — luôn bám tài liệu thật trước khi code)

### Top-up (`topup-service` + `mock-bank-gateway`) — **đã xác minh trực tiếp**

- [MoMo Developers — Collection Link](https://developers.momo.vn/v3/docs/payment/api/collection-link/) —
  nguồn của toàn bộ field trong `CollectionRequest`/`CollectionResponse`: `partnerCode`, `requestId`,
  `amount`, `orderId`, `orderInfo`, `redirectUrl`, `ipnUrl`, `requestType` (`payWithMethod`),
  `extraData`, `signature`. Công thức chữ ký HMAC-SHA256 (sort alphabet, nối `key=value&...`) copy
  nguyên văn — xem `MomoStyleSignature.java`.
- [MoMo Developers — Payment Notification (IPN)](https://developers.momo.vn/v3/docs/payment/api/result-handling/notification/) —
  field IPN (`orderId`, `transId`, `resultCode`, `message`, `signature`...), yêu cầu phản hồi trong
  15 giây bằng HTTP 204, và nguyên tắc "MoMo sẽ không dùng kết quả IPN trả về để tự hoàn tiền" (bên
  nhận phải tự xử lý logic nghiệp vụ).

**Ranh giới quan trọng — đọc trước khi dùng làm tham chiếu thật**: đây là API **Collection** (thu
tiền — merchant thu tiền từ khách qua MoMo), không phải API cho "MoMo tự nạp tiền vào ví của họ".
`topup-service`/`mock-bank-gateway` **thích nghi** field/MAC pattern đã xác minh sang chiều "ngân
hàng thu tiền để nạp vào ví" — hợp lý về mặt kỹ thuật (cùng bản chất: 1 bên uỷ quyền chuyển tiền,
xác nhận qua IPN bất đồng bộ) nhưng **chưa được MoMo xác nhận** là đúng cách họ tự làm nội bộ.

**Gap đã biết, không giấu**: công thức chữ ký cho riêng IPN (khác với chữ ký của create-request)
không được xác nhận chi tiết từ trang đã fetch — `IpnController` cố tình **không** verify chữ ký IPN
bằng công thức chưa xác nhận, và có comment giải thích rõ đây là thiếu sót cần bổ sung trước khi
dùng thật, không phải bỏ sót âm thầm.

### P2P Transfer, Bill Payment — **không có spec MoMo công khai**

MoMo's public dev docs là cho merchant tích hợp MoMo, không công khai cách chính MoMo vận hành P2P
transfer hay bill payment nội bộ. `transfer-service`/`bill-payment-service` thiết kế theo logic sản
phẩm ví điện tử phổ quát — không giả vờ có spec. `bill-payment-service` cụ thể là biller **hoàn
toàn mock** (due amount = hash deterministic của category+customerCode, xem DESIGN.md mục "Luồng
bill payment") — không dùng tên nhà cung cấp thật nào.

## Services & DB

| Service | Port | DB | Vai trò |
|---|---|---|---|
| `user-service` | 8090 | `ewallet_user` | Đăng ký/tra cứu user theo SĐT |
| `wallet-service` | 8091 | `ewallet_wallet` | Số dư + sổ giao dịch, API nội bộ credit/debit |
| `topup-service` | 8092 | `ewallet_topup` | Orchestrator nạp tiền, liên kết NH |
| `mock-bank-gateway` | 8093 | — | Đóng vai ngân hàng liên kết (Collection Link + IPN) |
| `transfer-service` | 8094 | — (stateless, xem DESIGN.md) | Saga P2P transfer nội bộ |
| `bill-payment-service` | 8095 | `ewallet_bill_payment` | Tra cứu + thanh toán hoá đơn (mock biller) |

## Chạy lab

```bash
cd engineering/backend/projects/ewallet-lab
docker compose up --build
```

Đăng ký user:
```bash
curl -X POST http://localhost:8090/users/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"0912345678","name":"Nguyen Van A"}'
```

Liên kết tài khoản ngân hàng (dùng `userId` trả về ở trên):
```bash
curl -X POST http://localhost:8092/linked-bank-accounts \
  -H "Content-Type: application/json" \
  -d '{"userId":"<userId>","bankCode":"VCB","accountNumber":"0011002233"}'
```

Nạp tiền:
```bash
curl -X POST http://localhost:8092/topups \
  -H "Content-Type: application/json" \
  -d '{"userId":"<userId>","amount":100000}'
```

Tra trạng thái nạp tiền (poll cho tới khi `CONFIRMED`):
```bash
curl http://localhost:8092/topups/<orderId>
```

Tra số dư (sẽ tăng sau khi IPN xác nhận, không phải ngay sau khi gọi `/topups`):
```bash
curl http://localhost:8091/wallets/<userId>/balance
```

Tra cứu hoá đơn (mock biller — số tiền là hash deterministic, không phải số dư nợ thật):
```bash
curl "http://localhost:8095/bills/lookup?category=ELECTRICITY&customerCode=PD01001234"
```

Thanh toán hoá đơn (đồng bộ — debit ví ngay, không có bước IPN):
```bash
curl -X POST http://localhost:8095/bills/pay \
  -H "Content-Type: application/json" \
  -d '{"userId":"<userId>","category":"ELECTRICITY","customerCode":"PD01001234"}'
```

## Chưa làm

- Chưa verify chữ ký IPN (gap đã ghi rõ ở trên).
- Frontend React đã có ở `engineering/frontend/projects/ewallet-lab/` (xem DESIGN.md riêng của
  phần đó) nhưng còn nhiều tính năng comingSoon (QR, payment-link, split-bill, ...).
