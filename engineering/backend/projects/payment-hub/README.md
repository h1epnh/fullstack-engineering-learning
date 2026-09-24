# Payment Hub Lab

Xem [`DESIGN.md`](DESIGN.md) cho kiến trúc đầy đủ (SA view — **tech**: pattern, luồng xử lý, trade-off).
Xem [`BUSINESS.md`](BUSINESS.md) cho khía cạnh **nghiệp vụ** (vì sao thiết kế như vậy: rủi ro
settlement, correspondent banking, khung pháp lý AML, KPI đo hệ thống thanh toán) — mỗi mục đều trỏ
ngược lại đúng file code liên quan, không phải lý thuyết tách rời. File này (README) chỉ ghi tổng
quan service, cách chạy lab, và trỏ tới nguồn spec chi tiết của từng rail adapter.

## Services

| Service | Ngôn ngữ | Vai trò | Nguồn spec |
|---|---|---|---|
| `orchestrator` | Java/Spring Boot | Saga, outbox, routing (card BIN + wallet provider detection), gọi compliance-service, consume settlement | — |
| `napas-adapter` | Go | Giả lập rail NAPAS 247 | [napas-adapter/README.md](napas-adapter/README.md) |
| `swift-adapter` | Go | Giả lập rail SWIFT (ISO 20022 pacs.008) | [swift-adapter/README.md](swift-adapter/README.md) |
| `visa-adapter` | Go | Giả lập rail Visa (ISO 8583) | [visa-adapter/README.md](visa-adapter/README.md) |
| `mastercard-adapter` | Go | Giả lập rail Mastercard (ISO 8583 + Stand-In Processing) | [mastercard-adapter/README.md](mastercard-adapter/README.md) |
| `momo-adapter` | Go | Tích hợp MoMo Disbursement API (v2) — field/chữ ký xác minh từ tài liệu chính thức | [momo-adapter/README.md](momo-adapter/README.md) |
| `zalopay-adapter` | Go | Tích hợp ZaloPay (field/MAC xác minh từ Order API, thích nghi sang chiều disbursement) | [zalopay-adapter/README.md](zalopay-adapter/README.md) |
| `compliance-service` | Go | Sanctions/AML screening (đứng trước routing) | mock blocklist, không phải OFAC/UN thật |
| `ledger-service` | Java/Spring Boot | Double-entry ledger, DB riêng (`ledger-postgres`) | — |

