# mastercard-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "MASTERCARD"`), dựng message ISO
8583, giả lập gọi Mastercard Banknet authorization (kèm mô phỏng **Stand-In Processing — STIP**),
publish kết quả lên `payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3

Cùng nền tảng chuẩn công khai ISO 8583 như `visa-adapter` (xem
[visa-adapter/README.md](../visa-adapter/README.md) cho chi tiết chuẩn chung) — nhưng **cố tình
không dùng chung code** với visa-adapter, vì trong thực tế mỗi network (Visa/Mastercard) publish
implementation guide riêng, field usage khác nhau dù cùng nền ISO 8583. Coi 2 network là "giống hệt
nhau về code" sẽ là bài học sai.

**Điểm khác biệt cố tình implement — STIP (Stand-In Processing)**: khi issuer (ngân hàng phát hành
thẻ) không phản hồi kịp, mạng Mastercard **tự đưa ra quyết định thay issuer** dựa theo rule đã thoả
thuận trước (phổ biến nhất: floor limit — duyệt nếu dưới ngưỡng, từ chối nếu trên ngưỡng) thay vì
đơn giản là timeout/fail. Đây là điểm khác với circuit breaker thông thường: circuit breaker chỉ
fail-fast hoặc trả fallback tĩnh, còn STIP là **fallback có logic quyết định thật** — xem
`SimulateAuthorization` trong [`iso8583.go`](iso8583.go), so sánh với circuit breaker/Hystrix đã ôn
trong [`docs/microservices/Cracking Spring Microservices Interviews.md`](../../../docs/microservices/Cracking%20Spring%20Microservices%20Interviews.md).

**Giới hạn cụ thể**: cũng gộp Authorization + Clearing/Settlement thành 1 event như visa-adapter —
xem giới hạn tương tự ở đó. `STIPFloorLimit` trong code là giá trị tự chọn cho lab, **không phải**
con số Mastercard công bố công khai (Mastercard không công khai floor limit thật — do issuer tự
thoả thuận riêng với Mastercard).

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
