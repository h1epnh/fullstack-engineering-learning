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

**Trạng thái**: `wallet-service`, `user-service`, `topup-service`, `mock-bank-gateway`,
`transfer-service`, `bill-payment-service`, `payment-request-service`, `lucky-money-service` đã
scaffold — đủ chạy luồng "đăng ký → liên kết NH → nạp tiền → số dư được cộng", P2P transfer nội bộ,
thanh toán hoá đơn mock, link nhận tiền + nhắc trả tiền, và lì xì 1-1.

## Vì sao mỗi service có DB riêng

Giống bài học đã áp dụng ở `payment-hub` (Q&A 3.77 sách Microservices Interview đã ôn): không share
DB giữa các service. `user-service`, `wallet-service`, `topup-service`, `bill-payment-service` mỗi
cái 1 Postgres database riêng.

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
