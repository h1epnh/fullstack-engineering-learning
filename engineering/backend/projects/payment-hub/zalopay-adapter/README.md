# zalopay-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "ZALOPAY"`), dựng request theo
field/MAC của **ZaloPay Order API**, giả lập gọi ZaloPay, publish kết quả lên
`payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3 (đã xác minh trực tiếp)

- [`ZaloPay-APIs-Integration-Document.pdf`](https://developers.zalopay.vn/downloads/api/ZaloPay-APIs-Integration-Document.pdf) —
  tài liệu chính thức ZaloPay, đã tải và đọc trực tiếp. Nguồn của toàn bộ field trong `OrderRequest`
  trong [`zalopay.go`](zalopay.go): `app_id`, `app_user`, `app_trans_id`, `app_time`, `amount`,
  `item`, `embed_data`, `description`, `mac`.
- **Công thức MAC lấy nguyên văn từ tài liệu**:
  `mac = HMAC(hmac_algorithm, mackey, hmacinput)`, với
  `hmacinput = app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item`
  (`hmac_algorithm` mặc định `HmacSHA256`) — **thứ tự nối chuỗi theo đúng field order tài liệu liệt
  kê, không phải alphabet như MoMo** — nhầm giữa 2 cách này là lỗi tích hợp phổ biến khi 1 team làm
  cả 2 provider cùng lúc.

## Giới hạn quan trọng — đọc trước khi dùng làm tham chiếu thật

**Tài liệu trên là API "Create Order" (thu tiền — user trả tiền cho merchant qua ZaloPay), không
phải API Disbursement (trả tiền — merchant trả tiền vào ví user)**. Có tồn tại
`ZaloPay-APIs-Disbursement-Integration-Document.pdf` chính thức, nhưng URL không truy cập được khi
viết code này (trả về trang chủ Docusaurus thay vì PDF). `zalopay-adapter` **thích nghi** field/MAC
pattern đã xác minh của Order API sang chiều disbursement (đổi `app_user` từ "người trả" thành
"người nhận"), **chưa được xác nhận đúng 1:1 với spec Disbursement thật của ZaloPay**. Nếu triển
khai thật, bắt buộc phải lấy được tài liệu Disbursement chính thức trước.

## Giới hạn khác

- **`app_id`/`mackey` trong code là giá trị giả** (`fakeAppID` dùng đúng số ví dụ `1727` trong tài
  liệu ZaloPay, `fakeMacKey` tự đặt) — ZaloPay cấp giá trị thật qua đăng ký merchant.
- **Không log `req.AppUser`** (số điện thoại người nhận) — cùng nguyên tắc data minimization đã áp
  dụng ở `ledger-service`/`momo-adapter`.
- Theo tài liệu: đơn hàng chỉ hợp lệ trong 15 phút, có cơ chế poll trạng thái nếu callback bị miss —
  lab gộp thành 1 lần gọi mô phỏng đồng bộ, không có poll fallback.

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
