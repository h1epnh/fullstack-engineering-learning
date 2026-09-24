# napas-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "NAPAS"`), dựng message giả lập
NAPAS 247, giả lập gọi rail, publish kết quả lên `payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3

**Không có spec kỹ thuật chính thức công khai** — NAPAS chỉ cấp tài liệu message format nội bộ
(interbank) cho ngân hàng thành viên, dưới NDA. `NapasMessage` trong [`napas.go`](napas.go) là suy
luận hợp lý từ tài liệu **hướng dẫn người dùng cuối** (end-user), không phải spec interbank thật:

- [NAPAS FastFund 247 — trang giới thiệu chính thức](https://en.napas.com.vn/napas-fastfund-247-184230612211622214.htm)
- [Indovina Bank — NAPAS Instant Fund Transfer 24/7 User Guide (PDF)](https://www.indovinabank.com.vn/sites/default/files/0%20MARKETING_p1/EBANKING%20forms/HDSD%20NAPAS_userguide_en.pdf)

**Giới hạn cụ thể**: field trong `NapasMessage` (mã tham chiếu, số tài khoản, số tiền) chỉ là những
gì lộ ra qua giao diện người dùng cuối. Message thật giữa các ngân hàng thành viên qua NAPAS
switch có thể dùng biến thể ISO 8583 (phổ biến cho card/ATM switching) hoặc format riêng cho kênh
chuyển khoản 24/7 — không giống 1:1 với mock ở đây. Nếu triển khai thật, bắt buộc phải xin tài liệu
kỹ thuật trực tiếp từ NAPAS với tư cách ngân hàng thành viên.

**Timing model**: NAPAS 247 được thiết kế real-time (<10s) — `SimulateRailCall` trong
[`napas.go`](napas.go) mô phỏng độ trễ ngắn (0.5–2s), khác hẳn timing của `swift-adapter`.

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
