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
xác nhận qua IPN bất đồng bộ) nhưng **chưa được MoMo xác minh** là đúng cách họ tự làm nội bộ.

### Chữ ký IPN — **đã xác minh + đã triển khai** (issue #52, TD-03)

Trước #52, `IpnController` **không** verify chữ ký IPN: ai gọi được `/ipn/topup` với
`resultCode: 0` là tạo được tiền. Nay đã sửa xong, theo 3 tầng:

1. **Danh sách field ký IPN — đã xác minh từ tài liệu chính thức.** Trang
   [Collection Link](https://developers.momo.vn/v3/docs/payment/api/collection-link/), mục
   *"Processing payment result"*, nói rõ MoMo gửi các field này trong `redirectUrl` **và** trong body
   của `ipnUrl`. Bộ field được ký gồm **13** field, sort a-z, HMAC-SHA256 bằng secret:
   `accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, payType,
   requestId, responseTime, resultCode, transId`.
   Xem `topup-service/.../service/IpnSignatureVerifier.java` (Javadoc ghi link nguồn + ngày fetch).
   **Caveat của lab (không phải spec MoMo)**: cặp `accessKey`/`secretKey` là secret nội bộ chia sẻ
   giữa `topup-service` và `mock-bank-gateway`; giá trị đặt vào `orderType`/`payType` là do lab tự
   định nghĩa, không phải enum của MoMo; cửa sổ replay (5 phút) là kiểm soát của lab, vì trang tài
   liệu không nói MoMo giới hạn cửa sổ timestamp thế nào.
2. **Verify constant-time + so khớp số tiền + chống replay.** `IpnController` (và
   `BankTransferOutIpnController`) so sánh bằng `MessageDigest.isEqual`, đối chiếu `ipn.amount` với
   `TopupRequest.getAmount()`, và kiểm `responseTime` nằm trong cửa sổ cấu hình được
   (`ewallet-lab.ipn.replay-window-seconds`, mặc định 300). Sai chữ ký → **401**, không đổi trạng
   thái, không publish Kafka. IPN hợp lệ gửi lại lần 2 → no-op (đơn đã `CONFIRMED`).
3. **Secret ra khỏi code.** `BANK_GATEWAY_ACCESS_KEY` / `BANK_GATEWAY_SECRET_KEY` đến từ env, nạp
   qua K8s Secret `bank-gateway-credentials` (tạo ngoài chart, **không có giá trị nào trong repo**) hoặc
   `.env` gitignored (docker-compose, mẫu ở `.env.example`). Cả hai vế đọc **cùng một** nguồn — nếu
   lệch nhau, mọi IPN sẽ bị từ chối như là bị tấn công.
4. **Chống IPN đồng thời** (race): chuyển `PENDING -> CONFIRMED/FAILED` bằng một câu `UPDATE ... WHERE
   order_id=? AND status='PENDING'` (`transitionFromPending`); chỉ request thắng (1 dòng bị ảnh hưởng)
   mới publish Kafka / hoàn tiền, các request còn lại trả 204 và không làm gì.

**Tạo Secret `bank-gateway-credentials`** (lần đầu, hoặc để rotate; giá trị ngẫu nhiên, không ghi vào
repo/log). Sau khi đổi phải restart `mock-bank-gateway` rồi `topup-service`, từng cái một:
```bash
kubectl -n ewallet-lab create secret generic bank-gateway-credentials \
  --from-literal=BANK_GATEWAY_ACCESS_KEY="$(openssl rand -hex 8)" \
  --from-literal=BANK_GATEWAY_SECRET_KEY="$(openssl rand -hex 32)" \
  --dry-run=client -o yaml | kubectl apply -f -
```
Giá trị cũ (`lab-secret-key-...`) còn trong lịch sử git; đó là secret giả của lab và đã bị thay trên cluster.

**Chứng minh hai vế khớp nhau**: `mock-bank-gateway/collection_test.go` và
`topup-service/.../IpnSignatureVerifierTests.java` cùng assert **một vector cố định** (digest
HMAC-SHA256 tính sẵn bằng Python) cho đúng bộ 13 field đó. Sửa canonical string ở một vế là
test vế kia đỏ.

**Còn thiếu (nói thẳng)**: không có đối soát (reconciliation) và không có truy vấn chủ động khi mất
webhook — đơn `PENDING` sẽ treo vĩnh viễn nếu IPN không tới. Đây là phần còn lại của nợ kỹ thuật về
đối soát, chưa nằm trong #52.

### P2P Transfer, Bill Payment — **không có spec MoMo công khai**

MoMo's public dev docs là cho merchant tích hợp MoMo, không công khai cách chính MoMo vận hành P2P
transfer hay bill payment nội bộ. `transfer-service`/`bill-payment-service` thiết kế theo logic sản
phẩm ví điện tử phổ quát — không giả vờ có spec. `bill-payment-service` cụ thể là biller **hoàn
toàn mock** (due amount = hash deterministic của category+customerCode, xem DESIGN.md mục "Luồng
bill payment") — không dùng tên nhà cung cấp thật nào.

### SNS + SQS thật trên AWS (ADR-06) — fan-out thông báo `payment.completed`

Xem DESIGN.md's ADR-06 cho spec đầy đủ (schema, naming, resource budget, 2 điểm mở đã quyết). Tóm
tắt vận hành:

- `wallet-service` publish lên SNS topic `ewallet-lab-payment-completed` SAU KHI mỗi debit/credit
  đã commit (best-effort, không chặn response, lỗi chỉ log WARN — xem
  `PaymentNotificationPublisher`). KHÔNG route lại bất kỳ luồng tiền Kafka/Outbox hiện có nào.
- `notification-service` (Go, mới — xem `notification-service/`) long-poll SQS queue
  `ewallet-lab-payment-completed-notify` (subscribe topic trên, DLQ
  `ewallet-lab-payment-completed-notify-dlq`, `maxReceiveCount=5`), dedupe theo `eventId`, và chỉ
  log/giả lập gửi thông báo — không gọi push/SMS/email thật.
- Tài nguyên AWS thật (SNS topic, 2 SQS queue, IAM user scoped-down, access key) được operator tự
  tạo bằng CLI profile admin của chính họ, qua `scripts/init-aws-infra.sh` — không agent nào chạy
  lệnh IAM bằng key admin. Script đó in ra lệnh `kubectl create secret` cuối cùng để tạo Secret
  `ewallet-lab-aws-notify` (giữ `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_DEFAULT_REGION`),
  mount vào CẢ `wallet-service` VÀ `notification-service` qua `envFrom.secretRef` — không giá trị
  nào nằm trong repo.
- `notification-service` mặc định `replicas: 0` trên local (`values-local.yaml`) — long-poll SQS
  24/7 không test gì tốn quota free-tier một cách vô ích. Bật lên khi test:
  ```bash
  kubectl -n ewallet-lab scale deploy/notification-service --replicas=1
  # ... test xong ...
  kubectl -n ewallet-lab scale deploy/notification-service --replicas=0
  ```
- Account id/ARN/queue URL không phải secret (đã ghi trong DESIGN.md ADR-06 và
  `deploy/helm/ewallet-lab/values.yaml`'s `aws:` block) — chỉ access key pair là secret.

## Services & DB

| Service | Port | DB | Vai trò |
|---|---|---|---|
| `user-service` | 8090 | `ewallet_user` | Đăng ký/tra cứu user theo SĐT |
| `wallet-service` | 8091 | `ewallet_wallet` | Số dư + sổ giao dịch, API nội bộ credit/debit |
| `topup-service` | 8092 | `ewallet_topup` | Orchestrator nạp tiền, liên kết NH |
| `mock-bank-gateway` | 8093 | — | Đóng vai ngân hàng liên kết (Collection Link + IPN) |
| `transfer-service` | 8094 | — (stateless, xem DESIGN.md) | Saga P2P transfer nội bộ |
| `bill-payment-service` | 8095 | `ewallet_bill_payment` | Tra cứu + thanh toán hoá đơn (mock biller) |
| `payment-request-service` | 8096 | `ewallet_payment_request` | Link nhận tiền + nhắc trả tiền |
| `lucky-money-service` | 8097 | `ewallet_lucky_money` | Lì xì 1-1 (escrow) |
| `loyalty-service` | 8099 | `ewallet_loyalty` | **Mô phỏng** Điểm thưởng — tích điểm hoá đơn, hạng, đổi hoàn tiền (xem DESIGN.md) |
| `bnpl-service` | 8098 | `ewallet_bnpl` | **Mô phỏng** Ví Trả Sau — không phải sản phẩm cho vay thật (xem DESIGN.md) |
| `notification-service` | 8103 | — (Go, không DB) | ADR-06: consumer SQS cho fan-out `payment.completed` (SNS thật trên AWS) — chỉ log/giả lập gửi thông báo, xem mục "SNS + SQS thật trên AWS (ADR-06)" dưới |

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

## Quy tắc thay đổi cấu hình cluster (issue #54)

Không dùng `kubectl patch` / `kubectl set env` / `kubectl scale` cho thay đổi lâu dài: nó khiến release Helm lệch và
conflict field-manager. Chữa cháy được, nhưng phải đưa ngược vào `values.yaml`/template cùng ngày. Trước khi
`helm upgrade`: `helm template ... | kubectl apply --server-side --dry-run=server --field-manager=helm -f -` phải 0 conflict.
Replica cố ý 0 khai ở `replicaOverrides` trong `values-local.yaml`.

## Chưa làm

- Chưa có đối soát (reconciliation) và chưa truy vấn chủ động khi mất IPN — đơn `PENDING` treo vĩnh
  viễn nếu webhook không tới (chữ ký IPN đã verify xong, xem mục trên).
- Frontend React đã có ở `engineering/frontend/projects/ewallet-lab/` (xem DESIGN.md riêng của
  phần đó) nhưng còn nhiều tính năng comingSoon (QR, payment-link, split-bill, ...).
