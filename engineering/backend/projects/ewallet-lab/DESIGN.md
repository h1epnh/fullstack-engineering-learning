# Ewallet Lab — Thiết kế microservices

Webapp học tập mô phỏng **chức năng tài chính** của 1 ví điện tử kiểu MoMo — vantage point **khác**
[`payment-hub`](../payment-hub/DESIGN.md): payment-hub mô phỏng **ngân hàng gọi ra ví** (bank là
actor); ewallet-lab mô phỏng **chính nhà cung cấp ví tự vận hành hệ thống của họ**.

**Ranh giới spec quan trọng** (xem thêm [README.md](README.md)): MoMo's public dev docs
(developers.momo.vn) là cho **merchant tích hợp MoMo làm phương thức thanh toán** — không công khai
API cho chức năng nội bộ (P2P transfer, top-up, bill payment) vì đó là góc nhìn của chính MoMo, không
phải bên thứ 3. Phần nào bám được spec thật sẽ ghi rõ; phần không có spec công khai sẽ thiết kế theo
logic sản phẩm ví phổ quát, không giả vờ có nguồn.

## Services

| Service | Ngôn ngữ | Vai trò | Nguồn spec |
|---|---|---|---|
| `user-service` | Java/Spring Boot | Đăng ký/đăng nhập theo SĐT (mock, không OTP thật) | — (không có spec công khai, logic tự thiết kế) |
| `wallet-service` | Java/Spring Boot | Chủ sở hữu số dư + sổ giao dịch (ledger) — **nguồn sự thật duy nhất về tiền trong ví**, expose API nội bộ credit/debit cho service khác gọi | — |
| `topup-service` | Java/Spring Boot | Orchestrator nạp/rút tiền, sở hữu `LinkedBankAccount`, gọi `mock-bank-gateway` | **Mô phỏng theo MoMo Collection Link + IPN thật** (xác minh từ developers.momo.vn) |
| `mock-bank-gateway` | Go | Đóng vai "ngân hàng liên kết" — nhận request kiểu Collection Link, trả `payUrl`-style ack, sau đó gọi ngược IPN webhook | Field/HMAC dựa trên MoMo Collection Link API thật |
| `transfer-service` | Java/Spring Boot | Orchestrator P2P transfer nội bộ (saga: debit người gửi → credit người nhận qua `wallet-service`) | — (P2P giữa 2 user cùng hệ thống không có spec MoMo công khai) |
| `bill-payment-service` | Java/Spring Boot | Tra cứu + thanh toán hoá đơn (mock biller), sở hữu DB riêng `ewallet_bill_payment` | — (bill aggregation là góc nhìn nội bộ MoMo, không public — toàn bộ service là mock, xem mục "Luồng bill payment") |
| `payment-request-service` | Java/Spring Boot | Sở hữu `PaymentRequest` (link nhận tiền công khai — issue #3 — và nhắc trả tiền 1-1 nội bộ — issue #8), DB riêng `ewallet_payment_request`; tự nó **không** gọi wallet-service — mọi lần thanh toán đều gọi lại `transfer-service`'s `/transfers` thật | Payment-link: cấu trúc adapted từ MoMo Collection Link (merchant-side, KHÔNG phải spec P2P cá nhân đã xác nhận — xem mục dưới). Payment-reminder: luồng 4 bước đã xác minh trực tiếp từ momo.vn (xem mục dưới) |
| `lucky-money-service` | Java/Spring Boot | Sở hữu `LuckyMoney` (lì xì 1-1 nội bộ, escrow thật — issue #10), DB riêng `ewallet_lucky_money`; **gọi thẳng `wallet-service`'s `/credit`/`/debit`** (khác `payment-request-service` — không đi qua `transfer-service` vì đây là escrow 2 bước theo thời gian, không phải "transfer ngay") | Hạn mức 1.000đ–20.000.000đ/lần và cơ chế 48h/tự động hoàn tiền đã xác minh trực tiếp từ momo.vn (xem mục dưới) |
| `loyalty-service` | Java/Spring Boot | **Mô phỏng** "Điểm thưởng" (issue #19): tích điểm từ thanh toán hoá đơn, hạng thành viên 12 tháng trượt, đổi điểm lấy hoàn tiền — DB riêng `ewallet_loyalty`; đọc `wallet-service`'s `/transactions`, trả thưởng qua `/credit` (type `LOYALTY_REDEMPTION`) | Tỷ lệ lấy cảm hứng từ chương trình thật (xem mục dưới); chương trình/tên hạng tự thiết kế — **không có đối tác/thương hiệu thật** |
| `bnpl-service` | Java/Spring Boot | **Mô phỏng** "Ví Trả Sau" (issue #18): hạn mức tín dụng giả lập, sao kê theo tháng, phí trễ hạn — DB riêng `ewallet_bnpl`; trả nợ gọi `wallet-service`'s `/debit` (type `BNPL_REPAYMENT`) | Hạn mức/lãi/phí lấy từ momo.vn/vi-tra-sau (xác minh trực tiếp) — **sản phẩm là mô phỏng học tập, không có TCTD thật nào đứng sau** (xem mục dưới) |

**Trạng thái**: `wallet-service`, `user-service`, `topup-service`, `mock-bank-gateway`,
`transfer-service`, `bill-payment-service`, `payment-request-service`, `lucky-money-service`,
`bnpl-service`, `loyalty-service` đã scaffold — đủ chạy luồng "đăng ký → liên kết NH → nạp tiền → số dư được cộng", P2P transfer nội bộ,
thanh toán hoá đơn mock, link nhận tiền + nhắc trả tiền, và lì xì 1-1.

## Vì sao mỗi service có DB riêng

Giống bài học đã áp dụng ở `payment-hub` (Q&A 3.77 sách Microservices Interview đã ôn): không share
DB giữa các service. `user-service`, `wallet-service`, `topup-service`, `bill-payment-service` mỗi
cái 1 Postgres database riêng.

**Nhưng "DB riêng" chỉ ở mức *database*, không phải mức *Postgres instance*** — lab này chỉ chạy
**1 Postgres server** (1 Deployment/pod) cho toàn bộ ~10 service Java, mỗi service có 1 database
riêng trên CÙNG server đó (tiết kiệm tài nguyên cho lab, khác hạ tầng thật nơi mỗi service có thể
có RDS instance riêng). Hệ quả: `max_connections` là giới hạn **toàn server**, bị CHIA SẺ bởi toàn
bộ HikariCP pool của mọi service cộng lại — xem mục "Postgres `max_connections` / HikariCP pool
budget" ngay dưới đây.

## Postgres `max_connections` / HikariCP pool budget (issue #24)

**Sự cố thật đã xảy ra nhiều lần**: Postgres mặc định `max_connections=100`. Với ~10 service
Java/Spring Boot dùng chung 1 Postgres instance (xem mục trên), mỗi service dùng HikariCP pool mặc
định của Spring Boot (`maximum-pool-size=10`) → tổng có thể lên tới 100+ connection chỉ từ pool
"nghỉ" (idle, không tính traffic), không cần có connection leak nào. Chỉ cần rolling-restart 1
service (pod cũ + pod mới cùng tồn tại một lúc, pool cũ CHƯA giải phóng mà pool mới ĐÃ mở) hoặc
thêm 1 service mới là đủ chạm trần → `FATAL: sorry, too many clients already`, chặn luôn cả kết nối
admin `psql` trực tiếp vào Postgres (không tự hết dù pod lỗi đã bị revert, vì pool "nghỉ" của các
pod đang chạy KHÔNG tự đóng connection).

**Fix** (cả 2 vế, không chỉ 1 như issue đề xuất "HOẶC"):

1. Giảm `spring.datasource.hikari.maximum-pool-size` xuống `5` (từ default 10) ở `application.yml`
   của **toàn bộ** service Java có DB: `user-service`, `wallet-service`, `topup-service`,
   `bill-payment-service`, `payment-request-service`, `lucky-money-service`, `loyalty-service`,
   `bnpl-service`, `family-wallet-service`, `fund-service` (10 service — `transfer-service` không
   có DB nên không áp dụng, xem gap đã biết ở mục "Lỗi thật đã gặp" trong CLAUDE.md).
2. Tăng `max_connections` Postgres lên `200` — set qua `args: ["-c",
   "max_connections={{ .Values.postgres.maxConnections }}"]` trên container `postgres` trong
   `deploy/helm/ewallet-lab/templates/postgres.yaml` (đọc từ `values.yaml`'s `postgres.maxConnections`),
   và `command: ["postgres", "-c", "max_connections=200"]` tương ứng trong `docker-compose.yml` cho
   local dev ngoài cluster. **Không** dùng `ALTER SYSTEM` chạy tay qua `psql` trên pod đang sống —
   cách đó mất hiệu lực ngay khi pod bị recreate (volume giữ data nhưng không giữ override chạy
   tay nếu không ghi vào `postgresql.conf`/args khởi động), và không review được qua Git.

**Budget margin**: 10 service × `maximum-pool-size=5` = 50 connection ở trạng thái ổn định. Nhân
đôi cho trường hợp xấu nhất khi rolling-restart (pod cũ + pod mới cùng giữ pool đầy một lúc) = 100.
`max_connections=200` giữ mức dùng thực tế dưới 50% ngay cả ở kịch bản xấu nhất đó — thừa biên độ
cho vài session admin `psql`/pgAdmin cộng thêm. Baseline đo thật lúc tất cả 21 pod chạy ổn định:
`select count(*) from pg_stat_activity;` = **56** (28% của 200).

**Verify thật đã làm** (không chỉ đọc code): cluster được khởi động lại tuần tự sau vài ngày nghỉ
(đúng kịch bản đã gây lỗi ban đầu — mỗi service scale 0→1 lần lượt) → toàn bộ 21 pod lên `1/1
Running` không có `CrashLoopBackOff` nào. Sau đó chủ động `kubectl -n ewallet-lab delete pod -l
app=fund-service` và `... -l app=bnpl-service` (chính service đã gây crash trong issue gốc) từng
cái một — cả 2 lần `rollout status` đều `successfully rolled out`, `pg_stat_activity` giữ nguyên
**56** trước/trong/sau restart (không tăng đột biến, không rơi vào "too many clients"). Đã xác nhận
trực tiếp bằng cách tách 1 jar từ image `ewallet-lab/*-service:local` đang chạy thật trên cluster
(`docker cp` ra khỏi container, `unzip`/`javap`) rằng `maximum-pool-size: 5` và các field liên quan
tới bug #14 (xem mục "Quỹ nhóm") đã nằm TRONG image đang deploy, không chỉ trên source code chưa
build.

**Cân nhắc dài hạn chưa làm** (nêu trong issue, không trong phạm vi fix lần này): PgBouncer đứng
trước Postgres nếu số service tiếp tục tăng — 10 service × 5 vẫn còn margin lớn nên chưa cần ngay.

## Luồng Top-up (mô phỏng đúng MoMo Collection Link + IPN)

```
1. Client → topup-service: POST /topup {userId, linkedBankAccountId, amount}
2. topup-service → mock-bank-gateway: POST /v2/gateway/api/create
   (partnerCode, requestId, amount, orderId, orderInfo, ipnUrl, requestType="payWithMethod", signature)
   [field/HMAC-SHA256 y hệt MoMo Collection Link thật — xem mock-bank-gateway/README.md]
3. mock-bank-gateway trả về ngay: {payUrl, resultCode, message} — ĐÂY CHƯA PHẢI xác nhận tiền đã vào ví
4. mock-bank-gateway (giả lập độ trễ ngân hàng xử lý) → gọi ngược HTTP POST tới ipnUrl của topup-service
   (IPN: orderId, transId, resultCode, amount, signature) — topup-service phải trả HTTP 204 trong 15s
5. topup-service verify signature IPN → publish Kafka event "wallet.topup.confirmed"
6. wallet-service tiêu thụ event → credit wallet balance + ghi Transaction(TOPUP, SUCCESS)
```

**Điểm học được quan trọng**: bước 3 (response tức thời) và bước 4 (IPN xác nhận thật) là **2 sự
kiện tách rời** — đúng y hệt bài học "ROUTED ≠ SETTLED" đã học ở payment-hub, nhưng lần này dựa trên
cơ chế IPN **có thật** của MoMo, không phải suy diễn.

## Luồng P2P Transfer (nội bộ, không qua rail ngoài) — đã làm thật

```
1. Client → transfer-service: POST /transfer {fromUserId, toPhone, amount}
2. transfer-service → user-service: tra cứu userId theo toPhone
3. transfer-service → wallet-service: debit ví người gửi
4. transfer-service → wallet-service: credit ví người nhận
5. Nếu bước 4 fail sau khi bước 3 đã thành công → compensating transaction (credit lại người gửi)
```

Khác payment-hub: đây là **saga đồng bộ** (không qua Kafka) vì cả 2 phía đều trong cùng hệ thống,
không có external rail — nhưng vẫn cần 2 lời gọi tách biệt (không phải 1 DB transaction xuyên
service), nên vẫn cần compensating logic, không phải tất cả saga đều async.

## Luồng chuyển khoản ra ngân hàng ngoài (bank-transfer-out) — đã làm thật

**Quyết định kiến trúc quan trọng**: logic này nằm trong `topup-service`, **không phải**
`transfer-service`. Lý do: mock-bank-gateway ACK ngay rồi xác nhận thật qua IPN bất đồng bộ (giống
hệt luồng top-up) — cần persist trạng thái PENDING giữa 2 bước đó. `transfer-service` cố tình
không có DB (xem mục P2P Transfer ở trên); thay vì phá vỡ thiết kế đó, bank-transfer-out tái dùng
DB + hạ tầng IPN đã có sẵn của `topup-service` (`BankTransferOutRequest`, cùng bảng
`bank_transfer_out_requests`, do Hibernate `ddl-auto: update` tự tạo).

```
1. Client → topup-service: POST /bank-transfers {userId, bankCode, accountNumber, amount}
2. topup-service → wallet-service: debit ví người gửi NGAY (đồng bộ, giống WithdrawalController)
3. topup-service → mock-bank-gateway: POST /v2/gateway/api/create (ipnUrl trỏ /ipn/bank-transfer-out)
4. mock-bank-gateway ACK ngay → topup-service lưu BankTransferOutRequest(status=PENDING)
5. (bất đồng bộ) mock-bank-gateway → POST topup-service /ipn/bank-transfer-out
   - resultCode=0 → status=CONFIRMED, không cần thao tác ví gì thêm (đã debit ở bước 2)
   - resultCode≠0 → status=FAILED, hoàn tiền lại cho người gửi (credit) — bước compensating
```

**Khác top-up ở đâu**: top-up chỉ credit ví SAU KHI IPN xác nhận (không có gì để hoàn nếu fail).
Ở đây debit xảy ra TRƯỚC khi biết kết quả thật — nên nhánh FAILED phải hoàn tiền, tương tự bước
compensating của P2P transfer's saga ở trên, chỉ khác là bất đồng bộ (qua IPN) thay vì đồng bộ.

**Adapted, chưa xác minh riêng**: mock-bank-gateway chỉ có 1 endpoint `/v2/gateway/api/create`,
dùng chung cho cả 2 chiều tiền vào/ra — công thức chữ ký/field giữ nguyên như Collection Link thật
đã xác minh (chiều tiền vào), nhưng MoMo's public docs không có API cho chiều "gửi tiền ra ngân
hàng ngoài" nên đây là suy diễn kỹ thuật hợp lý, không phải spec đã xác minh — giống cách
`transfer-service`/`bill-payment-service` đã ghi ở trên.

## Luồng bill payment (bill-payment-service) — đã làm thật, cố tình 100% mock

**Không có spec MoMo công khai cho bill aggregation** (README's "không có spec MoMo công khai"
section) — không có field/API thật nào để bám. Thay vì giả vờ có nguồn, toàn bộ "biller" ở đây là
mock, và code/UI nói rõ điều đó (không dùng tên nhà cung cấp thật như EVN/VNPT/...).

```
1. Client → bill-payment-service: GET /bills/lookup?category=ELECTRICITY&customerCode=PD01001234
   → trả về { customerName, amount, period } — amount = hash(category + customerCode) ánh xạ vào
     khoảng 50.000đ–2.000.000đ, làm tròn 1.000đ. Cùng category + customerCode luôn ra cùng amount
     (deterministic), nhưng đây không phải số dư nợ thật của ai cả.
2. Client → bill-payment-service: POST /bills/pay { userId, category, customerCode }
   (KHÔNG có field `amount` — server tự tính lại bằng đúng công thức ở bước 1, nên người trả không
   thể trả số tiền khác số đã được báo ở bước tra cứu)
3. bill-payment-service → wallet-service: POST /wallets/{userId}/debit { amount, type=BILL_PAYMENT }
   (tái dùng giá trị TransactionType.BILL_PAYMENT đã có sẵn từ trước — không thêm enum mới, không
   cần ALTER CHECK constraint)
4. bill-payment-service lưu BillPayment(category, customerCode, amount, createdAt) vào DB riêng
   `ewallet_bill_payment`, trả về receipt (kèm balance mới từ bước 3)
```

**Quyết định kiến trúc: đồng bộ, không có bước xác nhận bất đồng bộ nào** — khác hẳn top-up
(mock-bank-gateway ACK ngay rồi IPN xác nhận sau) và bank-transfer-out (debit trước, hoàn tiền nếu
IPN báo fail). Một biller giả lập không có "ngân hàng đối tác" nào cần round-trip bất đồng bộ để mô
phỏng — bước 2 ở trên hoặc thành công trọn vẹn (debit + lưu receipt), hoặc thất bại ngay (409 nếu số
dư không đủ) mà không để lại state PENDING nào. Đây là quyết định thiết kế có chủ đích, không phải
thiếu sót — ghi rõ ở đây để người đọc sau không nhầm là quên làm phần async.

**`bill-payment-service` có DB riêng từ đầu** (`ewallet_bill_payment`) — khác với `transfer-service`
(cố tình không có DB, xem mục P2P Transfer ở trên), service này không có điểm rẽ kiến trúc nào cần
bàn: nó lưu domain record của riêng nó (category/customerCode/amount), còn wallet-service's
`Transaction` (type=`BILL_PAYMENT`) vẫn là nguồn sự thật duy nhất về ảnh hưởng tới số dư.

## Concurrent debit/credit trên cùng ví — optimistic lock, không phải bug về tính toàn vẹn (issue #5)

`Wallet` dùng `@Version` (optimistic locking) — khi 2 request debit/credit cùng ví chạy đồng thời,
người thua race không double-spend (số dư cuối luôn đúng), nhưng ban đầu người thua nhận
`ObjectOptimisticLockingFailureException` không được `WalletController` bắt, rơi xuống Spring's
mặc định → **HTTP 500 thô**, cascade sang `topup-service`'s `/withdrawals`/`/bank-transfers` và
`transfer-service`'s `/transfers` (2 nơi này chỉ bắt `HttpClientErrorException.Conflict`, không bắt
được lỗi 500 nên message thân thiện dự kiến — "Số dư không đủ để rút/chuyển" — không hiện ra).

**Fix**: `WalletService.credit`/`debit` giờ không tự `@Transactional` nữa — chúng gọi
`WalletMutationExecutor` (bean riêng, giữ logic `@Transactional` 1-lần-1-attempt) qua một vòng retry
tối đa 4 lần với backoff tuyến tính ngắn (25ms × lần thử). Retry phải nằm ở bean khác vì
`@Transactional` chỉ có hiệu lực qua Spring proxy — 1 method không thể tự retry chính nó xuyên
transaction bằng cách gọi lại chính nó (self-invocation không đi qua proxy). Mỗi lần retry đọc lại
`Wallet` (và `@Version`) mới nhất từ DB trong 1 transaction hoàn toàn mới, nên race thật (2-3 request
đồng thời như test của agent-tester) gần như luôn được retry thành công trong vài lần thử. Nếu vẫn
thua sau 4 lần (contention kéo dài bất thường), `WalletController` giờ có thêm
`@ExceptionHandler(ObjectOptimisticLockingFailureException.class)` trả về **409** với message tiếng
Việt ("Ví đang được xử lý ở giao dịch khác, vui lòng thử lại") — cùng pattern với
`IllegalStateException` (insufficient balance) đã có sẵn. Vì lỗi giờ là 409 (`HttpClientErrorException.Conflict`
khi gọi qua `RestClient`), `topup-service`/`transfer-service`'s handler hiện có tự động bắt đúng mà
không cần sửa gì ở 2 service đó.

## Giới hạn trên cho amount — @DecimalMax dựa trên hạn mức MoMo thật đã xác minh (issue #6)

Trước đây không DTO nào có `@DecimalMax` — credit 10^30 VND vẫn HTTP 200. Đã thêm giới hạn trên cho
từng endpoint, dựa trên hạn mức giao dịch **thật, đã xác minh** của MoMo (không phải suy đoán):

- Nguồn: https://www.momo.vn/hoi-dap/han-muc-giao-dich-moi-ngay và
  https://www.momo.vn/hoi-dap/han-muc-nap-rut-tien-moi-ngay-la-bao-nhieu (fetch trực tiếp
  2026-09-23) — số dư ví tối đa 200.000.000đ; nạp qua NH liên kết tối đa 50.000.000đ/ngày; nạp qua
  chuyển khoản ví-ví tối đa 100.000.000đ/ngày; rút ra khỏi ví hoặc thanh toán tối đa
  50.000.000đ/ngày.
- Áp dụng: `TopupRequestDto.amount` ≤ 50.000.000 (nạp), `WithdrawalRequestDto.amount` và
  `BankTransferOutRequestDto.amount` ≤ 50.000.000 (rút/chuyển ra NH ngoài — cùng nhóm "tiền ra khỏi
  ví" với MoMo), `TransferRequestDto.amount` ≤ 100.000.000 (P2P ví-ví), `AdjustBalanceRequest.amount`
  (endpoint nội bộ `wallet-service` mà mọi service khác gọi vào) ≤ 200.000.000 (= mức trần số dư ví
  thật, làm ceiling chung cho 1 lần ghi sổ).
- **Adapted, không phải spec 1:1**: các số liệu trên là hạn mức **theo ngày** (daily aggregate) của
  MoMo thật; lab này áp dụng chúng như **giới hạn mỗi lần gọi** (`@DecimalMax` per-request), không
  track tổng số tiền giao dịch trong ngày của từng user — việc đó cần thêm state (đếm theo
  ngày/user) ngoài phạm vi issue #6 (priority-low; hạn mức **theo tháng** — khác "theo ngày" — được
  làm riêng ở issue #7 ngay dưới đây, dùng số liệu pháp luật NHNN thật thay vì số MoMo công bố). Ghi
  rõ ở đây để không ai nhầm là đã implement
  đúng "hạn mức/ngày" thật.

## Hạn mức giao dịch/tháng — Điều 26 Thông tư 40/2024/TT-NHNN, sửa bởi Thông tư 41/2025/TT-NHNN (issue #7)

Khác hẳn issue #6 (hạn mức MoMo công bố, áp per-request, dùng `@DecimalMax`), đây là hạn mức **pháp
luật NHNN thật, cộng dồn theo tháng** — validate rule đầu tiên trong lab dùng số liệu pháp luật thay
vì số một nhà cung cấp tự công bố.

- **Nguồn đã xác minh** (agent-designer, fetch trực tiếp thuvienphapluat.vn/vnba.org.vn/lsvn.vn,
  2026-09-23): Thông tư 40/2024/TT-NHNN (17/07/2024), Điều 26 — tổng hạn mức giao dịch (chuyển tiền
  giữa các ví cùng 1 tổ chức + thanh toán hàng hoá/dịch vụ hợp pháp) qua ví điện tử của 1 khách hàng
  tại 1 tổ chức cung ứng ví tối đa **100.000.000đ/tháng**. Thông tư 41/2025/TT-NHNN (05/11/2025) nâng
  lên 300.000.000đ/tháng riêng cho nhóm giao dịch thiết yếu (điện/nước/viễn thông/học phí/viện
  phí/bảo hiểm/khoản vay đến hạn tại TCTD) — **lab này KHÔNG áp dụng mức 300tr đó** cho bất kỳ
  `BillCategory` nào của `bill-payment-service` vì service đó hoàn toàn mock, không có domain mapping
  thật xác nhận category nào thuộc nhóm thiết yếu theo luật; áp flat **100.000.000đ/tháng cho mọi
  giao dịch outbound** là lựa chọn an toàn hơn, tránh tự suy đoán phân loại.
- **Phạm vi `TransactionType` tính vào hạn mức**: `TRANSFER_OUT`, `BILL_PAYMENT`, `WITHDRAW` (dùng
  chung cho cả `/withdrawals` lẫn `/bank-transfers` của `topup-service`, cả 2 gọi debit với
  `type=WITHDRAW`). **Không tính** `TOPUP`/`TRANSFER_IN`/`REFUND` — luật quy định hạn mức cho giao
  dịch chuyển tiền/thanh toán (outbound), không phải tiền nạp vào ví.
- **"Trong một tháng" = tháng dương lịch** (reset ngày 1 hàng tháng theo giờ server,
  `LocalDate.now().withDayOfMonth(1)`), không phải rolling 30 ngày — lựa chọn diễn giải, ghi rõ ở
  đây để không ai nhầm là bug nếu thấy hạn mức "reset" giữa tháng.
- **Cách tính, không cần persistence layer mới**: `WalletMutationExecutor.debitOnce` cộng dồn
  `amount` của mọi `Transaction` cùng `walletId`, cùng nhóm `TransactionType` outbound, `createdAt`
  từ đầu tháng hiện tại (`TransactionRepository.sumAmountByWalletIdAndTypeInSince`, JPQL
  `COALESCE(SUM(...), 0)`), cộng thêm amount của lần debit hiện tại, so với ngưỡng
  (`ewallet-lab.monthly-outbound-limit`, mặc định 100.000.000) — vượt thì `IllegalStateException`
  (409, message tiếng Việt dẫn nguồn Điều 26/TT 40+41) trước khi `wallet.debit(amount)` chạy.
  `wallet-service` đã có đủ dữ liệu (`Transaction` ledger) để tính on-the-fly — không cần bảng/service
  mới, khác điểm rẽ kiến trúc persistence đã chặn ở issue #3.
- **Race condition**: tính tổng cộng dồn nằm **trong cùng `@Transactional` method** với chính lần
  debit đang xét (không tính riêng rồi debit sau) — nếu 2 debit đồng thời cùng gần chạm ngưỡng, một
  trong hai sẽ thua race optimistic-lock trên `Wallet.version` (issue #5) khi `save()`, và
  `WalletService.withOptimisticLockRetry` chạy lại toàn bộ `debitOnce` (kể cả phần tính tổng) trên 1
  transaction hoàn toàn mới — lần retry sẽ thấy đúng giao dịch đã commit của người thắng race trước
  đó (READ_COMMITTED). Tính tổng ở tầng `WalletService` (ngoài transaction debit) thay vì trong
  `WalletMutationExecutor` sẽ mở lại đúng race này.
- **Verify thật đã chạy** (cluster-internal, `kubectl exec deploy/wallet-service`/`deploy/transfer-service`):
  user mới, credit 200.000.000 (TOPUP, không tính vào hạn mức) → transfer 100.000.000 (đúng bằng
  ngưỡng) qua `transfer-service`'s `/transfers` thật → **200**, số dư còn đúng 100.000.000 → transfer
  thêm bất kỳ số tiền nào → **409** đúng message, số dư không đổi. Riêng test cộng dồn
  **nhiều loại type khác nhau**: user khác, debit trực tiếp 40tr `WITHDRAW` (200) + 40tr
  `BILL_PAYMENT` (200, tổng 80tr) + 40tr `TRANSFER_OUT` (409, đúng vì 80+40=120tr > 100tr) — xác nhận
  3 type cộng dồn chung 1 pool, không tính riêng từng loại.

## Link nhận tiền (issue #3) + Nhắc trả tiền (issue #8) — `payment-request-service`

**Điểm rẽ kiến trúc — nơi persist `PaymentRequest`**: issue #3 tự nêu rõ đây là quyết định phải hỏi
trước (giống pattern "transfer-service cố tình không có DB" ở mục P2P Transfer). agent-dev đã dừng
lại comment 3 lựa chọn ((a) bảng mới trong `wallet-service`, (b) service độc lập mới có DB riêng,
(c) thêm DB vào `transfer-service` — cần sign-off) thay vì tự chọn. **Người vận hành đã quyết định
qua comment trực tiếp trên issue #3/#8**: chọn **(b) — service độc lập mới `payment-request-service`,
DB riêng `ewallet_payment_request`**, theo đúng pattern `bill-payment-service` (mỗi service 1 DB từ
đầu) — không đảo ngược quyết định "transfer-service không DB", không thêm bảng vào `wallet-service`.

**Gộp #3 và #8 vào 1 service, 1 domain model** (cũng là quyết định của người vận hành, không phải
agent tự chọn): cả 2 đều là "một khoản chờ giữa 2 user, sẽ được settle bằng 1 lần gọi thật vào
`transfer-service`'s `/transfers` sau đó" — khác nhau đúng 1 điểm: **ai được phép trả**. `PaymentRequest`
dùng field `kind` (`LINK` | `REMINDER`) để phân biệt thay vì 2 bảng/2 service trùng lặp:

- **`LINK`** (issue #3): `targetUserId` = null lúc tạo — bất kỳ ai có tài khoản Ewallet Lab hợp lệ
  và mở được URL `.../pay/<token>` (token = chính `PaymentRequest.id`) đều trả được. Đây là **đơn
  giản hoá có chủ đích của lab, không phải lỗ hổng bảo mật cần vá** (issue #3's Constraints ghi rõ
  điều này) — không có xác thực nào khác ngoài "là user hợp lệ của hệ thống".
- **`REMINDER`** (issue #8): `targetUserId` được resolve bằng SĐT **ngay lúc tạo** (tái dùng
  `UserServiceClient.findByPhone`, cùng lookup `transfer-service` đã dùng cho P2P) — chỉ đúng
  `targetUserId` đó mới được gọi `/pay`.

**`creatorPhone`/`creatorName` được client gửi thẳng lúc tạo** (từ session đã đăng nhập ở
frontend), không tra lại qua `user-service` — cùng mức độ tin cậy dữ liệu client-side mà phần còn
lại của lab đã dùng (vd. `transferService.transfer(session.id, ...)` không có xác thực server-side
nào khác). Lý do kỹ thuật: `transfer-service`'s `/transfers` nhận `toPhone` (không nhận `toUserId`),
nên `payment-request-service` cần sẵn SĐT của creator để gọi lại đúng saga đó lúc thanh toán mà
không phải gọi thêm 1 lượt tra cứu ngược.

**Luồng thanh toán — dùng chung 1 code path cho cả LINK và REMINDER, không tự debit/credit**:

```
1. (LINK)     A: POST /payment-requests/links {creatorUserId=A, creatorPhone, creatorName, amount, message}
              → PENDING, expiresAt = now + 24h (ewallet-lab.payment-link.ttl-hours, mặc định 24)
   (REMINDER) A: POST /payment-requests/reminders {..., targetPhone=B's phone, ...}
              → resolve targetUserId=B qua user-service, PENDING, expiresAt=null (không có TTL)
2. B mở link (LINK: GET /payment-requests/links/{token}) hoặc thấy trong danh sách
   "Đã nhận" (REMINDER: GET /payment-requests/reminders/received/{B})
3. B: POST .../pay {payerUserId=B}
   → payment-request-service GỌI LẠI transfer-service's POST /transfers thật
     {fromUserId=B, toPhone=creatorPhone (=A's phone), amount}
   → transfer-service chạy đúng saga đã có (lookup A theo phone → debit B → credit A, compensating
     nếu credit fail) — KHÔNG có code path nào khác đụng vào ví ở service này
   → thành công: PaymentRequest.status = PAID, paidByUserId=B, paidAt=now, transferReference =
     newBalance của B (chỉ để làm receipt reference, không phải khoá ngoại thật)
```

Điều này thoả đúng constraint của issue #8 ("Không tạo endpoint nào cho phép 'Trả ngay' bỏ qua
transfer-service's /transfers thật — số dư chỉ được thay đổi qua API đã có") — và áp dụng luôn cho
cả LINK dù issue #3 không bắt buộc rõ ràng, để không có 2 code path debit/credit khác nhau cho cùng
1 khái niệm "settle a payment request".

**Lazy-expiry cho LINK, không dùng `@Scheduled`**: một `PaymentRequest` kind=LINK còn `PENDING` mà
`expiresAt` đã qua sẽ được chuyển `EXPIRED` ngay khi bị đọc lần kế tiếp (GET, pay, hoặc cancel) —
`PaymentRequestService.checkExpiry`. Áp dụng cùng cơ chế "lazy-check khi đọc" mà issue #10
(lucky-money) sau này cũng chọn, dù bản thân issue #3/#8 không bắt buộc — chọn để nhất quán, không
phải vì có yêu cầu riêng. `REMINDER` không có `expiresAt` (issue #8's Acceptance criteria không có
TTL cho reminder) nên không bao giờ tự chuyển `EXPIRED`.

**Đã verify thật**:
- Cluster-internal (`kubectl exec deploy/payment-request-service`): tạo LINK → GET đúng dữ liệu →
  B pay → 200, PAID → B pay lần 2 → **409** ("đã được thanh toán rồi") → balance A/B đúng
  (+amount/-amount). Tạo REMINDER A→B → A thấy trong "sent", B thấy trong "received" → A tự gọi
  `/pay` với `payerUserId=A` (không phải target) → **403** → B gọi `/pay` → 200, PAID, balance đúng
  qua đúng `transfer-service`'s saga (kiểm tra bằng cách B's balance giảm đúng amount, A's balance
  tăng đúng amount). Lazy-expiry: đặt `PAYMENT_LINK_TTL_HOURS=0` tạm thời → tạo LINK mới → GET sau
  2s → tự chuyển `EXPIRED` → pay → 409 ("đã hết hạn") — sau đó revert env về 24 qua `helm upgrade`.
- **Ingress thật** (`http://api.ewallet-lab.local`, `http://shell.ewallet-lab.local`): lặp lại toàn
  bộ luồng LINK và REMINDER qua Ingress (không phải cluster-internal) với 2 user mới đăng ký qua
  Ingress — kết quả giống hệt trên. `http://shell.ewallet-lab.local/pay/<token>` trả **200** và
  serve đúng `index.html` (nginx's SPA `try_files $uri /index.html` fallback — xem shell's
  `nginx.conf`), xác nhận route deep-link không bị Ingress/nginx chặn ở tầng HTTP. **Chưa verify
  bằng trình duyệt thật** (click UI end-to-end trong `mfe-transfer`'s màn hình mới) — không có
  browser automation trong phiên này; logic nghiệp vụ, bundle đã build/deploy đúng (grep xác nhận
  `payment-requests`/`initialPayToken` có trong bundle chạy thật), và toàn bộ API/route đã verify
  qua network thật. Đây là gap tương tự agent-dev đã ghi nhận ở issue #4 (QR camera thật).

**Fix bug CRITICAL (race condition — double/multi-pay), phát hiện bởi agent-tester sau khi #3/#8
đã "Đã xong" lần đầu**: `pay()` (dùng chung LINK/REMINDER) ban đầu làm check-then-act — đọc
`status == PENDING` → gọi `transfer-service`'s `/transfers` **thật** → mới ghi `PAID` — không có
khoá nào giữa đọc và ghi. 8 request `pay()` đồng thời cùng 1 request → 7/8 trả 200, mỗi lần 200 là
1 lệnh `transfer-service` thật đã chạy → creator +700.000đ dù chỉ đáng lẽ +100.000đ 1 lần (double
transfer cân đối tiền-đi-tiền-lại, nhưng tổng thể vẫn là chuyển tiền thật nhiều lần ngoài ý muốn).
Root cause giống hệt bug wallet-service đã tự sửa ở issue #5, nhưng nặng hơn vì có 1 lệnh gọi HTTP
tới service khác (di chuyển tiền thật) xen giữa bước đọc và bước ghi — chỉ thêm `@Version` +
retry quanh `save()` (như wallet-service) là KHÔNG đủ, vì tới lúc `save()` chạy thì tất cả các
request đã race đều đã gọi `transfer-service` xong rồi.

Fix thật: **đảo thứ tự** — `PaymentRequestMutationExecutor.claimPendingOnce` giờ atomically
chuyển `PENDING -> PAID` (optimistic-lock protected qua `@Version` mới thêm vào `PaymentRequest`)
**TRƯỚC KHI** gọi `transfer-service` — chỉ người thắng cuộc đua claim này mới được phép gọi
`transfer-service` thật. `PaymentRequestService.pay()` retry claim tối đa 4 lần khi gặp
`ObjectOptimisticLockingFailureException` (giống `WalletService.withOptimisticLockRetry`, issue
#5) trước khi surface 409; nếu claim thắng nhưng `transfer-service` sau đó fail (số dư không đủ,
creator không tồn tại, lỗi mạng), `mutationExecutor.releaseClaim` revert lại `PENDING` để không bị
kẹt "PAID" mà tiền chưa thật sự di chuyển. `PaymentRequestController` có thêm
`@ExceptionHandler(ObjectOptimisticLockingFailureException.class)` → 409 (an toàn cho các chỗ
`save()` khác như `checkExpiry`/`cancelLink` nếu race, thay vì 500 thô).

**Verify lại race đã fix** (Ingress thật, `http://api.ewallet-lab.local`): tạo LINK 100.000đ →
bắn 8 request `pay` đồng thời cùng 1 payer → **1/8 trả 200 (PAID), 7/8 trả 409 sạch** (không phải
500) → balance creator/payer chỉ đổi đúng 1 lần ±100.000đ (không nhân bản). Retest sequential
double-pay/double-claim vẫn đúng 409, GET/list vẫn đúng dữ liệu sau khi refactor.

## Lì xì 1-1 nội bộ (issue #10) — `lucky-money-service`

**2 điểm rẽ kiến trúc, cả 2 đều đã dừng lại hỏi trước** (issue #10 tự đánh dấu rõ "phải hỏi trước,
đừng tự chọn") — người vận hành đã quyết định qua comment trực tiếp trên issue:

- **Điểm rẽ #1 (persistence)**: **service độc lập mới `lucky-money-service`, DB riêng
  `ewallet_lucky_money`** — theo đúng pattern `bill-payment-service`/`payment-request-service`.
  **KHÔNG gộp với #3/#8** dù cùng dạng "1 service phục vụ nhiều issue chưa có DB" — lý do khác biệt
  bản chất: lucky money **escrow tiền thật ngay lúc tạo** (debit sender ngay), còn payment-link/
  payment-reminder chỉ là "khoản chờ" chưa động tới tiền cho tới khi được xác nhận. Gộp 2 khái niệm
  khác bản chất này vào 1 domain model sẽ làm domain model đó phải cõng thêm state không cần thiết
  (escrow amount/refund) cho các case không escrow, và ngược lại.
- **Điểm rẽ #2 (cơ chế phát hiện hết hạn, MỚI — chưa từng có trong dự án)**: **lazy-check khi đọc**
  (so `now` với `expiresAt` mỗi lần `GET` — đơn hoặc danh sách — hoặc mỗi lần thử `claim`), **KHÔNG**
  dùng `@Scheduled` polling job. Đây là lần đầu dự án cần cơ chế phát hiện hết hạn tự động (khác hẳn
  pattern IPN hiện có, vốn được bên ngoài — `mock-bank-gateway` — chủ động gọi ngược, không phải
  service tự poll) — người vận hành chọn phương án đơn giản hơn (lazy-check) thay vì
  `@Scheduled`, chấp nhận trade-off "nếu không ai bao giờ mở lại thì tiền escrow 'treo' tới khi có 1
  lần đọc kích hoạt" cho quy mô lab này.

**Nguồn số liệu đã xác minh trực tiếp** (agent-designer, fetch raw HTML trực tiếp, không qua tóm tắt
AI — 2 vòng nghiên cứu):
- Số tiền: **tối thiểu 1.000đ, tối đa 20.000.000đ/lần** — trích nguyên văn từ
  momo.vn/hoi-dap/cach-li-xi-cho-1-nguoi: "bạn tự nhập số tiền bạn muốn lì xì (tối thiểu 1.000đ, tối
  đa 20.000.000đ)". **Ngưỡng riêng, không dùng lại** ngưỡng P2P transfer 100.000.000đ của issue #6
  (khác category giao dịch, đúng theo Constraints của issue #10).
- Hạn 48h + tự động hoàn tiền: nếu SĐT người nhận **chưa có tài khoản MoMo**, có **48 giờ** để đăng
  ký nhận, quá hạn **tự động hoàn tiền** lại người gửi — nguồn: momo.vn/hoi-dap/gui-li-xi-tren-vi-momo-la-gi,
  momo.vn/hoi-dap/su-dung-tinh-nang-li-xi-tren-momo-nhu-the-nao.

**Đã KHÔNG làm** (đúng scope MVP của issue, không phải bug bị bỏ sót): lì xì nhóm (multi-recipient,
tối đa 9 người), chế độ "số tiền ngẫu nhiên", luồng SMS mời cho SĐT chưa có tài khoản — nếu
`userService.getByPhone` không tìm thấy user, `lucky-money-service` trả lỗi 404 rõ ràng
("lab không hỗ trợ mời SMS cho SĐT chưa có tài khoản"), không giả vờ hỗ trợ invite.

**Escrow bắt buộc ngay lúc tạo, không phải tuỳ chọn**: `LuckyMoneyService.send` gọi
`wallet-service`'s `/debit` **trước khi** lưu record — nếu debit fail (409, số dư không đủ), không
có record nào được tạo. Không debit ngay sẽ cho phép A tạo nhiều lì xì vượt số dư thật (chưa trừ
tiền) rồi mới debit lúc B claim — rủi ro double-spend nếu A tiêu số tiền đó ở giao dịch khác trong
lúc chờ B claim (đúng rủi ro issue #10's Constraints đã cảnh báo).

**Không có `TransactionType` mới**: tái dùng đúng 3 giá trị enum đã có sẵn của `wallet-service`
(theo CLAUDE.md's "không tự bịa giá trị enum cho service khác") — `TRANSFER_OUT` cho escrow debit
lúc gửi (đúng nghĩa "tiền rời khỏi ví qua kênh P2P-giống", cũng khiến nó tính đúng vào hạn mức
giao dịch/tháng của issue #7), `TRANSFER_IN` cho credit lúc B claim, `REFUND` cho credit lúc tự
động hoàn tiền hết hạn (cùng field `TransactionType.REFUND` mà bank-transfer-out của topup-service
đã dùng cho compensating credit).

**Luồng đầy đủ**:

```
1. A: POST /lucky-money {fromUserId=A, fromName, toPhone=B's phone, amount, message}
   → lookup B qua user-service (như transfer-service) → reject nếu B == A
   → DEBIT A ngay (wallet-service /debit, type=TRANSFER_OUT) — escrow
   → lưu LuckyMoney(status=PENDING, expiresAt = now + 48h, cấu hình qua
     ewallet-lab.lucky-money.ttl-hours để test không phải chờ 48h thật)
2. B mở màn "Đã nhận" (GET /lucky-money/received/{B}) hoặc GET trực tiếp 1 bản ghi
   → mỗi lần đọc đều chạy checkExpiry: nếu PENDING và now > expiresAt →
     CREDIT lại A (type=REFUND) → status=EXPIRED_REFUNDED, KHÔNG cần B mở màn để trigger (bất kỳ
     GET nào, kể cả của chính A xem "Đã gửi", cũng kích hoạt)
3. B: POST /lucky-money/{id}/claim {toUserId=B}
   → checkExpiry trước (double safety — nếu vừa hết hạn đúng lúc claim thì trả 409 "đã hết hạn",
     không claim nhầm) → nếu vẫn PENDING và đúng targetUserId=B → CREDIT B (type=TRANSFER_IN) →
     status=CLAIMED
```

**Đã verify thật**:
- Cluster-internal (`kubectl exec deploy/lucky-money-service`): amount 500 (dưới 1.000) → 400;
  amount 30.000.000 (trên 20tr) → 400; gửi hợp lệ 50.000đ → balance A giảm ngay lập tức (escrow xác
  nhận thật, không phải giả định) → A tự claim (không phải target) → 403 → B claim → 200 CLAIMED,
  balance B tăng đúng → B claim lần 2 → 409 ("đã được nhận rồi"). Test hết hạn: đặt
  `LUCKY_MONEY_TTL_HOURS=0` tạm thời → gửi lì xì mới → balance A giảm ngay (escrow) → GET sau 2s →
  tự chuyển `EXPIRED_REFUNDED`, balance A tăng lại đúng amount (hoàn tiền tự động xác nhận thật) →
  B thử claim → 409 ("đã hết hạn"). Revert env về 48 qua `helm upgrade` sau khi test.
- **Ingress thật** (`http://api.ewallet-lab.local`): lặp lại luồng gửi → escrow → claim với 2 user
  đăng ký qua chính Ingress — kết quả giống hệt cluster-internal.
- **Chưa verify bằng browser automation thật** (click UI trong `mfe-transfer`'s `LuckyMoneyHome.tsx`)
  — không có tool đó trong phiên này; cùng loại gap đã ghi ở issue #3/#4/#8. Bundle đã build/deploy
  đúng, xác nhận qua grep chuỗi `"Giật lì xì"`/`"Nhận lì xì"`/`"escrow"` trong bundle chạy thật.

**Fix bug CRITICAL (race condition — "tạo tiền từ hư không"), phát hiện bởi agent-tester sau khi
#10 đã "Đã xong" lần đầu — nặng hơn bug tương tự ở #3/#8**: `claim()` ban đầu đọc
`status == PENDING` → gọi `wallet-service`'s `/credit` **thật** → mới ghi `CLAIMED`, không có khoá
giữa đọc và ghi. 8 request `claim()` đồng thời cùng 1 lì xì (escrow gốc chỉ 50.000đ) → **8/8 đều
trả 200 CLAIMED** → recipient được credit `8×50.000=400.000đ` trong khi sender chỉ debit (escrow)
**đúng 1 lần** lúc tạo — 350.000đ được tạo ra từ hư không, không có debit tương ứng ở đâu cả. Cùng
root cause với bug #3/#8 nhưng nặng hơn vì không có giao dịch cân đối nào bù lại — tiền thật biến
mất khỏi hệ thống kế toán 2 chiều.

Fix thật, cùng pattern claim-trước-move-tiền-sau đã áp dụng cho `payment-request-service`:
`LuckyMoneyMutationExecutor.claimPendingOnce` atomically chuyển `PENDING -> CLAIMED` (thêm
`@Version` vào `LuckyMoney`, kèm check đúng người nhận + đúng trạng thái) **TRƯỚC KHI**
`LuckyMoneyService.claim()` gọi `wallet-service`'s `/credit` — chỉ người thắng claim mới được
credit. `checkExpiry`'s luồng tự động hoàn tiền hết hạn có **cùng lỗ hổng y hệt** (đọc PENDING+quá
hạn → gọi `/credit` hoàn tiền → mới ghi `EXPIRED_REFUNDED`) nên được fix bằng đúng pattern:
`claimExpiryOnce` atomically claim transition hết hạn trước, chỉ người thắng mới gọi `/credit`
hoàn tiền — dù bug này chưa được agent-tester đo trực tiếp (chỉ cảnh báo "cùng pattern, chưa đo"),
đã tự verify bằng 8 GET đồng thời đúng lúc hết hạn (`LUCKY_MONEY_TTL_HOURS=0`) → chỉ hoàn tiền
đúng 1 lần. Cả 2 đường (`claim`/`checkExpiry`) đều có compensation: nếu `wallet-service` call sau
khi claim thắng lại fail, `mutationExecutor.revertToPending` đưa record về lại `PENDING` để không
bị kẹt ở trạng thái CLAIMED/EXPIRED_REFUNDED mà tiền chưa thật sự di chuyển. `LuckyMoneyController`
có thêm `@ExceptionHandler(ObjectOptimisticLockingFailureException.class)` → 409 (an toàn net cho
race sustained).

**Verify lại race đã fix** (Ingress thật, `http://api.ewallet-lab.local`): gửi lì xì 50.000đ →
bắn 8 request `claim` đồng thời cùng 1 recipient → **1/8 trả 200 (CLAIMED), 7/8 trả 409 sạch**
(không phải 200) → balance sender/recipient chỉ đổi đúng 1 lần ±50.000đ (không tạo tiền từ hư
không). Retest lazy-expiry race: hạ `LUCKY_MONEY_TTL_HOURS=0`, bắn 8 GET đồng thời đúng lúc hết
hạn → chỉ hoàn tiền đúng 1 lần (balance sender trở về đúng số trước khi gửi, không nhân bản), sau
đó claim → 409. Đã revert `LUCKY_MONEY_TTL_HOURS=48` bằng `kubectl set env`, xác nhận qua
`kubectl get deploy -o jsonpath` giá trị hiện tại đúng là `48`. Sequential double-claim vẫn đúng
409, GET/list vẫn đúng dữ liệu sau khi refactor.

## Ví Trả Sau — mô phỏng BNPL (issue #18) — `bnpl-service`

> **Disclaimer bắt buộc**: đây là **mô phỏng học tập**, **KHÔNG PHẢI** sản phẩm cho vay/tín dụng
> tiêu dùng thật. **KHÔNG CÓ** ngân hàng/công ty tài chính thật nào đứng sau Ví Trả Sau của lab
> này. Số liệu hạn mức/lãi/phí lấy từ MoMo thật để học; TPBank/MBV/VCBNeo chỉ là **nguồn tham khảo
> số liệu** (bên cấp hạn mức thật của sản phẩm MoMo), **không phải đối tác** của lab — lab không kết
> nối với bất kỳ tổ chức tín dụng nào. Không có thẩm định tín dụng, không dùng CIC/điểm tín dụng
> thật, không có logic từ chối.

**Quyết định kiến trúc (người vận hành, comment trên issue #18)**: **(b) service độc lập mới
`bnpl-service`, DB riêng `ewallet_bnpl`** — không phải bảng mới trong `wallet-service`. Lý do: đây là
nợ với 1 "bên thứ 3 giả lập", gần với quan hệ "khoản chờ" của `payment-request-service` hơn là "tiền
của chính user"; giữ `wallet-service` không phải "biết" khái niệm nợ/hạn mức tín dụng.

### Nguồn số liệu (agent-designer fetch trực tiếp `momo.vn/vi-tra-sau`, 2 vòng độc lập)

| Quy tắc | Giá trị dùng trong lab | Ghi chú |
|---|---|---|
| Hạn mức | **20.000.000đ cố định cho mọi user** | MoMo công bố 1.000.000đ–20.000.000đ, duyệt 3 phút. Lab lấy mức tối đa, duyệt ngay — mock có chủ đích, cấu hình `BNPL_CREDIT_LIMIT` |
| Lãi | **0%** nếu trả đúng hạn | Không cộng gì ngoài gốc + phí dịch vụ + phí trễ hạn |
| Hạn thanh toán | **Ngày 1 của tháng dương lịch kế tiếp** | Nguồn chỉ nói "đầu tháng tiếp theo", không có ngày cụ thể — ngày 1 là cách đọc sớm nhất, không bịa ngày khác (vòng nghiên cứu đầu ghi nhầm "ngày 5", đã tự đính chính) |
| Phí dịch vụ | **33.000đ/tháng, chỉ tháng có phát sinh giao dịch** | Cộng vào kỳ ngay lúc có giao dịch "mua" đầu tiên của tháng. **Lược bỏ có chủ đích** ưu đãi "5 giao dịch đầu miễn phí" của MoMo — lab không đếm giao dịch trọn đời; đây không phải thiếu sót |
| Phí trễ hạn | **1–4 ngày: 5,25% · 5–9: 10,5% · 10–14: 15,75% · ≥15: 21%** trên dư nợ | Cấu hình `ewallet-lab.bnpl.late-fee-tiers` |
| Bên cấp hạn mức | TPBank, MBV, VCBNeo (thật, của MoMo) | **Chỉ là nguồn tham khảo** — không có trong hệ thống lab |

Đối chiếu ngắn (comment bổ sung trên issue #18, chỉ phần đã xác minh trực tiếp): VNPay×Cake dùng
model **miễn lãi theo số ngày** ("lên đến 45 ngày"), không công bố hạn mức BNPL cụ thể — khác MoMo
(phí dịch vụ cố định + hạn "đầu tháng tiếp theo"). Lab chỉ mô phỏng model MoMo; các con số VNPay chưa
xác minh (5tr, 3,25%/tháng, 18–50 tuổi, 30% tối thiểu) **không** được dùng.

### Mô hình dữ liệu

- `CreditLine` (1/user, `user_id` unique): `creditLimit`, `outstandingPrincipal` (tổng gốc chưa
  trả — để kiểm tra hạn mức khả dụng chỉ cần 1 dòng), `disclaimerAcceptedAt`.
- `Statement` (1/tháng dương lịch có giao dịch, giờ Việt Nam `Asia/Ho_Chi_Minh`): `principal`,
  `serviceFee`, và **chỉ các khoản đã trả** (`principalPaid`, `serviceFeePaid`, `lateFeePaid`).
  **Phí trễ hạn KHÔNG được lưu** — luôn tính lại.
- `Draw` — 1 khoản "mua sắm trả sau" **tự chứa, mock**: không có merchant, không tiền nào di
  chuyển; chỉ tăng gốc của kỳ + giảm hạn mức khả dụng. **Không** tích hợp vào
  bill-payment/transfer/QR (ngoài phạm vi issue).
- `Repayment` (`PENDING` → `COMPLETED`/`FAILED`) + bảng phân bổ (`repayment_allocations`: bao
  nhiêu vào phí trễ hạn / phí dịch vụ / gốc của kỳ nào) — để hoàn lại chính xác khi debit thất bại.

### Phí trễ hạn — luôn tính lại theo `now` (lựa chọn hiện thực)

Với 1 kỳ đã quá hạn, mỗi lần đọc/trả nợ:

```
base       = gốc chưa trả + phí dịch vụ chưa trả
daysLate   = (hôm nay theo giờ VN) − dueDate        (trả đúng ngày 1 = đúng hạn, 0 ngày trễ)
lateFeeDue = max(0, round(tỷ lệ bậc(daysLate) × base) − lateFeePaid)
```

Tức là phí trễ hạn = % theo bậc **trên dư nợ còn lại tại thời điểm đó**, trừ đi phần phí trễ hạn
đã trả trước đó cho kỳ này. Không "đóng băng" số cũ: sang bậc mới thì tăng, trả bớt gốc thì giảm.
Làm tròn HALF_UP về đồng (VND không có đơn vị lẻ).

**Thứ tự phân bổ 1 lần trả nợ**: kỳ cũ nhất trước; trong mỗi kỳ: phí trễ hạn → phí dịch vụ → gốc.
Vì phí trễ hạn luôn được trả trước khi `base` giảm, trả hết 1 kỳ không thể "xoá" phí trễ hạn chưa
trả. Trả trước hạn (kỳ chưa đến hạn) được phép.

Ví dụ đã verify thật (gốc 1.000.000đ + phí 33.000đ, kỳ tháng 10): ngày 1/11 → 1.033.000đ (đúng
hạn); 3/11 (trễ 2 ngày, 5,25%) → phí trễ 54.233đ; trả đúng 54.233đ → còn 1.033.000đ; 9/11 (trễ 8
ngày, 10,5% = 108.465đ) → phí trễ còn 54.232đ; 19/11 (trễ 18 ngày, 21% = 216.930đ) → còn 162.697đ.

### Race condition — "claim trạng thái trước, move tiền sau" (bắt buộc theo #3/#8/#10)

- **Mọi thao tác ghi** (mua sắm, claim trả nợ, hoàn trả nợ) đều khoá dòng `CreditLine` của user
  trước (`SELECT ... FOR UPDATE`, `CreditLineRepository.lockByUserId`) → các thao tác trên cùng 1 Ví
  Trả Sau chạy tuần tự. `@Version` vẫn giữ trên `CreditLine` như lớp phòng thủ phụ, **không phải** cơ
  chế chính.
- **Trả nợ** (`BnplService.repay`): (1) transaction claim — khoá, tính dư nợ theo `now`, phân bổ,
  **giảm nợ + ghi `Repayment` PENDING, commit**; (2) **chỉ sau đó** mới gọi `wallet-service`'s
  `/debit` thật; (3) thành công → `COMPLETED`. Request đồng thời đọc lại dư nợ **đã giảm** → không
  thể trả 2 lần cho cùng 1 đồng. Debit thất bại (409 số dư không đủ, hay lỗi khác) →
  `revertRepayment` cộng lại đúng phần đã claim, `FAILED`.
- **Mua sắm**: thuần local (không gọi service khác), kiểm tra hạn mức khả dụng bên trong cùng
  transaction đã khoá → không thể vượt hạn mức khi bắn đồng thời.
- **Gap đã biết, không giấu**: nếu `wallet-service` đã debit nhưng response bị mất (timeout),
  bnpl-service vẫn revert → user mất tiền mà nợ không giảm; nếu process chết giữa claim và debit →
  nợ đã giảm mà tiền chưa trừ (`PENDING` treo). Cùng lớp gap với các service khác của lab (không có
  outbox/idempotency key giữa các service).

**Đã verify** (`BnplConcurrencyTest` với H2 + Postgres 16 thật chạy local): 12 request trả toàn bộ
dư nợ đồng thời → **1×200, 11×409**, ví chính bị trừ đúng 1 lần; 12×100.000đ trên dư nợ 300.000đ →
đúng 3 thành công; 12×3.000.000đ mua sắm trên hạn mức 20tr → đúng 6 thành công, dư nợ 18tr. Kiểm
chứng ngược: bỏ khoá dòng → 3/5 test race fail.

### `BNPL_REPAYMENT` — `TransactionType` mới của `wallet-service`

- Không tái dùng `WITHDRAW` (rút ra ngân hàng) hay `TRANSFER_OUT` (P2P) — sẽ làm sai sổ cái hiển
  thị cho user.
- **KHÔNG tính vào hạn mức 100tr/tháng (issue #7)**: Điều 26 Thông tư 40/2024/TT-NHNN liệt kê rõ
  "trả nợ vay đến hạn/quá hạn tại TCTD" là ngoại lệ không tính vào hạn mức — trả nợ Ví Trả Sau cho
  bên cấp hạn mức (TPBank/MBV/VCBNeo ở sản phẩm thật) khớp đúng mô tả này. Hiện thực: không thêm
  `BNPL_REPAYMENT` vào `MONTHLY_LIMIT_TYPES`. Đã verify: ví đã chạm trần 100tr `TRANSFER_OUT` trong
  tháng → `TRANSFER_OUT` thêm 1.000đ bị 409, nhưng trả nợ Ví Trả Sau 5.033.000đ vẫn 200.
- **Step-up xác thực (issue #15, QĐ 2345/QĐ-NHNN)**: issue yêu cầu VẪN áp dụng cho
  `BNPL_REPAYMENT`. **Tuy nhiên code của #15 (cũng như #12/#13) không có trên nhánh `master` mà
  issue #18 được làm trên đó** — không có `StepUpModal`/logic ngưỡng 10tr/20tr nào để móc vào.
  Không tự dựng lại #15 trong phạm vi ticket này; khi #15 được merge, `BNPL_REPAYMENT` phải được
  thêm vào tập loại giao dịch chịu step-up (mặc định áp dụng — không tìm được miễn trừ tương tự Điều
  26 cho QĐ 2345).
- **Bẫy CHECK constraint (CLAUDE.md)**: DB `ewallet_wallet` đang chạy có sẵn
  `transactions_type_check` sinh từ enum cũ — `ddl-auto: update` **không** tự nới. Đã tái hiện
  thật: Postgres có constraint cũ → `/debit` type `BNPL_REPAYMENT` 500 → bnpl-service trả 502 và
  hoàn lại nợ đúng. Fix trên DB đang chạy (đã chạy thử, verify bằng `\d+ transactions`):

  ```sql
  ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
  ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN
    ('TOPUP','WITHDRAW','TRANSFER_OUT','TRANSFER_IN','BILL_PAYMENT','REFUND','BNPL_REPAYMENT'));
  ```

  (Nếu `master` của bạn có thêm enum value khác từ #12/#13, giữ chúng trong danh sách.)

### API (`/bnpl`, cùng convention `userId` trên path, không có auth middleware)

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/bnpl/{userId}` | 200 `{opened:false}` nếu chưa mở; ngược lại hạn mức, dư nợ, sao kê (phí trễ hạn tính theo `now`) |
| POST | `/bnpl/{userId}/open` | Body `{acceptedDisclaimer:true}` bắt buộc — **backend cũng từ chối (400) nếu thiếu**, không chỉ UI. Mở lần 2 → 409 |
| POST | `/bnpl/{userId}/draws` | `{amount ≥ 1.000, số nguyên, label}` — vượt hạn mức khả dụng → 409 |
| POST | `/bnpl/{userId}/repayments` | `{amount ≥ 1, số nguyên}` — vượt tổng dư nợ → 400; không còn nợ / ví chính không đủ → 409; wallet-service lỗi → 502 (đã hoàn nợ) |

### Test nhanh mốc thời gian

`BNPL_CLOCK_OFFSET_DAYS=N` (Helm `bnplService.clockOffsetDays`) dời "hôm nay" của riêng
bnpl-service tới N ngày sau — để thử đến hạn/các bậc phí trễ hạn không phải chờ 1 tháng. **Chỉ để
test, phải revert về `0`** (cùng pattern hạ TTL ở #3/#10).

### Triển khai lên cluster đang chạy

DB `ewallet_bnpl` chỉ được tạo tự động trên Postgres **mới** (init script). Cluster đang chạy:

```
kubectl -n ewallet-lab exec deploy/postgres -- psql -U postgres -c "CREATE DATABASE ewallet_bnpl"
kubectl -n ewallet-lab exec deploy/postgres -- psql -U postgres -d ewallet_wallet -c "<2 câu ALTER ở trên>"
eval $(minikube docker-env)
docker build -t ewallet-lab/wallet-service:local wallet-service
docker build -t ewallet-lab/bnpl-service:local bnpl-service
helm upgrade ewallet-lab deploy/helm/ewallet-lab -f deploy/helm/ewallet-lab/values-local.yaml -n ewallet-lab
```

**Chưa verify trên minikube/Ingress thật** — môi trường phát triển của issue này không có Docker
daemon/minikube. Đã verify: build + 12 test (`./gradlew test`), và toàn bộ luồng HTTP (mở →
mua sắm → trễ hạn qua clock offset → trả 1 phần/toàn bộ → race 12 request → hạn mức tháng) với
`wallet-service` + `bnpl-service` thật trên Postgres 16 thật chạy local. Vẫn cần chạy lại các bước
Acceptance criteria qua `http://api.ewallet-lab.local` trước khi đóng issue.

## Điểm thưởng — mô phỏng loyalty (issue #19) — `loyalty-service`

> Đây là **chương trình điểm thưởng mô phỏng nội bộ** của lab — **không có đối tác, thương hiệu
> hay kho voucher thật nào đứng sau**. Phần thưởng duy nhất là hoàn tiền (VND) vào ví chính của chính
> user. Tên hiển thị và tên field/entity đều generic ("Điểm thưởng", `LoyaltyAccount`...), không
> dùng tên sản phẩm của bên thứ 3.

**Quyết định kiến trúc (người vận hành, comment trên issue #19)**: **(b) service độc lập
`loyalty-service`, DB riêng `ewallet_loyalty`** — tính điểm từ `wallet-service`'s
`GET /wallets/{userId}/transactions`, trả cashback qua `/credit`; không có code path credit riêng.

### Nguồn số liệu tham khảo (theo Context của issue #19)

Nghiên cứu do agent-designer thực hiện; tin nhắn mailbox mà issue trích dẫn (ts
`2026-10-03T16:45:00Z`, có URL đầy đủ và mức xác minh từng mục) **không có trong repo** (cùng tình
trạng code #12/#13/#15 — chỉ có ở bản local chưa push). Dưới đây chỉ ghi lại đúng những gì issue
khẳng định:

- **Đính chính quan trọng**: **"OneU" là chương trình của Techcombank, KHÔNG PHẢI MB Bank**
  (fetch trực tiếp `techcombank.com/thong-tin/blog/oneu`). Chương trình của MB Bank tên **"MB Star"**
  (điểm StarPoint). Giả định ban đầu của người vận hành sai ở điểm này.
- **OneU (Techcombank)**: 1 U-Point = 1 VND; tích qua nhiều kênh (thẻ 0,5–2%, thẻ tín dụng
  0,1–8%, hoá đơn 10.000–80.000 điểm/lần...); đổi voucher 500+ thương hiệu, dặm bay. Không có
  hạng riêng (ăn theo hạng VIP ngân hàng).
- **MB Star**: tích "tương ứng mỗi giao dịch hợp lệ" — **không tìm được tỷ lệ cụ thể công khai**;
  có chuyển tặng điểm; không công bố hạng.
- **SkyJoy (Vietjet)**: **1 điểm / 10.000đ** cơ bản, tối đa 12 điểm/10.000đ ở hạng cao nhất; 4
  hạng xét theo 12 tháng trượt; điểm không hết hạn.

### Thiết kế của lab (tự thiết kế, chỉ lấy cảm hứng cấu trúc)

| Quy tắc | Giá trị | Ghi chú |
|---|---|---|
| Giao dịch được tích điểm | **chỉ `BILL_PAYMENT`** | Xem lý do bên dưới |
| Tỷ lệ cơ bản | **1 điểm / 10.000đ** | Lấy từ tỷ lệ cơ bản SkyJoy; cấu hình `LOYALTY_SPEND_PER_POINT` |
| Hạng (theo tổng `BILL_PAYMENT` 12 tháng trượt) | Thành viên (0) ×1 · Thân thiết (≥5tr) ×1,2 · Ưu tiên (≥20tr) ×1,5 · Đặc biệt (≥50tr) ×2 | Tên + ngưỡng + hệ số **tự thiết kế**, chỉ mượn cấu trúc "4 hạng / 12 tháng trượt / hạng cao tích nhiều hơn" của SkyJoy; hệ số cao nhất cố ý thấp hơn nhiều so với 12× |
| Đổi điểm | **1 điểm = 100đ**, tối thiểu 100 điểm | ⇒ hoàn tiền cơ bản 1%. Tự thiết kế |
| Hết hạn điểm | không | Giống SkyJoy; đơn giản hoá MVP |
| Giao dịch trước khi tham gia | không tích điểm | Tài khoản điểm tạo lần đầu mở màn hình (`enrolledAt`); chỉ giao dịch từ lúc đó mới tích điểm, không "truy tặng". Hạng thì vẫn xét đủ 12 tháng |

**Vì sao chỉ `BILL_PAYMENT`** (issue cho phép agent-dev chọn, phải ghi lý do): nếu `TRANSFER_OUT`
được tích điểm, 2 tài khoản chuyển qua lại cho nhau sẽ "đẻ" điểm vô hạn, đổi ra cashback thật — lại
là lớp bug **tạo tiền từ hư không** của #3/#8/#10. `TOPUP`/`WITHDRAW` có vòng lặp tương tự. Thanh
toán hoá đơn là tiền rời khỏi các ví của lab sang biller (mock), không thể quay vòng.
`LOYALTY_REDEMPTION` là tiền vào và không tích điểm, nên không tự nuôi chính nó.

**Hệ số hạng áp dụng lúc đồng bộ**: mỗi lần đọc/đổi điểm, service lấy ledger ví (ngoài mọi
transaction/khoá DB), tính hạng hiện tại theo 12 tháng, rồi cộng điểm cho các hoá đơn **chưa được
cộng** theo hạng đó. Mỗi hoá đơn chỉ được cộng 1 lần (`point_entries.source_transaction_id` unique +
khoá dòng tài khoản). Hoá đơn làm user lên hạng cũng được cộng theo hạng mới — đơn giản hoá có chủ đích.

### Race condition — "claim trước, move tiền sau"

- Mọi thao tác ghi khoá dòng `loyalty_accounts` (`SELECT ... FOR UPDATE`).
- **Đổi điểm**: (1) đồng bộ; (2) transaction claim: khoá, kiểm tra đủ điểm, **trừ điểm + ghi entry
  `REDEEM` PENDING, commit**; (3) gọi `/credit` thật; (4) `COMPLETED`. Credit lỗi →
  `revertRedemption` hoàn điểm, entry `FAILED`.
- **Bug thật tìm ra khi test trên Postgres, đã sửa**: với `spring.jpa.open-in-view` mặc định (bật),
  1 persistence context sống suốt HTTP request. Tài khoản được đọc trước (ensureAccount/đồng bộ) rồi
  bị chính `SELECT ... FOR UPDATE` trả lại **bản cũ** → `StaleObjectStateException` → 9/12 request
  trả 500 thô (tiền vẫn đúng nhờ `@Version`). Fix: `open-in-view: false` (áp dụng cả
  `bnpl-service`). Test service-level không bắt được vì không đi qua HTTP → đã thêm
  `httpConcurrentRedemptionsNeverReturnServerErrors` (bật lại open-in-view thì test này fail).

**Đã verify**: 10 test (4 unit tính điểm/hạng + 6 concurrency/HTTP, H2). Bỏ khoá dòng thì 3/5 test
race fail. Trên Postgres 16 thật:
- Chỉ hoá đơn 1,25tr tích 125 điểm; chuyển tiền 5tr/rút 3tr không tích.
- Đổi điểm khi constraint chưa có `LOYALTY_REDEMPTION` → 502, điểm được hoàn. ALTER xong → đổi 100
  điểm = +10.000đ.
- Thêm hoá đơn 4tr → hạng Thân thiết, +480 điểm (×1,2).
- 12 request đổi toàn bộ 505 điểm đồng thời → **1×200, 11×409**, ví chỉ +50.500đ đúng 1 lần.

**`LOYALTY_REDEMPTION`**: `TransactionType` mới của `wallet-service`. DB đang chạy cần nới CHECK
constraint giống `BNPL_REPAYMENT` (thêm `'LOYALTY_REDEMPTION'` vào danh sách trong câu ALTER ở mục
"Ví Trả Sau"), và `CREATE DATABASE ewallet_loyalty`.

**Ngoài phạm vi** (theo issue, không tự mở rộng):
- dặm bay/hãng bay thật
- catalog voucher đối tác thật (nếu sau này có, chỉ được dùng voucher hư cấu kèm disclaimer)
- "mua hạng bằng tiền mặt" (rủi ro thông điệp như BNPL)
- liên minh quy đổi điểm (point-pooling)
- chuyển tặng điểm cho người khác

**Chưa verify qua minikube/Ingress.**
## Step-up xác thực khi giao dịch lớn — mô phỏng QĐ 2345/QĐ-NHNN (issue #15)

**Đây KHÔNG phải điểm rẽ kiến trúc cần persistence mới** — không có bảng/service mới nào được tạo.
Toàn bộ logic sống trong `wallet-service` (nơi đã có sẵn `Transaction` ledger từ issue #7) cộng với
1 điểm gọi read-only mới từ `topup-service` (lý do vì sao xem bên dưới).

**Nguồn đã xác minh trực tiếp** (agent-designer, fetch trực tiếp thitruongtaichinhtiente.vn):
Quyết định 2345/QĐ-NHNN (18/12/2023, hiệu lực 01/07/2024) — 1 giao dịch chuyển tiền/thanh
toán/**nạp ví điện tử** vượt **10.000.000đ**, HOẶC tổng các giao dịch đó trong **1 ngày** đạt/vượt
**20.000.000đ** (áp dụng từ giao dịch kế tiếp trong ngày), bắt buộc xác thực sinh trắc học — dưới
ngưỡng đó OTP là đủ. Số liệu dùng nguyên văn, không làm tròn/đổi khác.

**Mô phỏng, không phải tích hợp thật**: lab này KHÔNG có sinh trắc học/WebAuthn thật ở bất kỳ đâu.
"Xác thực bổ sung" chỉ là 1 field `stepUpConfirmed` trên request — thiếu/`false` khi ngưỡng bị vượt
→ lỗi rõ ràng yêu cầu xác nhận; `true` → coi như "đã xác thực thành công" và cho qua. Copy trên UI
(xem frontend DESIGN.md) nói rõ đây là mô phỏng, không ngụ ý tích hợp sinh trắc học thật.

**Phạm vi — rộng hơn issue #7 một cách có chủ đích**: `StepUpPolicy.STEP_UP_TYPES` =
`{TRANSFER_OUT, BILL_PAYMENT, WITHDRAW, TOPUP}` — **có bao gồm TOPUP**, khác #7 (chỉ 3 loại
outbound) vì nguồn QĐ 2345 nói rõ áp dụng cho "nạp tiền vào ví điện tử". Cả 4 loại cộng dồn chung
**1 pool duy nhất theo ngày** (không tách riêng inbound/outbound) — phản ánh đúng cách quy định mô
tả "tổng giá trị giao dịch trong ngày", không phải 2 hạn mức độc lập.

**"Trong 1 ngày" = ngày dương lịch theo giờ server** (`LocalDate.now().atStartOfDay(...)`, reset
lúc nửa đêm) — cùng cách diễn giải "reset theo lịch, không phải rolling window" mà issue #7 đã dùng
cho "trong 1 tháng", để 2 quy tắc reset trong dự án nhất quán với nhau.

**2 cơ chế enforce khác nhau, tuỳ thuộc bản chất đồng bộ/bất đồng bộ của từng loại giao dịch**:

1. **TRANSFER_OUT/BILL_PAYMENT/WITHDRAW (debit, đồng bộ end-to-end)** — check nằm **bên trong cùng
   `@Transactional` method** với chính lần debit đang xét (`WalletMutationExecutor.debitOnce`),
   đúng y hệt cách issue #7 đã làm cho hạn mức tháng (tính tổng, so ngưỡng, rồi mới `wallet.debit()`
   — không tính riêng rồi debit sau). Race condition được xử lý bằng đúng cơ chế optimistic-lock +
   retry đã có (issue #5): nếu 2 debit đồng thời cùng gần ngưỡng, người thua race
   `walletRepository.save()` sẽ được `WalletService.withOptimisticLockRetry` chạy lại toàn bộ
   `debitOnce` (kể cả phần tính tổng) trên 1 transaction hoàn toàn mới, thấy đúng giao dịch đã
   commit của người thắng trước đó. `AdjustBalanceRequest` (request nội bộ mọi service gọi vào
   `wallet-service`'s `/debit`) có thêm field `stepUpConfirmed` (nullable, null = false) — mỗi
   service gọi vào (`transfer-service`, `topup-service`'s `/withdrawals`/`/bank-transfers`,
   `bill-payment-service`) tự thêm field cùng tên trên DTO công khai của nó và forward nguyên vẹn.
   Vượt ngưỡng mà chưa confirm → `StepUpRequiredException` → **HTTP 428** (Precondition Required,
   RFC 6585) — cố tình khác 409 (đã dùng cho số dư không đủ và hạn mức tháng) để caller phân biệt
   được "cần xác nhận rồi gọi lại y hệt request này" khỏi "bị từ chối hẳn, đừng gọi lại y hệt".
2. **TOPUP (credit, bất đồng bộ)** — khác hẳn: tiền chỉ thực sự được cộng vào ví **sau khi IPN của
   mock-bank-gateway xác nhận**, qua Kafka, tiêu thụ trong chính `wallet-service` (xem
   `TopupConfirmedListener`) — **không có HTTP caller nào đang chờ ở thời điểm đó** để mang theo
   field `stepUpConfirmed`. Nhét check vào `creditOnce` cho TOPUP sẽ vô dụng về mặt UX (không ai
   ở đó để xác nhận). Vì vậy: `topup-service`'s `TopupService.initiate()` tự gọi 1 endpoint
   **read-only mới** trên wallet-service, `GET /wallets/{userId}/step-up-check?amount=X`
   (`WalletService.stepUpCheck`, dùng chung `StepUpPolicy`/cùng JPQL sum), **TRƯỚC KHI** tạo
   `TopupRequest` row hay gọi `mock-bank-gateway` — nếu cần xác nhận mà chưa có, trả 428 ngay, không
   để lại state PENDING nào (fail-fast, giống cách #6's `@DecimalMax` chặn trước khi tạo gì cả).
   **Hạn chế đã biết, ghi rõ chứ không giấu**: vì đây là read rồi mới act (không nằm trong 1
   transaction với chính hành động ghi sổ thật — vốn xảy ra sau này, bất đồng bộ), 2 request TOPUP
   đồng thời từ cùng 1 user, mỗi cái riêng lẻ dưới ngưỡng, có thể cùng đọc thấy "chưa cần xác nhận"
   trước khi IPN của cái nào đó kịp confirm và cập nhật ledger — khác hẳn nhánh (1) vốn đóng được
   race này hoàn toàn nhờ tính trong cùng transaction với hành động ghi sổ thật. Đóng hoàn toàn gap
   này cần `topup-service` giữ 1 khoá/tổng tạm tính xuyên suốt round-trip IPN — ngoài phạm vi issue
   này, chấp nhận như giới hạn quy mô lab của kiến trúc topup bất đồng bộ sẵn có.

**Vì sao không có Helm/env var mới để hạ ngưỡng test nhanh** (khác cách hạ TTL ở #3/#8/#10): ngưỡng
10tr/20tr là số liệu pháp luật đã xác minh, không phải tham số tuỳ ý như thời hạn hết hạn — hạ số
để test nhanh sẽ làm sai lệch chính con số cần verify. Test thay vào đó dùng số tiền thật gần/vượt
ngưỡng (xem phần verify dưới).

**Đã verify thật** (cluster-internal + Ingress thật `http://api.ewallet-lab.local`, user mới đăng
ký qua Ingress):
- Chuyển 5.000.000đ (dưới cả 2 ngưỡng) qua `transfer-service`'s `/transfers` → **200**, không có
  field `stepUpConfirmed` trong request cũng qua bình thường.
- Chuyển 15.000.000đ (>10tr/lần) không kèm `stepUpConfirmed` → **428**, message dẫn đúng QĐ
  2345/QĐ-NHNN; gọi lại y hệt request kèm `stepUpConfirmed: true` → **200**, balance đổi đúng.
- 3 lần chuyển 7.000.000đ liên tiếp cùng ngày (cộng dồn 21tr, vượt 20tr từ lần thứ 3) — lần 1, 2
  → 200 (chưa tới 20tr); lần 3 → **428** dù bản thân 7tr < 10tr/lần — đúng nhánh "cộng dồn ngày",
  không phải nhánh "đơn lẻ"; kèm `stepUpConfirmed: true` → 200.
- Test cộng dồn xuyên loại: debit trực tiếp `WITHDRAW` 12.000.000đ (kèm confirm, >10tr/lần) rồi
  TOPUP 9.000.000đ (chưa kèm confirm) → **428** dù riêng khoản TOPUP đó < 10tr/lần và < 20tr một
  mình — xác nhận WITHDRAW + TOPUP cộng chung 1 pool ngày, đúng thiết kế "1 pool, không tách
  inbound/outbound".
- TOPUP pre-flight: gọi `POST /topups` với amount 15.000.000đ, không kèm `stepUpConfirmed` → **428**
  ngay, không có `TopupRequest` row nào được tạo (xác nhận qua `GET /topups/{orderId}` sau đó không
  áp dụng vì orderId chưa từng sinh ra) và `mock-bank-gateway` không nhận request nào; gọi lại kèm
  `stepUpConfirmed: true` → **202 ACCEPTED**, luồng IPN chạy tiếp bình thường như cũ.
- Ranh giới ngày: verify logic tương tự cách #7 đã verify ranh giới tháng (đọc `currentDayStart()`
  qua code review + test cộng dồn trong cùng ngày như trên); không giả lập vượt qua nửa đêm thật
  (không có cơ chế hạ "ngày" xuống ngắn hơn để test nhanh, đúng lý do đã nêu ở trên).
- Insufficient-balance (409) và monthly-limit (409, issue #7) vẫn phân biệt rõ với step-up (428) —
  test 1 giao dịch vừa vượt hạn mức tháng vừa vượt ngưỡng step-up: monthly-limit check chạy trước
  trong `debitOnce` nên trả 409 (không phải 428) — thứ tự có chủ đích: hạn mức tháng là chặn cứng
  không thể "xác nhận cho qua", step-up có thể vượt qua bằng xác nhận, nên step-up không có lý do
  chạy trước một chặn cứng hơn.
- **Thứ tự step-up vs insufficient-balance (khác biệt cần lưu ý)**: trong `debitOnce`, step-up check
  chạy TRƯỚC `wallet.debit(amount)` (nơi check số dư) — nghĩa là 1 user vừa thiếu số dư vừa cần
  step-up sẽ thấy **428 trước**, không phải 409; chỉ sau khi xác nhận step-up và gọi lại mới thấy
  409 thật. Verify thật: user có 9.000.000đ balance, transfer 15.000.000đ (chưa kèm confirm) →
  **428** (không phải 409 dù rõ ràng không đủ tiền); kèm `stepUpConfirmed: true` → **409** ("Số dư
  không đủ để chuyển"). Đây là trade-off chấp nhận được cho lab (tốn thêm 1 lượt xác nhận trước khi
  biết thiếu tiền) chứ không phải bug — đảo ngược thứ tự (check balance trước) cũng hợp lý không
  kém, nhưng sẽ phá vỡ tính nhất quán "mọi rule không phải balance đều chạy trước balance trong
  `debitOnce`" (đúng thứ tự monthly-limit → step-up → balance hiện tại).

## Chia tiền (split-bill, issue #11) — `payment-request-service`

**Không phải điểm rẽ kiến trúc** — issue #11 tự nêu rõ đây KHÔNG cần hỏi trước (khác #12/#13/#14):
tái dùng đúng `payment-request-service` đã có (DB `ewallet_payment_request`), không service mới,
không DB mới.

**MoMo THẬT đã NGỪNG tính năng "Chia tiền" từ 31/08/2025** (nguồn:
momo.vn/tin-tuc/thong-bao/chia-tien-nhom-sieu-nhanh-va-de-dang-voi-qr-tren-7811) — đây là bài tập
domain model (nhóm tạm thời + link/QR + trạng thái thu), không phải bám 1 feature MoMo còn sống.
UX trước khi ngừng (nguồn: momo.vn/tin-tuc/thong-bao/ra-mat-tinh-nang-chia-tien-voi-qr-nhan-tu-moi-app-6952):
tạo mã trong màn "Nhận tiền" → nhập tổng tiền + số người chia (tự chia đều, hoặc nhập tuỳ chỉnh
từng người) + lời nhắn → tạo QR → chia sẻ → theo dõi "Danh sách đã thu".

**Model: mỗi share là 1 `PaymentRequest` bình thường, kind vẫn là `LINK`** — KHÔNG thêm enum value
mới (`SPLIT_SHARE`), tránh đúng cái bẫy Postgres CHECK constraint đã ghi trong CLAUDE.md (thêm giá
trị enum mới cho DB đang chạy cần `ALTER TABLE ... DROP/ADD CONSTRAINT` thủ công). Mỗi share bản
chất ĐÚNG LÀ 1 LINK — payable bởi bất kỳ ai có tài khoản Ewallet Lab hợp lệ, không resolve target
trước — nên tái dùng `PaymentRequestKind.LINK` là chính xác về domain, không phải một sự lách luật.
3 cột mới, đều nullable, thêm vào bảng `payment_requests` hiện có (Hibernate `ddl-auto: update` tự
generate, xác nhận qua `\d+ payment_requests`, không cần fix constraint gì vì không đụng enum):

- `group_id` (UUID) — chung cho mọi share của 1 lần tạo; `id` của từng share (token LINK) vẫn là
  duy nhất, dùng thẳng làm URL `.../pay/<id>` y hệt LINK bình thường — **không có endpoint pay
  riêng cho split-share**, `POST /payment-requests/links/{id}/pay` đã có sẵn xử lý đúng.
- `group_total` — tổng tiền của cả nhóm tại thời điểm tạo (denormalized, để tính tổng đã
  thu/còn thiếu không cần re-sum mỗi lần đọc).
- `group_label` — tên khoản chia do người tạo đặt (khác `message`, vẫn giữ nguyên là lời nhắn
  tự do dùng chung style LINK/REMINDER).

**API mới, chỉ 2 endpoint**:
- `POST /payment-requests/splits` — tạo N share cùng lúc. Chấp nhận đúng 1 trong 2 chế độ (validate
  thủ công trong service, không dùng bean validation vì là cross-field rule — cùng lý do
  bill-payment-service tự tính lại `amount` server-side thay vì tin client):
  - **Chia đều**: `totalAmount` + `peopleCount` (2–20) — chia `totalAmount` cho `peopleCount`,
    làm tròn XUỐNG tới đồng, phần dư gộp vào share ĐẦU TIÊN để tổng luôn khớp chính xác
    `totalAmount` (không trôi số do làm tròn) — lựa chọn tuỳ ý, ghi rõ ở đây để không ai nhầm là
    bug nếu thấy share đầu tiên lớn hơn vài đồng.
  - **Tuỳ chỉnh**: `amounts` (danh sách 2–20 số tiền cụ thể) — `group_total` = tổng danh sách.
  - Gửi cả 2 hoặc không gửi cái nào → 400.
- `GET /payment-requests/splits/{groupId}` — "Danh sách đã thu": từng share (đã áp lazy-expiry
  giống mọi LINK khác) + `totalCollected`/`totalRemaining` tính từ tổng các share `PAID`.

**Giới hạn số người 2–20: TỰ CHỌN, không phải số MoMo từng công bố** — không tìm được nguồn công
khai cho giới hạn thật của tính năng đã ngừng này (khác lucky-money's 1-20tr/48h, vốn đã xác minh
trực tiếp). Ghi rõ ở đây, không trình bày như đã xác minh.

**Race condition — MIỄN PHÍ, không cần code mới**: vì mỗi share tái dùng nguyên vẹn
`PaymentRequestService.pay()`/`PaymentRequestMutationExecutor.claimPendingOnce` đã có (fix CRITICAL
từ issue #3/#8 — claim-trước-move-tiền-sau, `@Version` optimistic lock), bắn N request đồng thời
vào CÙNG 1 share tự động chỉ 1/N thắng, N-1 còn lại 409 sạch — không có code path debit/credit
riêng nào được viết cho split-bill.

**Đã KHÔNG làm** (ngoài scope MVP, không phải thiếu sót): giới hạn số người chia tuỳ theo hạn mức
pháp luật giao dịch/tháng (issue #7 vẫn áp dụng độc lập per-share vì mỗi share settle qua
`transfer-service`'s `/transfers` thật); huỷ 1 share riêng lẻ trong nhóm (creator vẫn có thể gọi
`POST /payment-requests/links/{id}/cancel` sẵn có cho từng share, không có endpoint "huỷ cả nhóm").

**Fix phụ phát hiện khi làm #11 (tương tác với issue #15)**: `payment-request-service`'s `pay()` gọi
`transfer-service`'s `/transfers` thật — sau khi #15 landing, giao dịch lớn có thể trả về 428 (step-up
required) mà `pay()` trước đó chỉ bắt `Conflict`/`NotFound`, mọi lỗi khác (kể cả 428) rơi vào nhánh
generic rethrow → surface thành 500 thô. Đã thêm: `PayRequestDto`/`TransferServiceClient` có thêm
`stepUpConfirmed` (forward y hệt cách #15 làm ở transfer-service/topup-service/bill-payment-service),
bắt riêng 428 → `ResponseStatusException(428, message)` thay vì để rơi xuống 500. Đây là fix một gap
thật trong đúng code path #11 khai thác nhiều (mọi lần `pay()`), không phải scope creep — áp dụng
luôn cho LINK/REMINDER hiện có (trước đây "vô hại" vì frontend chỉ dùng canned message theo status
code, chưa từng cần message thật). **Chưa nối `StepUpModal` vào `PaymentLinkPay.tsx`/
`PaymentReminderHome.tsx`** (frontend) — ghi nhận là gap còn lại, không phải yêu cầu của issue #11.
Cũng thêm `@ExceptionHandler(ResponseStatusException.class)` vào `PaymentRequestController` (như đã
làm ở `TransferController`/`TopupController`/`BillPaymentController` cho #15) để message thật được
forward thay vì Spring's `/error` JSON mặc định nuốt mất field `message`.

**Đã verify thật** (Ingress thật `http://api.ewallet-lab.local`, user đăng ký qua chính Ingress):
- Chia đều 300.000đ/3 người → 3 share 100.000đ mỗi share, `GET /splits/{groupId}` đúng
  `totalCollected=0`. Payer trả 1 share → `PAID`, `totalCollected` cập nhật đúng, share khác vẫn
  `PENDING`. Trả lại share đã trả → 409 sạch ("đã được thanh toán rồi").
- Chia tuỳ chỉnh `amounts=[20000,30000]` → 2 share đúng số tiền, `groupTotal=50000`.
- Validate: gửi cả `totalAmount+peopleCount` LẪN `amounts` → 400; gửi không cái nào → 400;
  `peopleCount=1` (dưới min) → 400 (bean validation).
- **Race condition** (yêu cầu bắt buộc của Acceptance criteria): bắn 8 request `pay` đồng thời vào
  CÙNG 1 share (100.000đ) → **1/8 trả 200 (PAID), 7/8 trả 409 sạch** — balance payer chỉ trừ đúng
  1 lần (2.000.000 → 1.900.000, không double-debit), balance creator chỉ cộng đúng 1 lần. Xác nhận
  cơ chế race-condition-safe của #3/#8/#10 áp dụng nguyên vẹn cho split-bill không cần code mới.

## Túi Thần Tài (issue #13) — bảng `savings_pockets` trong `wallet-service`

**Điểm rẽ kiến trúc — đã dừng lại hỏi trước khi code** (issue #13 tự đánh dấu bắt buộc, theo đúng
bài học #3/#8/#10 "đừng tự chọn"). 2 lựa chọn nêu ra trên issue:

- **(a) Bảng mới trong chính `wallet-service`** (`SavingsPocket` 1-1 với `Wallet`, cùng DB).
- **(b) Service mới `savings-pocket-service`** (DB riêng, gọi lại `wallet-service`'s credit/debit
  để di chuyển tiền giữa "2 túi", đúng pattern `payment-request-service`/`lucky-money-service`).

**Người vận hành chốt (a)** qua comment trực tiếp trên issue #13: bảng mới `SavingsPocket` trong
chính `wallet-service`, KHÔNG tạo service riêng — lý do được nêu rõ: tránh 2 nguồn số dư rời rạc
cần đồng bộ qua network cho 1 thao tác di chuyển tiền vốn tần suất cao (nạp/rút Túi Thần Tài có thể
xảy ra thường xuyên hơn nhiều so với payment-request/lucky-money, vốn là các giao dịch một-lần).
Trade-off được ghi nhận: `wallet-service` phình phạm vi trách nhiệm (từ "chỉ biết 1 số dư/user"
sang "biết cả sub-ledger + lãi suất") — chấp nhận cho quy mô lab này.

**Vì túi sống trong CÙNG service/DB với `Wallet`**, mọi thao tác nạp/rút giữa "ví chính" và "Túi
Thần Tài" là 1 transaction local duy nhất chạm 2 hàng có `@Version` (`Wallet` + `SavingsPocket`) —
không có network call nào xen giữa đọc và ghi, nên **không có check-then-act race window kiểu
#3/#8/#10** cho các thao tác `deposit`/`withdraw` (race duy nhất còn lại nằm ở bước tạo hàng mới
lúc `open`, xem phần fix bug bên dưới). `SavingsPocketMutationExecutor` tách riêng khỏi
`SavingsPocketService` với cùng lý do `WalletMutationExecutor` tách khỏi `WalletService` (issue
#5): retry optimistic-lock cần mỗi lần thử chạy trong 1 transaction hoàn toàn mới, đọc lại từ đầu
cả `Wallet` lẫn `SavingsPocket` cùng `@Version` của chúng.

**Nguồn lãi suất — đã xác minh trực tiếp, cố tình dùng số của ZaloPay chứ không phải MoMo**:

- **Dùng: ZaloPay "Tài Khoản Tích Lũy", 4%/năm**, hiệu lực từ 13/03/2024 — trích nguyên văn:
  "tỷ suất sinh lời là 4%/năm" (nguồn: zalopay.vn/tai-khoan-tich-luy-dieu-chinh-muc-sinh-loi-moi-4767,
  fetch trực tiếp). ZaloPay còn có sản phẩm khác lãi cao hơn ("Số dư sinh lời", 4.7%/năm từ
  01/08/2024, zalopay.vn/dich-vu/so-du-sinh-loi) nhưng KHÔNG dùng số đó — chọn "Tài Khoản Tích Luỹ"
  vì gần đúng bản chất "1 khoản tách riêng khỏi số dư chính, rút bất kỳ lúc nào" của Túi Thần Tài
  hơn là "Số dư sinh lời" (vốn sinh lời trên toàn bộ số dư ví, không phải 1 sub-ledger riêng).
- **KHÔNG dùng: MoMo "Túi Thần Tài" thật, 6%/năm** — con số này CÓ xuất hiện trên trang tin tức
  chính thức của momo.vn (momo.vn/tin-tuc/tin-tuc-su-kien/tui-than-tai-tang-han-muc-len-den-50-trieu-ty-2594),
  nhưng cố tình không dùng: lab chỉ mượn TÊN tính năng ("Túi Thần Tài" — chức năng, không phải
  logo/màu thương hiệu, đúng ranh giới CLAUDE.md), việc còn lấy đúng luôn cả con số lãi suất thật
  của MoMo sẽ khiến mô phỏng bám sát 1-1 vào đúng 1 sản phẩm tài chính thật của bên thứ ba thay vì
  chỉ là bài tập domain (sub-ledger + lãi kép) — dùng số của đối thủ (ZaloPay) giữ đúng tinh thần
  "functional pattern, không phải bản sao y hệt" đã áp dụng cho toàn bộ UI/IA của dự án.
- Cấu hình qua `ewallet-lab.savings-pocket.annual-rate` (default `0.04`), KHÔNG hardcode trong Java
  — `@Value` chỉ áp dụng default khi thiếu property, giống pattern `ttl-hours`/`accrual-period` của
  #10.
- **Tuyên bố rõ ràng: đây là lãi suất MÔ PHỎNG cho mục đích học tập.** Không có quỹ đầu tư hay
  ngân hàng lưu ký thật nào đứng sau khoản tiền trong `savings_pockets` — tiền vẫn nằm nguyên trong
  cùng 1 database Postgres của `wallet-service`, chỉ được cộng thêm "lãi" ảo theo công thức đơn
  giản mỗi chu kỳ, khác hẳn thực tế MoMo/ZaloPay (tiền được chuyển vào tiền gửi tiết kiệm thật tại
  ngân hàng đối tác). Dòng disclaimer này cũng hiển thị nguyên văn trên UI (`SavingsPocket.tsx`,
  xem frontend DESIGN.md), không chỉ nằm trong tài liệu kỹ thuật.

**Cơ chế tính lãi — lazy-compute khi đọc/ghi, KHÔNG dùng `@Scheduled`** (agent-dev tự chọn theo
đúng quyền issue #13 giao, lý do ghi ở đây): mọi lần `view`/`deposit`/`withdraw` đều gọi
`applyAccrual` trước, "bắt kịp" mọi chu kỳ TRỌN VẸN đã trôi qua kể từ `lastAccrualAt` bằng công
thức lãi kép `interest = balance * annualRate / 365` mỗi chu kỳ (mặc định 1 ngày,
`ewallet-lab.savings-pocket.accrual-period-seconds`, rút ngắn được để verify không phải chờ ngày
thật — cùng pattern "rút ngắn TTL rồi revert" đã dùng cho lucky money #10), rồi PERSIST luôn kết
quả (không chỉ tính tạm để hiển thị) — cùng lý do chọn lazy-check thay vì polling job ở #10: dự án
chưa có hạ tầng job scheduler nào khác, thêm 1 `@Scheduled` riêng cho 1 sub-ledger là over-engineer
so với quy mô lab, và lazy-compute vẫn cho kết quả CHÍNH XÁC same-as-scheduled tại bất kỳ thời điểm
đọc nào (khác trade-off "tiền treo tới khi có người đọc" của #10 — ở đây không có escrow chờ nhận,
chỉ là lãi chưa cộng dồn vào 1 con số hiển thị, vô hại nếu chưa ai mở lại túi).

**Bug fix — race condition khi `open` đồng thời (agent-tester phát hiện, KHÔNG phải rò tiền,
nhưng trả 500 thô thay vì 409 sạch)**: `openOnce()` làm đúng "check-then-act" —
`pocketRepository.findByWalletId(...).isPresent()` rồi mới `save(new SavingsPocket(...))` — không
gì bảo vệ khoảng giữa 2 bước đó ngoài UNIQUE constraint của Postgres trên `savings_pockets.wallet_id`.
Bắn 20 request đồng thời `open` cho 1 user mới → 1×200 + 10×409 (thua optimistic-lock retry ở bước
debit ví) + **9×500** (`DataIntegrityViolationException` từ UNIQUE constraint, không nằm trong
danh sách exception `SavingsPocketController` bắt). Số dư cuối cùng luôn đúng (không rò/nhân bản
tiền — insert vi phạm constraint khiến cả transaction rollback, kể cả bước debit ví trước đó), chỉ
sai ở mã lỗi trả về. Fix: `SavingsPocketService.withRetry` bắt thêm
`org.springframework.dao.DataIntegrityViolationException`, dịch thành `IllegalStateException("Túi
Thần Tài đã được mở trước đó")` (không retry — đây là xung đột thật, không phải lock tạm thời) để
`SavingsPocketController`'s `@ExceptionHandler(IllegalStateException.class)` đã có sẵn map đúng
409. Đây là bài học MỚI thêm vào CLAUDE.md: unique constraint có thể vi phạm ngay lần TẠO MỚI đầu
tiên (không chỉ lúc update), `DataIntegrityViolationException` cần được bắt riêng cho path đó.

**Đã verify thật** (Ingress thật `http://api.ewallet-lab.local`, user đăng ký qua chính Ingress):
- Luồng tiền cơ bản đúng từng đồng: open 500.000đ (dưới 10.000đ tối thiểu → 409) → deposit
  +300.000đ → túi 800.000đ, ví chính giảm đúng 300.000 → withdraw 200.000đ → túi 600.000đ, ví
  chính tăng đúng 200.000. Overdraft (rút 700.000 khi túi có 600.000) → 409. Deposit vượt số dư ví
  chính → 409. Edge case amount=0/âm → 400; vượt `@DecimalMax` → 400. Double-open (sequential) →
  409.
- Lãi tích luỹ THẬT, không phải field trang trí: hạ tạm `accrual-period-seconds` (10s/30s), nạp
  túi lên 15.600.000đ, `GET .../savings-pocket` lặp lại → balance tự tăng dần CHỈ do thời gian trôi
  qua (không deposit/withdraw), khớp đúng công thức, `lastAccrualAt` thực sự advance và persist. Đã
  revert env var sau test.
- Race condition `deposit`/`withdraw` ở tải 30 request đồng thời vào cùng 1 túi → đúng
  15×200 + 15×409, số dư khớp chính xác từng đồng — optimistic-lock retry an toàn ở tải cao.
- **Sau fix**: bắn lại 20 request đồng thời `POST .../savings-pocket/open` cho 1 user mới (nạp ví
  5.000.000đ, amount=100.000/request) → **1×200 + 19×409, KHÔNG còn request nào trả 500** — túi mở
  đúng 1 lần (100.000đ), ví chính trừ đúng đúng 1 lần 100.000đ, lặp lại 3 lần liên tiếp cho 3 user
  mới khác nhau đều cho kết quả giống hệt (1×200 + 19×409).

## Ví Gia Đình (issue #12) — service mới `family-wallet-service`, enforce ngay tại `wallet-service`

**Nguồn — đối thủ VNPay, KHÔNG PHẢI MoMo** (khác toàn bộ phần còn lại của lab): chủ ví chính mở "Ví
thành viên" cho cha/mẹ/con cái/người thân, đặt hạn mức chi tiêu riêng, xem được thành viên chi tiêu
gì — nguồn: vnpay.vn/mo-vi-thanh-vien-cho-bo-me-con-cai-ngay-tren-vi-dien-tu-vnpay-x5cufcpbp1a (đã
fetch/tìm lại trực tiếp để xác nhận, không suy đoán từ trí nhớ): "người dùng có thể mở ví thành
viên cho cha, mẹ, con cái... từ đó cấp hạn mức chi tiêu", "ví chính của bố mẹ có thể kiểm soát và
nắm bắt được thông tin về việc chi tiêu của con cái".

**Điểm rẽ kiến trúc — đã dừng lại hỏi trước khi code** (issue #12 tự đánh dấu bắt buộc, `AskUserQuestion`
không khả dụng trong phiên đó → comment 3 lựa chọn lên issue, đúng fallback #3/#10/#13, không tự
chọn). 3 lựa chọn nêu trên issue, người vận hành chốt qua comment:

- **Phạm vi — (a) Overlay quyền hạn trên model 1-wallet-per-user hiện có**: service mới
  `family-wallet-service` (DB riêng `ewallet_family_wallet`), chỉ lưu
  `{parentUserId, memberUserId, monthlyLimit}`, cộng dồn chi tiêu bằng cách đọc lại
  `wallet-service`'s `Transaction` ledger — **KHÔNG đụng `Wallet.userId`'s `unique = true`**.
  Member vẫn là 1 user độc lập, tự đăng ký/đăng nhập, tự có ví riêng — khác VNPay thật ở chỗ member
  phải tự có tài khoản Ewallet Lab trước (lab không có "mở ví hộ" thật). KHÔNG chọn (b) true
  sub-wallet (member không cần tài khoản riêng — phạm vi lớn hơn nhiều, cần nới constraint/khái
  niệm user mới, không làm trong 1 lượt) hay (c) thu hẹp bỏ phần xem lịch sử (issue vẫn giữ đủ Task
  gốc bao gồm xem lịch sử).
- **Nơi enforce hạn mức — (ii) chặn ngay tại `wallet-service`'s debit path**, KHÔNG phải mỗi
  service debit (transfer/topup/bill-payment) tự hỏi trước. 1 điểm sửa duy nhất
  (`WalletMutationExecutor.debitOnce`), đổi lại `wallet-service` phải biết khái niệm "family" tồn
  tại — giống hệt cách `wallet-service` đã biết gọi ra ngoài cho step-up (#15). Trade-off được nêu
  rõ trên issue: gọn hơn (ii) đổi lấy việc phá 1 phần ranh giới "wallet-service không biết gì về
  family" — chấp nhận cho quy mô lab này, thay vì rải logic gọi family-wallet-service vào 3 service
  khác nhau.

**`family-wallet-service` không bao giờ tự di chuyển tiền** — không có code path nào gọi
`wallet-service`'s `/credit`/`/debit`. Nó chỉ là 1 bảng `family_links` phẳng
(`{id, parentUserId, memberUserId (unique), memberPhone, memberName, monthlyLimit, createdAt}`) +
API đọc/ghi permission, và 1 endpoint đọc-only nội bộ
`GET /family-wallets/members/{memberUserId}/limit` để `wallet-service` hỏi trước khi debit.
`memberUserId` **unique** — 1 thành viên chỉ thuộc 1 gia đình tại 1 thời điểm (giản lược MVP, không
nằm trong Task gốc nhưng cần thiết để "hạn mức nào áp dụng" không mơ hồ nếu 2 parent cùng thêm 1
member).

**`wallet-service`'s `FamilyWalletServiceClient` fail-open, không phải fail-closed, khi
`family-wallet-service` lỗi/timeout**: 404 (không phải thành viên gia đình nào — trường hợp phổ
biến tuyệt đối) và lỗi hạ tầng (connection refused/timeout/5xx) đều được xử lý GIỐNG NHAU — "không
áp hạn mức lần này" — thay vì chặn toàn bộ debit của mọi user chỉ vì 1 service phụ trợ nhỏ tạm thời
down. Trade-off có chủ đích, ghi rõ ở đây: mở ra 1 khoảng hẹp nơi thành viên có thể vượt hạn mức
ĐÚNG lúc `family-wallet-service` gặp sự cố — chấp nhận cho quy mô lab, thay vì buộc luồng debit lõi
(dùng bởi TOÀN BỘ user, không riêng gì gia đình) phải hard-depend vào uptime của 1 tính năng add-on.

**Hạn mức gia đình dùng lại đúng phép đo "chi tiêu tháng này" đã có từ issue #7** (Điều 26 Thông tư
40/2024/TT-NHNN): cùng `spentThisMonth`/`projectedSpend` tính TRONG CÙNG 1 câu query/transaction
cho hạn mức pháp luật, family limit chỉ là 1 ceiling thứ 2, độc lập, tính thêm ngay sau đó — không
phải 2 lần tính riêng rẽ có thể lệch nhau. Tính bên trong CÙNG `@Transactional debitOnce` (không
phải pre-check tách rời) vì đúng lý do race-safety đã áp dụng cho #7/#15: 1 lần retry thua
optimistic-lock sẽ chạy lại toàn bộ method này (kể cả 2 phép tính spend) trên dữ liệu đã commit của
người thắng.

**Bug fix — race condition khi thêm thành viên MỚI đồng thời (cùng loại lỗi vừa phát hiện+fix ở
#13, tự kiểm tra trước khi báo xong theo đúng yêu cầu của lượt việc này)**: `addOrUpdateMember` ban
đầu cũng là check-then-act — `findByMemberUserId(...).isEmpty()` rồi mới insert `FamilyLink` mới —
chỉ được bảo vệ bởi UNIQUE constraint của Postgres trên `family_links.member_user_id`. 2 request
đồng thời "thêm cùng 1 member chưa từng được link" (vd. parent bấm "Lưu" 2 lần liên tiếp, hoặc 2
parent khác nhau cùng lúc thêm đúng 1 member) đều có thể đọc `isEmpty()` trước khi 1 trong 2 insert
commit → request thua nhận `DataIntegrityViolationException` thô (500) thay vì rơi đúng vào nhánh
"đã tồn tại" (update nếu cùng parent, 409 nếu khác parent). Fix theo ĐÚNG pattern
`WalletMutationExecutor`/`SavingsPocketMutationExecutor` đã dùng: tách `FamilyLinkMutationExecutor`
(bean `@Transactional` riêng, 1-attempt) khỏi `FamilyWalletService` (retry loop, tối đa 3 lần) —
`FamilyWalletService.addOrUpdateMember` bắt `DataIntegrityViolationException` và retry, mỗi lần thử
lại chạy trong transaction MỚI nên đọc lại `findByMemberUserId` thấy đúng bản ghi vừa commit của
người thắng, rơi đúng vào nhánh update/409 thay vì lỗi thô. Sau `MAX_UPSERT_ATTEMPTS` (3) lần vẫn
xung đột mới trả 409 sạch ("Xung đột khi thêm thành viên Ví Gia Đình (trùng thời điểm)").

**Ngoài phạm vi MVP** (ghi rõ theo đúng yêu cầu của issue #12 — đây là giới hạn có chủ đích, không
phải bug bị bỏ sót):

- **Tạo "ví con" không cần tài khoản riêng**: member trong MVP này LUÔN LÀ 1 user đã tồn tại của hệ
  thống (đã tự đăng ký qua `user-service`, tự có `Wallet` riêng) — không giả lập trẻ em/thành viên
  chưa có tài khoản. Đây chính là lý do chọn phương án (a) overlay thay vì (b) true sub-wallet (xem
  phần "Điểm rẽ kiến trúc" ở trên).
- **Giao diện app riêng cho trẻ em**: không có. Member dùng chung đúng 1 bộ giao diện
  `mfe-transfer`/`mfe-topup`/`mfe-bill-payment` như mọi user khác của Ewallet Lab — không có theme/
  luồng rút gọn nào dành riêng cho trẻ em.
- **Thông báo real-time khi member chi tiêu**: không có. Parent chỉ xem được lịch sử chi tiêu của
  member khi CHỦ ĐỘNG mở màn "Ví Gia đình" và bấm "Xem lịch sử chi tiêu" (poll thủ công qua 1 API
  call) — không có push notification/websocket/polling nền nào báo ngay khi member vừa thực hiện
  giao dịch.

## Quỹ nhóm (issue #14) — service mới `fund-service`

**Nguồn UX — đã fetch TRỰC TIẾP momo.vn/quy-nhom** (khác với lúc issue #14 được tạo, lúc đó
agent-designer chỉ có search-snippet, độ tin cậy thấp hơn — đã nâng cấp lên "đã xác minh trực
tiếp" trước khi code phần frontend, đúng khuyến nghị của Constraints). Trích các điểm chính:

- Luồng tạo quỹ: mở MoMo → tìm "Quỹ nhóm" → "Tạo quỹ mới" → nhập thông tin cơ bản → đồng ý điều
  khoản → hoàn tất + mời bạn bè.
- Minh bạch: "hiển thị toàn bộ lịch sử nạp/rút của thành viên; minh bạch tài chính mà không cần chủ
  quỹ tự tính toán thủ công".
- Hạn mức thật (lab KHÔNG áp dụng các con số này, chỉ ghi nhận để không bịa số khác): tối đa 2 quỹ
  tự tạo/tài khoản, tối đa 20 quỹ tham gia/tài khoản, tối đa 200 thành viên/quỹ, tối thiểu 1.000đ/
  giao dịch, tối đa 25.000.000đ/quỹ.
- **Rút tiền**: thành viên GỬI YÊU CẦU rút, chủ quỹ phải DUYỆT mới được rút — không phải member tự
  rút trực tiếp. Chủ quỹ giải thể quỹ bằng cách rút hết số dư còn lại về ví cá nhân.
- **Không đề cập lãi suất hay giới hạn thời gian tồn tại nào** trong tài liệu chính thức — khớp với
  quyết định "không làm lãi suất trong ticket này" của issue #14.

**MVP của lab đơn giản hoá HƠN NỮA so với MoMo thật** (operator đã xác nhận trên issue #14, giữ
nguyên style "MVP: chỉ creator được rút/giải thể, không voting/đa chữ ký" đề xuất ban đầu): không
có luồng "member request rút tiền + creator duyệt" nào cả — creator rút trực tiếp, member hoàn
toàn không có quyền khởi tạo một yêu cầu rút. Đơn giản hơn MoMo thật, không phải tương đương.

**Điểm rẽ kiến trúc — đã dừng lại hỏi trước khi code** (issue #14 tự đánh dấu bắt buộc).
2 lựa chọn nêu trên issue, người vận hành chốt qua comment:

- **(a) Service mới `fund-service`** (DB riêng `ewallet_fund`), sở hữu `Fund`/`FundMember`/
  `FundTransaction`, tự gọi lại `wallet-service`'s `/credit`/`/debit` để di chuyển tiền thật — ĐÃ
  CHỌN. Đúng convention project (mỗi domain mới = 1 service, giống `lucky-money-service`/
  `family-wallet-service`), domain N-N thành viên tách biệt rõ ràng khỏi `payment-request-service`
  (1-1).
- (b) Mở rộng `payment-request-service` — KHÔNG chọn, đúng khuyến nghị "không khuyến nghị" của
  issue (domain N-N thành viên, tồn tại lâu dài, không có expiry — khác hẳn 1-1 request/1 payer có
  thể hết hạn của payment-request-service).
- **Quyền rút tiền — giữ nguyên MVP mặc định của issue**: chỉ creator được rút/giải thể quỹ, không
  voting/đa chữ ký (operator xác nhận lại trong comment chốt kiến trúc, không yêu cầu khác).

**`fund-service` gọi `wallet-service`'s `/credit`/`/debit` trực tiếp, KHÔNG qua transfer-service's
saga** — cùng lý do `lucky-money-service` (issue #10) làm vậy: "phía bên kia" của một lần di
chuyển tiền không phải là 1 `Wallet` khác mà là `Fund.balance` nằm trong chính DB của
`fund-service` — transfer-service's API chỉ model "wallet-to-wallet", không áp dụng được ở đây.
Dùng lại nguyên `TransactionType` đã có: `TRANSFER_OUT` (member góp tiền ra khỏi ví), `TRANSFER_IN`
(creator rút/giải thể về ví), `REFUND` (hoàn tiền nếu bước local sau khi debit đã thành công lại
thất bại) — không bịa giá trị enum mới, đúng CLAUDE.md.

**Thứ tự external-call vs local-commit được chọn RIÊNG cho từng loại thao tác** (để đảm bảo không
bao giờ có "tiền sinh ra từ hư không" hay "tiền biến mất" nếu bước thứ 2 thất bại — cùng tinh thần
saga/compensation `transfer-service` và escrow `lucky-money-service` đã dùng):

- **Góp quỹ (`contribute`)**: debit ví member TRƯỚC (escrow-tại-nguồn, giống `lucky-money-service`'s
  `send`), rồi mới cộng `Fund.balance` cục bộ. Nếu bước cục bộ thất bại (quỹ vừa bị giải thể đồng
  thời, hoặc hết lượt retry optimistic-lock) — toàn bộ transaction cục bộ ROLLBACK (không có gì
  được ghi), nên chỉ cần hoàn lại đúng 1 bước: credit `REFUND` về ví member. Không cần method
  "revert" nào trên `Fund` cho path này.
- **Rút quỹ (`withdraw`)/Giải thể (`dissolve`)**: trừ `Fund.balance` cục bộ TRƯỚC (bảo vệ bằng
  optimistic lock + validate số dư/trạng thái trong CÙNG 1 transaction, giống `WalletMutationExecutor`
  xác nhận hạn mức #7/#15 trước khi debit), rồi mới gọi `wallet-service`'s `/credit` cho creator.
  Nếu bước credit bên ngoài thất bại, bước cục bộ ĐÃ COMMIT nên cần bù trừ chủ động:
  `Fund.revertWithdraw`/`revertDissolve` cộng lại đúng số tiền (và với dissolve, mở lại `ACTIVE`) —
  wrapped trong cùng vòng lặp retry optimistic-lock vì `@Version` của `Fund` có thể đã đổi do 1
  thao tác khác xen vào giữa lúc đó.

**Bug fix — race condition khi mời thành viên MỚI đồng thời (CÙNG LOẠI LỖI đã gặp ở #12/#13, bài
học mới ghi vào CLAUDE.md: constraint UNIQUE mới có thể vỡ ngay ở lần INSERT đầu tiên, không chỉ
lúc update, và PHẢI tự test ≥20 request đồng thời trước khi báo xong)**: `addMemberOnce` ban đầu là
check-then-act — `findByFundIdAndMemberUserId(...).isEmpty()` rồi mới insert `FundMember` mới —
chỉ được bảo vệ bởi UNIQUE constraint của Postgres trên `(fund_id, member_user_id)`. Khác với
`family-wallet-service`'s fix (dịch exception sang `IllegalStateException` rồi dừng, không retry,
vì "đã thuộc gia đình khác" là xung đột thật), fix ở đây RETRY toàn bộ `addMemberOnce` khi gặp
`DataIntegrityViolationException` — vì mời cùng 1 người vào cùng 1 quỹ là THAO TÁC IDEMPOTENT (lần
thử lại sẽ thấy `findByFundIdAndMemberUserId` giờ trả về bản ghi vừa commit của người thắng, trả
về luôn thay vì lỗi), không phải xung đột cần báo 409 ngay — hợp lý vì trong MVP này chỉ CREATOR
mới được mời (không có 2 "chủ sở hữu" khác nhau tranh giành 1 member như family-wallet-service's
trường hợp "2 parent khác nhau cùng mời 1 member").

**Đã tự test TRƯỚC KHI báo xong** (yêu cầu bắt buộc của lượt việc này, tránh lặp lại bài học #13):
bắn 30 request đồng thời (`xargs -P30`, không phải loop tuần tự có độ trễ) mời CÙNG 1 số điện
thoại CHƯA từng là thành viên vào 1 quỹ — log xác nhận NHIỀU request thật sự vỡ UNIQUE constraint ở
tầng Postgres (`duplicate key value violates unique constraint`, không phải chỉ tình cờ serialize),
nhưng cả 30/30 request đều trả **200 sạch, không có request nào trả 500**, và bảng `fund_members`
chỉ có đúng **1 hàng** cho (quỹ, member) đó.

**Đã verify thật** (Ingress thật `http://api.ewallet-lab.local`, user đăng ký qua chính Ingress):
- Tạo quỹ → creator tự động cũng là 1 `FundMember` (xuất hiện trong danh sách thành viên, có thể tự
  góp quỹ như người khác). `creatorName`/`creatorPhone` tra qua `user-service`'s `GET /users/{id}`
  (không tin tên do client tự gửi lên).
- Mời 2 thành viên → cả 2 CÙNG LÚC góp quỹ (500.000đ + 300.000đ) → balance quỹ đúng 800.000đ, lịch
  sử ghi đúng từng người/từng số tiền.
- Creator rút 200.000đ → đúng, ví creator cộng đúng 200.000đ. Member (không phải creator) cố rút →
  403 "Chỉ người tạo quỹ mới được rút tiền khỏi quỹ". Outsider (không phải thành viên quỹ) cố góp
  quỹ hoặc xem quỹ → 403, KHÔNG debit nhầm ví outsider.
- Race ≥8 request đồng thời: 8 lần góp quỹ đồng thời (2 member × 4 lần, 50.000đ/lần) → cả 8/8
  thành công, balance cộng đúng tuyệt đối từng đồng (không double-credit). 8 lần rút đồng thời
  (100.000đ/lần, quỹ dư đủ cho 8 lần) → 6×200 + 2×409 do hết lượt retry optimistic-lock dưới tải
  tranh chấp cao trên CÙNG 1 hàng (không phải lỗi logic — cùng loại kết quả tải cao đã thấy ở
  `SavingsPocket`/`Wallet`'s optimistic-lock retry, 2 request thua không làm rò/nhân bản tiền:
  balance cuối khớp chính xác `balance_trước - 6×100.000`).
- Giải thể quỹ bởi creator → balance quỹ về 0, status `DISSOLVED`, remainder cộng đúng vào ví
  creator. Member cố giải thể → 403. Góp/rút vào quỹ đã giải thể → 409 "Quỹ nhóm này đã được giải
  thể".
- Validate: amount < 1.000đ (tối thiểu verify trực tiếp từ momo.vn/quy-nhom) hoặc âm → 400. Tạo quỹ
  thiếu `name` → 400.
- Build sạch `./gradlew build` trên `fund-service`, image rebuild đúng tag
  `ewallet-lab/fund-service:local`, deploy thật lên namespace `ewallet-lab` (Helm template mới
  `fund-service.yaml`, DB `ewallet_fund` tạo thủ công trên Postgres đang chạy — lưu ý vận hành
  dưới đây).

**Lưu ý vận hành — DB mới không tự tạo trên cluster ĐANG CHẠY**: `configmap-init-db.yaml`/
`init-databases.sql` chỉ chạy lúc Postgres container khởi tạo volume RỖNG lần đầu (image Postgres
chính thức chỉ chạy `/docker-entrypoint-initdb.d/*` khi datadir chưa có dữ liệu) — thêm
`CREATE DATABASE ewallet_fund` vào 2 file này KHÔNG tự tạo DB trên 1 cluster đã chạy nhiều ngày với
volume đã có dữ liệu (như cluster thật của lượt việc này, uptime 8 ngày). Đã chạy thủ công
`CREATE DATABASE ewallet_fund;` qua `kubectl exec deploy/postgres -- psql -U postgres` trên cluster
đang chạy — ghi rõ ở đây vì đây là bước dễ quên, chỉ lộ ra khi service mới báo lỗi kết nối DB khó
hiểu dù Helm/configmap đã "đúng" trên giấy.

**Ngoài phạm vi MVP** (ghi rõ theo đúng yêu cầu của issue #14):
- **Không có lãi suất** ("Sinh Lời Trên Quỹ Nhóm") — để lại cho 1 ticket follow-up riêng nếu Túi
  Thần Tài (#13) đã xong, tái dùng đúng cơ chế lazy-compute đó.
- **Không có hạn mức số lượng quỹ/thành viên** như MoMo thật (2 quỹ tự tạo, 20 quỹ tham gia, 200
  thành viên/quỹ, trần 25 triệu/quỹ) — không áp dụng trong MVP này, chỉ ghi nhận số liệu thật ở
  trên để không ai sau này bịa số khác.
- **Không có luồng "member request rút + creator duyệt"** — creator rút trực tiếp, không có bước
  duyệt trung gian nào (xem phần "MVP đơn giản hoá hơn nữa" ở trên).
- **`addMember` chỉ creator được gọi** — không có khái niệm "member tự rời quỹ" hay "creator xoá
  thành viên" trong MVP này.

**Bug fix — ledger "ma" khi compensate withdraw/dissolve (phát hiện bởi agent-tester, race ≥20
concurrent withdraw)**: `withdrawOnce`/`dissolveOnce` ghi dòng `FundTransaction`
WITHDRAWAL/DISSOLVE TRONG CÙNG transaction cục bộ đã trừ `Fund.balance` — ĐÚNG như thiết kế (so
phần "Thứ tự external-call vs local-commit" ở trên: local-trước, external-credit-sau). Nhưng khi
bước credit bên ngoài (`wallet-service`'s `/credit` cho creator) thất bại VÀ phải compensate,
`compensateWithdraw`/`compensateDissolve` ban đầu CHỈ revert `Fund.balance`
(`revertWithdraw`/`revertDissolve`) — KHÔNG xoá dòng `FundTransaction` đã ghi cho lần rút/giải thể
đó, để lại 1 hàng lịch sử cho một lần rút CHƯA BAO GIỜ thực sự hoàn tất (tiền không rời quỹ thật,
vì chính compensate đã cộng lại). Query trực tiếp Postgres của agent-tester xác nhận: fund có 16
hàng WITHDRAWAL (tổng 80.000đ) nhưng chỉ 15 lần thực sự thành công (75.000đ rời quỹ) — lệch đúng 1
hàng phantom.

Fix: `withdrawOnce`/`dissolveOnce` giờ trả về thêm `transactionId` của dòng `FundTransaction` vừa
ghi (`FundMutationExecutor.WithdrawResult`/`DissolveResult`). `FundService.withdraw`/`dissolve`
thread `transactionId` đó vào `compensateWithdraw`/`compensateDissolve`, nơi vừa revert balance
VỪA xoá đúng dòng đó (`fundTransactionRepository.findById(id).ifPresent(::delete)` — find-then-
delete, không dùng `deleteById` trực tiếp, để lần retry optimistic-lock của chính compensate gọi
lại vẫn an toàn nếu dòng đã bị xoá ở 1 lần thử trước đó mà transaction rollback giữa đường). Áp
dụng Y HỆT cho `dissolve`'s `compensateDissolve` — tự kiểm tra lại thấy đúng là CÙNG bug pattern
(agent-tester chưa test riêng path này), không phải giả định suông.

**Bug fix thứ 2 cùng lượt — raw HTTP 500 khi credit-sau-khi-local-commit thất bại**:
`walletServiceClient.credit(...)` dùng `RestClient`'s `.retrieve()` không có error handler riêng,
nên 1 lần `wallet-service` trả 409 (ví creator cũng bị tranh chấp optimistic-lock dưới tải — đúng
lỗi agent-tester tái hiện được, KHÔNG phải lỗi logic) ném ra `HttpClientErrorException.Conflict`.
`FundService.withdraw`/`dissolve` trước đây bắt `RuntimeException e` chỉ để compensate rồi
`throw e` NGUYÊN BẢN — thoát khỏi mọi `@ExceptionHandler` của `FundController` (vốn chỉ bắt
`ResponseStatusException`/`ObjectOptimisticLockingFailureException`), rơi về raw 500 của Spring,
khác hẳn convention 403/404/409/428 có message tiếng Việt rõ ràng của chính service này. Fix:
thêm `FundService.mapCreditFailure(RuntimeException, String action)` — map `HttpClientErrorException`
409 → `ResponseStatusException(409)`, các lỗi khác (5xx/timeout) → `ResponseStatusException(502)`,
cả 2 kèm message tiếng Việt xác nhận quỹ ĐÃ được hoàn lại số dư (vì compensate luôn chạy trước khi
map lỗi) và gợi ý thử lại.

**Tự verify lại — kết quả thật, xem comment agent-dev trên issue #14 cho số liệu/lệnh tái hiện đầy
đủ.**

**Bug fix thứ 3 — "tiền kẹt mid-flight" khi CHÍNH compensation cũng thua hết lượt retry (phát hiện
bởi agent-tester, race ≥60 concurrent withdraw/1 fund — nặng hơn 2 bug trước vì đây là MẤT TIỀN
THẬT, không chỉ lệch ledger)**: bug fix thứ 1/thứ 2 ở trên dùng `withRetry("compensate-withdraw",
...)`/`withRetry("compensate-dissolve", ...)` — CÙNG `MAX_ATTEMPTS=4` với mọi operation thường
khác trên `Fund`. Dưới tải ≥60 concurrent withdraw/1 fund, chính compensation (chạy SAU KHI đã
local-commit, tức tiền đã THỰC SỰ bị trừ khỏi `Fund.balance`) cũng tranh chấp `@Version` với 56+
withdraw khác đang chạy cùng lúc, và có thể thua hết 4 lượt retry — khi đó nó `throw` lại
`ObjectOptimisticLockingFailureException` NGUYÊN BẢN, không được bắt riêng, bay thẳng qua
`FundController`'s generic `@ExceptionHandler(ObjectOptimisticLockingFailureException.class)` → trả
409 với message GIỐNG HỆT 1 conflict bình thường ("Quỹ nhóm đang được xử lý ở giao dịch khác, vui
lòng thử lại"). Hậu quả xác nhận bằng SQL thật của agent-tester: `Fund.balance` đã trừ (không hoàn
lại), `FundTransaction` WITHDRAWAL vẫn còn (ghi nhận đã rút), nhưng `wallet-service`'s `TRANSFER_IN`
cho creator KHÔNG có dòng tương ứng — tiền biến mất khỏi hệ thống hoàn toàn (không trong fund, không
trong ví), và client nhận đúng message "thử lại là xong" trong khi thực ra tiền đã mất, không tự
phục hồi được bằng cách gọi lại API.

Fix theo cả 3 hướng agent-tester đề xuất trên issue:

1. **Retry budget riêng, mạnh hơn hẳn, cho compensation** — `FundService.compensateWithRetry`
   (tách khỏi `withRetry` dùng chung cho operation thường): `MAX_COMPENSATION_ATTEMPTS=30` (so với
   `MAX_ATTEMPTS=4` của operation thường) + backoff có JITTER (`20ms × lần thử`, trần `150ms`, cộng
   jitter ngẫu nhiên `0-40ms`) — không dùng backoff thuần `base × i` như operation thường, vì dưới
   tải cao hàng chục thread cùng thua optimistic-lock có xu hướng tỉnh dậy retry ĐÚNG CÙNG LÚC nếu
   không có jitter, tự làm tăng chính xác loại tranh chấp đang cố tránh. Lý do chấp nhận ngân sách
   retry lớn hơn nhiều + có thể tốn thêm vài giây: đây là bước SỬA LỖI sau khi tiền đã thực sự bị
   trừ cục bộ, không phải operation thường (nơi "thua hết lượt, trả 409, user tự thử lại" vô hại vì
   chưa commit gì) — chờ lâu hơn một chút để đảm bảo đúng quan trọng hơn phản hồi nhanh ở đây.
2. **Nếu vẫn thua hết 30 lượt (lý thuyết luôn có thể xảy ra ở tải đủ cao)** — KHÔNG để
   `ObjectOptimisticLockingFailureException` thoát ra ngoài giống bug cũ. `compensateWithRetry` bắt
   riêng lần thua cuối, gọi `recordStuckCompensation` (`log.error` — không phải `warn`, kèm đầy đủ
   `fundId`/`transactionId`/`amount`/`requesterUserId`/action, grep được qua marker
   `FUND_MONEY_STUCK`) rồi throw `ResponseStatusException(500, ...)` với message RIÊNG, khác hẳn
   409/502 của `mapCreditFailure`: nêu rõ "số tiền đang tạm kẹt... KHÔNG thử lại giao dịch này
   ngay... mã tham chiếu: <failureId>" — không thể nhầm với 1 conflict bình thường.
3. **Reconciliation nền** — bảng mới `fund_compensation_failures`
   (`FundCompensationFailure` entity, cột `fund_id`/`transaction_id`/`requester_user_id`/`amount`/
   `action` tái dùng `FundTransactionType` (WITHDRAWAL/DISSOLVE, không bịa enum mới)/`created_at`/
   `resolved_at`) ghi lại đúng 1 hàng mỗi lần `recordStuckCompensation` chạy.
   `FundCompensationReconciler` (`@Scheduled(fixedDelay = 15_000)`, cần `@EnableScheduling` trên
   `FundServiceApplication` — pattern @Scheduled MỚI trong service này, các service khác trong lab
   dùng lazy-expiry, không polling job, xem `lucky-money-service`'s "Điểm rẽ #2") quét mọi hàng
   `resolved_at IS NULL`, với MỖI hàng chỉ thử lại ĐÚNG 1 LẦN (không tự lặp lại nhiều lần trong 1
   lượt chạy — cố ý đơn giản: tranh chấp gây exhausted ban đầu luôn là 1 đợt burst ngắn đã kết thúc
   từ lâu tới lúc job chạy lại 15s sau, nên 1 lần thử là đủ; thua thì để lại cho lượt chạy kế tiếp,
   không tự phình to retry loop của chính nó dưới tải) — gọi lại ĐÚNG
   `compensateWithdraw`/`compensateDissolve` (cùng method `FundMutationExecutor` đã dùng ở path
   tức thời), thành công thì `markResolved` + `log.warn` (không còn ERROR nữa vì đã tự lành), thua
   tiếp thì `log.error` lại (tình huống này vẫn cần biết, không chỉ debug) và để nguyên cho lượt
   sau.

**Đã tự verify thật qua Ingress** (`http://api.ewallet-lab.local`, user/2 fund hoàn toàn MỚI):
- 70 concurrent withdraw (10.000đ/lần) trên 1 fund (balance 1.500.000đ) → 65×200 + 5×409 (4 normal
  optimistic-lock + 1 credit-fail trên ví creator, compensate THẮNG trong ngân sách 30 lượt, trả
  đúng message riêng "Rút quỹ thất bại do wallet-service từ chối giao dịch (409), quỹ đã được hoàn
  lại số dư..."). `fund_transactions` WITHDRAWAL = 65 hàng/650.000đ = đúng balance delta (balance
  còn 850.000đ), `wallet-service`'s `TRANSFER_IN` cho creator (lọc theo `reference=fundId`) = đúng
  65 dòng/650.000đ — khớp tuyệt đối. 0 hàng `fund_compensation_failures` (không lượt nào bị
  exhausted thật ở quy mô này, nhờ Hikari `maximum-pool-size: 5` của `fund-service` tự giới hạn số
  transaction THỰC SỰ tranh chấp đồng thời trên 1 row, dù tầng HTTP nhận 70-200 request cùng lúc).
- 200 concurrent withdraw (5.000đ/lần) trên 1 fund khác (balance 5.000.000đ) → 183×200 + 17×409 (16
  normal + 1 credit-fail, compensate thắng trong budget). `fund_transactions` = 183 hàng/915.000đ =
  đúng balance delta (4.085.000đ), `TRANSFER_IN` = đúng 183/915.000đ. 0 hàng
  `fund_compensation_failures`.
- **Path "thua hết 30 lượt" khó ép xảy ra tự nhiên** ở quy mô minikube 1-node (Hikari pool 5 giới
  hạn tranh chấp thật trên 1 row xuống còn tối đa 5-way, không phải 70/200-way như số request HTTP
  nhận vào) — verify riêng bằng cách mô phỏng ĐÚNG trạng thái DB mà `compensateWithRetry` sẽ để lại
  nếu thua hết lượt (balance đã trừ/status đã DISSOLVED cục bộ, 1 hàng `FundTransaction` phantom, 1
  hàng `fund_compensation_failures` chưa `resolved_at`), cho CẢ 2 action WITHDRAWAL và DISSOLVE —
  cả 2 lần, `FundCompensationReconciler` tự phát hiện trong vòng chạy kế tiếp (≤15s), gọi đúng
  `compensateWithdraw`/`compensateDissolve`, hoàn lại balance đúng số tiền (DISSOLVE còn tự mở lại
  `status=ACTIVE`), xoá đúng hàng phantom, đánh `resolved_at`, log
  `FUND_MONEY_STUCK resolved by background reconciler...` — xác nhận cả 2 nhánh action hoạt động
  đúng, không chỉ WITHDRAWAL.
- Build sạch `./gradlew build`; image `ewallet-lab/fund-service:local` rebuild, deploy lại namespace
  `ewallet-lab`; bảng `fund_compensation_failures` tự được Hibernate `ddl-auto: update` tạo đúng
  trên DB đang chạy (table MỚI, khác trường hợp "thêm enum vào bảng cũ đã có CHECK constraint" —
  xem CLAUDE.md, verify bằng `\d fund_compensation_failures` trực tiếp trên Postgres); bytecode
  đang chạy trên pod xác nhận khớp fix (`kubectl cp` jar + `javap` thấy đúng
  `compensateWithRetry`/`recordStuckCompensation`/`jitteredCompensationBackoff`/
  `FundCompensationReconciler`/`FundCompensationFailure`).

## Quản lý chi tiêu (issue #16) — read-only, không bảng mới, không service mới

**Nguồn — MoMo thật** (momo.vn/quan-ly-chi-tieu, agent-designer fetch trực tiếp 2026-10-03): tính
năng thật có 4 tab (Sổ chi tiêu theo danh mục tự đặt, Ngân sách, Báo cáo tuần/tháng, Chatbot trợ lý
chi tiêu AI), 3 điểm vào (Tôi > Tiện ích; Lịch sử GD; thanh tìm kiếm). MVP của lab này **chỉ làm
phần "Báo cáo tự động"** — phần duy nhất tái dùng được 100% dữ liệu đã có (`Transaction` ledger
trong `wallet-service`), không cần category tự do hay input thủ công.

**Không phải điểm rẽ kiến trúc** (khác #12/#13/#14): endpoint mới `GET
/wallets/{userId}/spending-report?period=week|month` hoàn toàn read-only trên `Transaction` đã có
sẵn, không thêm bảng, không thêm service, không gọi cross-service.

**Định nghĩa "chi tiêu" giữ nguyên đúng `mfe-wallet/Home.tsx`'s `SPEND_TYPES` đã có từ trước**:
`WITHDRAW + TRANSFER_OUT + BILL_PAYMENT` — KHÔNG tính `TOPUP`/`TRANSFER_IN`/`REFUND`. Cố ý định
nghĩa bằng 1 hằng số `SPEND_TYPES` RIÊNG trong `WalletService` thay vì tái dùng
`StepUpPolicy.STEP_UP_TYPES` (issue #15, bao gồm cả TOPUP) hay issue #7's bộ hạn mức pháp luật
(cùng 3 loại hôm nay nhưng là 1 khái niệm khác — "giới hạn pháp luật" không phải "báo cáo chi tiêu
cho người dùng xem") — trùng nhau hôm nay là ngẫu nhiên, không có lý do phải luôn khoá cứng với
nhau nếu 1 trong 2 đổi sau này.

**"Tuần"/"tháng" dùng đúng quy ước "calendar reset" đã thống nhất trong toàn bộ dự án** (issue #7's
tháng dương lịch, issue #15's ngày theo giờ server) — tuần reset vào đúng thứ Hai 00:00 giờ local
server, theo chuẩn ISO-8601 (thứ Hai là ngày đầu tuần, đúng quy ước Việt Nam — khác US tuần bắt đầu
Chủ Nhật). Không phải rolling window 7 ngày.

**Query strategy**: group-by ở tầng DB (`TransactionRepository.sumAmountGroupedByTypeSince`, JPQL
`GROUP BY t.type` với interface projection `SpendingBreakdownRow`), không load toàn bộ list rồi
`reduce` trong Java — ledger của lab này nhỏ nên hiệu năng không phải vấn đề thật, nhưng chọn cách
đúng ngay từ đầu rẻ hơn sửa sau. Loại không có giao dịch nào trong kỳ đơn giản không xuất hiện
trong kết quả SQL — tầng service tự điền 0 cho đủ cả 3 loại để response luôn có shape ổn định
(frontend không phải tự xử lý field thiếu).

**Endpoint public, theo đúng convention hiện có của `wallet-service`** (userId path variable,
không có auth middleware riêng) — không tự thêm lớp auth mới ngoài phạm vi ticket.

**Ngoài phạm vi MVP** (ghi rõ theo đúng yêu cầu issue #16, không phải bug bị bỏ sót):
- **Danh mục tự đặt tên** (category tự do) — ledger hiện tại chỉ có `TransactionType` cố định,
  không có cột category tự do nào; thêm category thật cần 1 bảng mới + UI gán danh mục cho từng
  giao dịch, ngoài phạm vi ticket này.
- **"Ngân sách"** (đặt giới hạn chi tiêu theo category + cảnh báo vượt) — không làm.
- **"Chatbot trợ lý chi tiêu"** (AI) — lab này không có hạ tầng AI/LLM tích hợp, không làm.
- **"Thêm giao dịch thủ công ngoài MoMo"** (ghi chép tay không ảnh hưởng số dư ví) — cần 1 bảng
  "manual entry" hoàn toàn tách biệt khỏi `Transaction` ledger thật (ledger thật chỉ ghi giao dịch
  đã thực sự di chuyển tiền) — để dành cho 1 ticket riêng nếu muốn làm sau.
- **So sánh với kỳ trước** (tuần/tháng trước) — nice-to-have theo issue, không bắt buộc cho MVP,
  chưa làm.

**Verify qua Ingress thật** (`http://api.ewallet-lab.local`, user đăng ký qua chính Ingress): tạo
đủ 4 loại giao dịch (TOPUP 500.000đ, WITHDRAW 50.000đ, TRANSFER_OUT 30.000đ, BILL_PAYMENT 20.000đ)
→ `GET .../spending-report?period=week` và `period=month` đều trả đúng `total=100.000đ`,
`breakdown` đúng 3 giá trị (WITHDRAW/TRANSFER_OUT/BILL_PAYMENT), TOPUP không xuất hiện trong
breakdown/total. `period=year` (giá trị không hợp lệ) → 400. CORS qua origin
`http://shell.ewallet-lab.local` → `Access-Control-Allow-Origin` đúng, không cần đổi
`ALLOWED_ORIGIN_PATTERN` (endpoint nằm trong `wallet-service` đã có CORS config sẵn).
