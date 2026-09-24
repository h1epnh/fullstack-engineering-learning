# Payment Hub — Thiết kế kiến trúc (SA view)

Lab thực hành: trung tâm điều phối thanh toán cho ngân hàng, tích hợp NAPAS (nội địa liên ngân
hàng), SWIFT (chuyển tiền quốc tế), và cross-border qua correspondent bank. Mục tiêu vừa luyện
domain payment/banking, vừa luyện AWS SDK thật qua [Floci](https://floci.io/) (AWS emulator local,
free, MIT — thay thế LocalStack sau khi LocalStack đóng community edition 3/2026).

File này tập trung vào **tech** (pattern, luồng xử lý, trade-off). Xem [`BUSINESS.md`](BUSINESS.md)
cho khía cạnh **nghiệp vụ** — vì sao mỗi quyết định thiết kế ở đây tồn tại (rủi ro settlement,
correspondent banking, khung pháp lý AML, KPI đo hệ thống thanh toán thật).

## 1. Yêu cầu

**Functional**
- Nhận lệnh thanh toán từ nhiều kênh (core banking, mobile app, API đối tác)
- Định tuyến theo loại giao dịch: nội địa cùng ngân hàng (internal ledger) → nội địa liên ngân hàng
  (**NAPAS 247**) → quốc tế (**SWIFT ISO 20022 pacs.008**, qua correspondent bank — MT103 đã decommission cho cross-border từ 11/2025)
- Vòng đời giao dịch: `validate → screen (AML/sanctions) → authorize → route → settle → notify`
- Tra cứu trạng thái, đảo giao dịch (reversal)

**Non-functional**
- NAPAS: latency mục tiêu <5s (real-time). SWIFT/cross-border: message-based, settlement có thể mất
  hàng giờ — **không được thiết kế như thể nó real-time**.
- Ledger: strong consistency (ACID) — không thoả hiệp.
- Giữa các service: eventual consistency + saga.
- Compliance: sanctions screening là **bước chặn bắt buộc** cho cross-border, không phải optional.
- Mọi giao dịch phải trace được end-to-end bằng correlation ID.

**Constraints (lab)**
- Không có license SWIFT Alliance/NAPAS thật → mock nhưng đúng format chuẩn thật (pacs.008 XML,
  NAPAS 247 message).
- AWS thật không cần — dùng Floci để luyện AWS SDK calls (SQS, S3, DynamoDB, Secrets Manager)
  miễn phí, local.

## 2. Kiến trúc tổng thể

```
                    ┌─────────────────┐
   Core Banking /   │  Channel Gateway │  (REST, idempotency-key header bắt buộc)
   Mobile App       └────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Payment Orchestrator│  (Java/Spring Boot — Saga state machine)
                    │  PENDING→SCREENING  │
                    │  →ROUTED→SETTLED    │
                    └──┬──────────┬───────┘
                       │          │
              ┌────────▼───┐  ┌──▼──────────────────┐
              │ Compliance │  │    Routing Engine     │
              │ (sanctions │  │ (hình dạng destAccount:│
              │  screening)│  │  BIN thẻ, SĐT+wallet-  │
              └────────────┘  │  Provider, BIC/amount) │
                               └───────────┬────────────┘
                                            │
                                            ▼
                          ┌─────────────────────────────────┐
                          │  Kafka topic: payment.routing.   │
                          │  requested (1 topic, filter theo │
                          │  field "rail" ở mỗi consumer)     │
                          └─────────────────┬─────────────────┘
                                            │
        ┌──────────┬──────────┬───────────┼───────────┬──────────┬──────────┐
        ▼          ▼          ▼           ▼           ▼          ▼          
   ┌────────┐ ┌────────┐ ┌────────┐  ┌────────┐  ┌────────┐ ┌─────────┐
   │ NAPAS  │ │ SWIFT  │ │  Visa  │  │Master- │  │  MoMo  │ │ZaloPay  │
   │Adapter │ │Adapter │ │Adapter │  │ card   │  │Adapter │ │Adapter  │
   │(Go,247-│ │(Go,    │ │(Go,ISO │  │Adapter │  │(Go,    │ │(Go,Order│
   │like msg│ │pacs008)│ │ 8583)  │  │(Go,ISO │  │Disburse│ │API+MAC, │
   │)       │ │        │ │        │  │8583+   │  │ment v2)│ │adapted) │
   │        │ │        │ │        │  │STIP)   │  │        │ │         │
   └───┬────┘ └───┬────┘ └───┬────┘  └───┬────┘  └───┬────┘ └────┬────┘
       │          │          │           │           │           │
       └──────────┴──────────┴─────┬─────┴───────────┴───────────┘
                                    ▼
                    ┌─────────────────────────────────┐
                    │  Kafka topic: payment.settlement.  │
                    │  confirmed (mọi rail publish chung) │
                    └──────────────┬──────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐     ┌──────────────────────────┐
        │ Orchestrator           │     │  Ledger Service (Java,    │
        │ SettlementEventConsumer│     │  Postgres riêng, double-  │
        │ ROUTED→SETTLED/FAILED  │     │  entry, immutable log)    │
        └────────────────────────┘     └───────────────────────────┘
```

