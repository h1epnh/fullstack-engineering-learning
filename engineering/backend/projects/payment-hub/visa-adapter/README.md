# visa-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "VISA"`), dựng message ISO 8583
(MTI 0200 — financial transaction request), giả lập gọi VisaNet authorization, publish kết quả lên
`payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3

ISO 8583 **là chuẩn công khai** (ISO 8583:1987/1993/2003) — nền tảng cho hầu hết giao dịch thẻ toàn
cầu, không riêng Visa:

- [ISO 8583 — trang chuẩn chính thức (ISO)](https://www.iso.org/standard/31628.html)
- Visa còn publish thêm **VisaNet implementation guide** riêng (định nghĩa cách Visa dùng từng data
  element cụ thể trên nền ISO 8583) — tài liệu này **không công khai đầy đủ**, chỉ cấp cho
  merchant/acquirer đã ký hợp đồng với Visa.

**Giới hạn cụ thể của mock**: `Iso8583Message` trong [`iso8583.go`](iso8583.go) chỉ implement 7 data
element cốt lõi (MTI, DE2/PAN, DE3, DE4, DE11, DE37, DE49) dạng struct Go phẳng — **không phải**
bitmap-encoded message thật (ISO 8583 thật dùng bitmap nhị phân để chỉ định field nào có mặt, đây
là phần phức tạp nhất của chuẩn mà lab bỏ qua hoàn toàn).

**Đơn giản hoá quan trọng**: giao dịch thẻ thật có **2 giai đoạn tách biệt**:
1. **Authorization** (giữ tiền, real-time, sub-second) — đây là cái `SimulateAuthorization` mô
   phỏng.
2. **Clearing & Settlement** (tiền thực sự chuyển, thường batch theo chu kỳ T+1/T+2).

Lab này **gộp 2 giai đoạn thành 1 event** để đơn giản — nếu triển khai thật, cần thêm 1 bước
settlement riêng chạy batch, không phải real-time như authorization.

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
