# swift-adapter

Go service — tiêu thụ `payment.routing.requested` (lọc `rail == "SWIFT"`), dựng message ISO 20022
**pacs.008** (FIToFICustomerCreditTransfer), giả lập gửi tới correspondent bank, publish kết quả
lên `payment.settlement.confirmed`.

## Nguồn tài liệu kỹ thuật bên thứ 3

pacs.008 **có spec công khai đầy đủ** (khác NAPAS) — đây là chuẩn ISO 20022, không phải tài liệu
proprietary của 1 ngân hàng:

- [ISO 20022 — cổng thông tin chính thức message definitions](https://www.iso20022.org/)
- [BNY Mellon — A Deep Dive on pacs.008 (learning guide, PDF)](https://www.bny.com/content/dam/bnymellon/documents/pdf/iso-20022/learning-guide-module-4.pdf)
- [pacs008.com — FAQ giải thích message theo field](https://pacs008.com/faq/)

**Quan trọng — thời điểm áp dụng**: pacs.008 **đã thay thế hoàn toàn MT103 cho cross-border kể từ
tháng 11/2025** (SWIFT hoàn tất migration MT→MX). `swift-adapter` chỉ build pacs.008, không có
đường dẫn MT103 song song — phản ánh đúng thực tế hiện tại, không phải lựa chọn tuỳ ý.

**Giới hạn cụ thể của mock**: `Pacs008Message` trong [`pacs008.go`](pacs008.go) chỉ implement 1
`GroupHeader` + 1 `CreditTransferTransactionInformation` dạng struct Go phẳng — **không phải** XML
đúng schema XSD của pacs.008.001.xx (không có namespace, không serialize XML, thiếu nhiều optional
element như `PmtTpInf`, `ChrgBr`, structured `PstlAdr`). Đủ để luyện đúng field model
(UETR/EndToEndId/TxId — điểm khác biệt lớn nhất so với MT103's field 20 duy nhất), chưa đủ để
validate với schema XSD thật.

**Timing model**: cross-border settlement qua correspondent bank vốn chậm — `SimulateCorrespondentSettlement`
trong [`pacs008.go`](pacs008.go) mô phỏng độ trễ dài hơn hẳn (2–6s) và tỷ lệ fail cao hơn (~10% so
với ~5% của NAPAS), phản ánh đúng thực tế correspondent banking có nhiều điểm fail hơn domestic.

## Chạy độc lập

```bash
KAFKA_BOOTSTRAP=localhost:9092 go run .
```