**Nguyên tắc quan trọng đã áp dụng**: `ledger-service` dùng Postgres **riêng** (`ledger-postgres`,
không chung với `orchestrator`'s `postgres`) — schema/database-per-service, tránh anti-pattern chia
sẻ DB giữa các microservice. `ledger-service` cũng **tự subscribe** cả 2 Kafka topic thay vì được
orchestrator gọi trực tiếp — orchestrator không biết ledger-service tồn tại. Cả 6 rail adapter dùng
**chung 1 schema event** (`RoutingEvent`/`SettlementEvent`) nhưng **không share code** với nhau —
mỗi cái là bản copy độc lập, phản ánh đúng thực tế mỗi network/provider có tài liệu tích hợp riêng
(xem README từng adapter để biết lý do cụ thể).

## `destAccount` quyết định rail nào — trừ ví điện tử cần thêm `walletProvider`

`RoutingEngine` tự nhận diện loại giao dịch từ **hình dạng** của `destAccount`:

| Hình dạng `destAccount` | Rail | Cách nhận diện |
|---|---|---|
| Bắt đầu bằng `4`, 13–19 chữ số | VISA | BIN range theo ISO/IEC 7812 |
| Bắt đầu `51`–`55`, hoặc `2221`–`2720`, 16 chữ số | MASTERCARD | BIN range theo ISO/IEC 7812 |
| SĐT Việt Nam (`0` + 9 chữ số) + `walletProvider: "MOMO"` | MOMO | — |
| SĐT Việt Nam (`0` + 9 chữ số) + `walletProvider: "ZALOPAY"` | ZALOPAY | — |
| Có `destBic` + currency ≠ VND | SWIFT | Cross-border |
| Còn lại, currency = VND, dưới 500tr | NAPAS | Xem BUSINESS.md mục 3 |

**Vì sao ví điện tử cần thêm field, khác thẻ**: BIN của thẻ xác định network duy nhất (số thẻ Visa
không thể vừa là Mastercard). Nhưng 1 số điện thoại có thể đăng ký **cả** MoMo lẫn ZaloPay độc lập —
`destAccount` một mình không đủ xác định rail, nên `walletProvider` là field bắt buộc riêng cho
luồng ví điện tử (xem `RoutingEngine.routeWallet`).

## Luồng dữ liệu (tóm tắt — chi tiết xem DESIGN.md mục 3)

```
POST /payments (orchestrator)
  → compliance-service (HTTP, chặn nếu không clear)
  → routing engine (nhận diện rail từ destAccount + destBic + currency + amount + walletProvider)
  → ghi Postgres + outbox event (atomic) → Kafka: payment.routing.requested
       ├─→ napas/swift/visa/mastercard/momo/zalopay-adapter: giả lập rail, publish → payment.settlement.confirmed
       │      ├─→ orchestrator: ROUTED → SETTLED/FAILED
       │      └─→ ledger-service: finalize hoặc reverse double-entry
       └─→ ledger-service: ghi provisional double-entry ngay khi routed
```

## Nguồn spec (source-of-truth cho mock message) — tóm tắt

- **SWIFT/cross-border → ISO 20022 pacs.008** (MT103 đã decommission cho cross-border từ 11/2025).
  Spec có công khai đầy đủ. Chi tiết: [swift-adapter/README.md](swift-adapter/README.md).
- **NAPAS 247 → không có spec công khai đầy đủ** (proprietary, chỉ cấp cho ngân hàng thành viên).
  Chi tiết: [napas-adapter/README.md](napas-adapter/README.md).
- **Visa/Mastercard → ISO 8583** (chuẩn công khai, nền tảng chung), nhưng implementation guide riêng
  của từng network **không công khai**. Chi tiết: [visa-adapter/README.md](visa-adapter/README.md),
  [mastercard-adapter/README.md](mastercard-adapter/README.md).
- **MoMo → Single Disbursement API (v2), đã xác minh trực tiếp từ developers.momo.vn** — field name,
  công thức chữ ký HMAC-SHA256 lấy nguyên văn. Chi tiết + giới hạn (RSA encryption bị đơn giản hoá):
  [momo-adapter/README.md](momo-adapter/README.md).
- **ZaloPay → field/MAC xác minh từ tài liệu Order API chính thức**, nhưng đây là API thu tiền
  (collection), không phải disbursement — tài liệu Disbursement chính thức không truy cập được khi
  viết code. Chi tiết + giới hạn quan trọng này: [zalopay-adapter/README.md](zalopay-adapter/README.md).

## Chạy lab

```bash
cd engineering/backend/projects/payment-hub
docker compose up --build
```

Gửi 1 giao dịch NAPAS (VND, không cần BIC):

```bash
curl -X POST http://localhost:8080/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-napas-001" \
  -d '{"sourceAccount":"ACC-001","destAccount":"ACC-002","amount":500000,"currency":"VND"}'
```

Gửi 1 giao dịch SWIFT (non-VND, cần BIC):

```bash
curl -X POST http://localhost:8080/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-swift-001" \
  -d '{"sourceAccount":"ACC-001","destAccount":"ACC-999","destBic":"BOFAUS3N","amount":100.50,"currency":"USD"}'
```

Gửi 1 giao dịch thẻ Visa (destAccount = PAN bắt đầu bằng 4):

```bash
curl -X POST http://localhost:8080/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-visa-001" \
  -d '{"sourceAccount":"ACC-001","destAccount":"4111111111111111","amount":250000,"currency":"VND"}'
```

Gửi 1 giao dịch MoMo (destAccount = SĐT VN, cần `walletProvider`):

```bash
curl -X POST http://localhost:8080/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-momo-001" \
  -d '{"sourceAccount":"ACC-001","destAccount":"0912345678","amount":50000,"currency":"VND","walletProvider":"MOMO"}'
```

Gửi 1 giao dịch ZaloPay:

```bash
curl -X POST http://localhost:8080/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-zalopay-001" \
  -d '{"sourceAccount":"ACC-001","destAccount":"0912345678","amount":50000,"currency":"VND","walletProvider":"ZALOPAY"}'
```

Tra trạng thái: `GET http://localhost:8080/payments/{id}`.
Tra sổ cái: `GET http://localhost:8084/ledger/{transactionId}`.

Xem README riêng trong từng service cho API/env chi tiết.
