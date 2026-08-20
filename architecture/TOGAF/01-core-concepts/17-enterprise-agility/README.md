# Khái niệm: Enterprise Agility (partitions & levels)

**Tham chiếu:** [S] §3.18

## Nội dung chính

**Enterprise agility** là một thuật ngữ phổ biến nhưng **định nghĩa chính xác lại khác nhau giữa các practitioner** — dù định nghĩa cụ thể ra sao, nó quan trọng vì giúp một enterprise **phản ứng tốt hơn với thay đổi**, bằng cách trở nên: hướng khách hàng và sản phẩm hơn (more customer and product-centric), hiệu quả hơn (more efficient), và đảm bảo tuân thủ quy định tốt hơn (better able to ensure regulatory compliance).

Thuật ngữ "agile" thường được gắn liền với các **quy trình phát triển phần mềm agile (agile software development processes)**, gắn với **Manifesto for Agile Software Development**. Tuy nhiên, TOGAF nhấn mạnh: dù các nguyên tắc và kỹ thuật "agile" này có thể áp dụng để điều chỉnh TOGAF framework, **enterprise agility là một bối cảnh rộng hơn nhiều so với agile software development**. Do đó, cần các kỹ thuật bổ sung khi điều chỉnh TOGAF cho một enterprise theo hướng agile.

Vai trò của Enterprise Architecture đối với agility: EA cung cấp một **khung cho sự thay đổi (framework for change)**, liên kết với cả định hướng chiến lược (strategic direction) lẫn giá trị kinh doanh (business value). EA cung cấp một góc nhìn đủ đầy đủ (sufficient view) về tổ chức để: quản lý độ phức tạp (complexity), hỗ trợ thay đổi liên tục (continuous change), và quản lý rủi ro của các hệ quả không lường trước (unanticipated consequences).

TOGAF framework đã đón nhận lời kêu gọi phản ứng kịp thời với nhu cầu enterprise, thông qua 2 khái niệm chính:

- **Partitions (phân vùng)** — định nghĩa cách công việc được chia nhỏ thành **nhiều sáng kiến kiến trúc (multiple architecture initiatives)**. Đây là cách "chia để trị" theo chiều ngang, chia phạm vi công việc thành các phần độc lập có thể tiến hành song song hoặc tuần tự.
- **Levels (mức độ)** — định nghĩa cách kiến trúc tổng thể có thể được phát triển ở **nhiều mức độ chi tiết và độ hạt (granularity) khác nhau**. Đây là chiều dọc, cho phép có kiến trúc mức cao lẫn kiến trúc mức chi tiết cùng tồn tại và liên kết với nhau.

Ngoài ra, ADM còn hỗ trợ nhiều khái niệm được đặc trưng là **iteration (lặp)** — tức là khả năng quay lại, tinh chỉnh các phase/hoạt động nhiều lần thay vì đi theo một trình tự tuyến tính cứng nhắc.

Tài liệu tham khảo chi tiết hơn về cách điều chỉnh ADM để hỗ trợ enterprise agility:

- TOGAF® Series Guide: *Applying the ADM Using Agile Sprints*
- TOGAF® Series Guide: *Enabling Enterprise Agility*
- *The Open Agile Architecture™ Standard*

## Điểm cần nhớ

- Enterprise agility ≠ agile software development — agility ở cấp enterprise là bối cảnh **rộng hơn** nhiều, đòi hỏi kỹ thuật bổ sung.
- EA hỗ trợ agility bằng cách cung cấp "framework for change" gắn với strategic direction và business value.
- 2 cơ chế TOGAF dùng để hỗ trợ agility: **Partitions** (chia nhỏ công việc thành nhiều initiative) và **Levels** (nhiều mức chi tiết/granularity).
- ADM hỗ trợ khái niệm **iteration** — cho phép lặp lại, không bắt buộc tuyến tính.
- Có 3 tài liệu TOGAF chuyên sâu về agility: Applying the ADM Using Agile Sprints, Enabling Enterprise Agility, Open Agile Architecture Standard.

## Liên kết với khái niệm khác

- [../../02-adm/00-overview](../../02-adm/00-overview) — ADM vốn "does not mandate a waterfall method" (đã nêu ở §3.4) — nền tảng cho phép partitions/levels/iteration hoạt động.
- [../15-using-togaf-with-different-architecture-styles](../15-using-togaf-with-different-architecture-styles) — agile là một trong các "architectural styles" mà TOGAF có thể thích nghi (§3.16), cần điều chỉnh model/viewpoint/tool tương ứng.
- [../18-risk-management](../18-risk-management) — quản lý "unanticipated consequences" mà EA giúp kiểm soát liên hệ trực tiếp đến quản trị rủi ro ở §3.19.

## Câu hỏi ôn tập

- Vì sao TOGAF nhấn mạnh enterprise agility là một khái niệm rộng hơn agile software development?
- Phân biệt "Partitions" và "Levels" trong cách TOGAF hỗ trợ enterprise agility.
- EA đóng góp gì cho khả năng phản ứng với thay đổi của một enterprise (liệt kê 3 khía cạnh)?