Cả 6 rail adapter tiêu thụ **cùng 1 topic** (`payment.routing.requested`) và tự lọc theo field
`rail` — không có routing riêng ở tầng Kafka, mỗi adapter chỉ xử lý event khớp rail của mình và bỏ
qua phần còn lại (xem `handleMessage` trong từng adapter).

   Idempotency store: Redis (hoặc DynamoDB qua Floci)
   Message archive (raw SWIFT/NAPAS payload, compliance retention): S3 qua Floci
   Secrets (rail credentials, signing keys): Secrets Manager qua Floci
```

## 3. Luồng xử lý cross-border (phức tạp nhất, đáng học nhất)

1. Channel Gateway nhận request kèm `Idempotency-Key` → Orchestrator kiểm tra trùng lặp (Redis)
   trước khi tạo transaction mới.
2. Orchestrator ghi transaction `PENDING` (Postgres) — atomic với publish event dùng **Outbox
   Pattern** (atomic update DB + publish event, tránh vấn đề "update DB thành công nhưng publish
   event thất bại").
3. Compliance Service chặn giao dịch, check tên người gửi/nhận với danh sách trừng phạt giả lập
   (OFAC/UN mock list) → nếu match, `REJECTED` ngay, không đi tiếp.
4. Routing Engine: beneficiary có SWIFT BIC + currency ≠ VND → route SWIFT; beneficiary là ngân
   hàng VN → route NAPAS.
5. SWIFT Adapter dựng message **pacs.008** (ISO 20022 — chuẩn duy nhất cho cross-border kể từ khi
   SWIFT hoàn tất decommission MT103 cho luồng quốc tế, 11/2025), gửi tới correspondent bank giả lập.
6. **Quan trọng**: ACK từ SWIFT chỉ xác nhận "message được chấp nhận vào mạng", **không phải** xác
   nhận tiền đã chuyển — status chuyển `ROUTED`, chưa `SETTLED`.
7. Reconciliation job (batch, chạy định kỳ) đọc "settlement statement" giả lập (tương đương
   MT950/camt.053 thật) → match theo reference number → cập nhật `SETTLED`.
8. Ledger ghi bút toán final; nếu screening fail sau khi đã có provisional debit → compensating
   transaction (saga rollback), không được xoá bản ghi (audit trail bất biến).

## 4. Resilience patterns

| Pattern | Áp dụng ở đâu |
|---|---|
| Idempotency key | Channel Gateway → Orchestrator |
| Circuit Breaker (Resilience4j) | Mỗi Rail Adapter — SWIFT/NAPAS giả lập timeout phải fail-fast |
| Outbox Pattern | Orchestrator ghi DB + publish Kafka event atomic |
| Saga (orchestration, không choreography) | Vòng đời giao dịch — cần state machine rõ ràng cho audit/regulator |
| Dead-letter queue | Rail message gửi thất bại vĩnh viễn |

## 5. Vai trò của Floci (AWS local) trong lab

| Nhu cầu | Dịch vụ AWS (qua Floci) |
|---|---|
| Idempotency store thay Redis | DynamoDB |
| Lưu trữ raw SWIFT/NAPAS message (compliance retention) | S3 |
| Async event thay/kèm Kafka cho luồng đơn giản | SQS/SNS |
| Rail credentials, signing key | Secrets Manager |

## 6. Trade-off chính

- **Orchestration vs Choreography**: chọn Orchestration cho core lifecycle vì regulator cần audit
  trail/state machine rõ ràng — đánh đổi coupling cao hơn để lấy compliance dễ chứng minh hơn.
- **Sync vs Async**: initiation sync (ack nhận request ngay), settlement luôn async.
- **Ledger SQL vs NoSQL**: bắt buộc SQL/ACID — không đánh đổi consistency lấy scale ở đây.

## 7. Cấu trúc code lab

```
payment-hub/
├── DESIGN.md
├── BUSINESS.md
├── docker-compose.yml           (2x Postgres, Kafka, Redis, cả 9 service)
├── orchestrator/                (Java Spring Boot — saga, outbox, compliance client, settlement consumer)
├── napas-adapter/                (Go — giả lập NAPAS 247 message + publish settlement)
├── swift-adapter/                (Go — giả lập pacs.008 + publish settlement)
├── visa-adapter/                 (Go — giả lập ISO 8583 authorization + publish settlement)
├── mastercard-adapter/           (Go — giả lập ISO 8583 + Stand-In Processing + publish settlement)
├── momo-adapter/                 (Go — MoMo Disbursement API v2, field/chữ ký xác minh thật)
├── zalopay-adapter/              (Go — ZaloPay Order API field/MAC xác minh, thích nghi disbursement)
├── ledger-service/               (Java Spring Boot — double-entry, Postgres riêng)
└── compliance-service/          (Go — sanctions list check, standalone HTTP service)
```

**Trạng thái hiện tại**: toàn bộ 9 service đã implement và build thành công (Java: `./gradlew
compileJava`; Go: `go build`). Luồng end-to-end đầy đủ cho cả 6 rail (NAPAS, SWIFT, Visa,
Mastercard, MoMo, ZaloPay):

1. `orchestrator` nhận `POST /payments` → check idempotency (Postgres) → gọi `compliance-service`
   qua HTTP (fail-closed nếu service down) → `RoutingEngine` nhận diện rail từ **hình dạng
   `destAccount`** (BIN thẻ Visa/Mastercard theo ISO/IEC 7812, SĐT VN + `walletProvider` cho ví
   điện tử, hoặc BIC/currency/amount cho NAPAS/SWIFT — xem mục README "destAccount quyết định rail
   nào") → ghi transaction + outbox event atomic (Postgres) → `OutboxPublisher` publish
   `payment.routing.requested` lên Kafka.
2. 6 rail adapter tiêu thụ theo `rail`, dựng message tương ứng, giả lập gọi rail — mỗi rail có
   timing/tỷ lệ fail riêng phản ánh đặc tính thật: NAPAS 0.5–2s/~5% fail (real-time domestic),
   SWIFT 2–6s/~10% fail (cross-border, nhiều điểm fail hơn), Visa/Mastercard 0.1–0.5s/~4% fail
   (authorization sub-second, Mastercard có thêm nhánh Stand-In Processing ~10% khi issuer
   "unreachable"), MoMo/ZaloPay 0.3–1.5s/~7% fail (gần bằng NAPAS) — publish
   `payment.settlement.confirmed`.
3. `orchestrator` (`SettlementEventConsumer`) tiêu thụ event này, cập nhật transaction
   `ROUTED → SETTLED/FAILED`.
4. `ledger-service` tiêu thụ **độc lập** cả 2 topic (`payment.routing.requested` để ghi provisional
   double-entry, `payment.settlement.confirmed` để finalize hoặc reverse-với-compensating-entry) —
   không qua orchestrator gọi trực tiếp, đúng tinh thần "ledger tự chủ, không ai ra lệnh cho nó ghi
   sổ" (choreography cho downstream consumer, orchestration chỉ cho core lifecycle — xem mục 6).

**Chưa làm** (ngoài scope hiện tại, ghi nhận để làm sau nếu cần đào sâu thêm):
- pacs.008 chưa serialize XML đúng schema XSD thật (xem giới hạn ghi trong `swift-adapter/README.md`).
- ISO 8583 (visa-adapter/mastercard-adapter) chưa bitmap-encode thật — chỉ là struct Go phẳng.
- Card rail gộp Authorization + Clearing/Settlement thành 1 event — thực tế là 2 giai đoạn tách
  biệt (settlement batch T+1/T+2), xem giới hạn trong `visa-adapter/README.md`.
- MoMo: `disbursementMethod` chưa RSA-encrypt thật (chỉ gửi JSON phẳng) — xem `momo-adapter/README.md`.
- ZaloPay: field/MAC xác minh từ Order API (thu tiền), **chưa xác nhận đúng với spec Disbursement
  thật** (tài liệu Disbursement chính thức không truy cập được khi viết code) — xem
  `zalopay-adapter/README.md` mục "Giới hạn quan trọng".
- Chưa có test tự động (unit/integration) cho service nào — toàn bộ mới verify bằng compile/build.
- Chưa deploy lên Floci (AWS local) — hiện tại thuần Postgres/Kafka/Redis qua docker-compose.
