# momo-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "MOMO"`), dựng request theo đúng
**MoMo Single Disbursement API (v2)**, giả lập gọi MoMo, publish kết quả lên
`payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3 (đã xác minh trực tiếp)

- [MoMo Developers — Single Disbursement](https://developers.momo.vn/v3/docs/payment/api/disbursement-v2/) —
  nguồn của toàn bộ field trong `DisbursementRequest`/`DisbursementResponse` trong
  [`momo.go`](momo.go): `partnerCode`, `orderId`, `amount`, `requestId`, `requestType`
  (`disburseToWallet`), `disbursementMethod`, `ipnUrl`, `extraData`, `orderInfo`, `orderGroupId`,
  `lang`, `signature` — copy trực tiếp từ trang, không tự đặt tên field.
- [MoMo Developers — Digital Signature](https://developers.momo.vn/v3/docs/payment/api/other/signature/) —
  xác nhận thuật toán HMAC-SHA256; **công thức nối chuỗi cụ thể** (`accessKey=...&amount=...&...`,
  sắp xếp alphabet) được lấy từ chính trang Single Disbursement (trang signature chung không nêu
  thứ tự field cụ thể).

## Giới hạn cụ thể

- **`disbursementMethod` phải mã hoá RSA thật** với public key MoMo cấp — lab gửi dạng JSON phẳng
  (`WalletDisbursementMethod` marshal thành string) để dễ đọc/test, **không** RSA-encrypt thật. Nếu
  triển khai thật, đây là bước bắt buộc không được bỏ qua.
- **`partnerCode`/`accessKey`/secret key trong code là giá trị giả** (`fakePartnerCode`,
  `fakeAccessKey`, `fakeSecretKey`) — MoMo cấp các giá trị này qua hợp đồng tích hợp thật, không
  bao giờ hardcode như lab.
- **Không log `disbursementMethod`** (chứa `walletId` = số điện thoại người nhận) — cùng nguyên tắc
  data minimization đã áp dụng ở `ledger-service`.
- Theo tài liệu MoMo: người nhận phải 18+, đã xác thực C06, tài khoản ngân hàng liên kết hợp lệ —
  lab **không** kiểm tra các điều kiện này (ngoài scope, thuộc về bước KYC/mở ví, không phải bước
  xử lý giao dịch).

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
