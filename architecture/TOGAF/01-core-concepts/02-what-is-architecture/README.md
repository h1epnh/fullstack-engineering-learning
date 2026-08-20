# Khái niệm: What is Architecture

**Tham chiếu:** [S] §3.2

## Nội dung chính

TOGAF không tự sáng tác định nghĩa "architecture" từ đầu mà **kế thừa (embraces) nhưng không tuân thủ chặt (does not strictly adhere to)** thuật ngữ của chuẩn **ISO/IEC/IEEE 42010:2011**. Chuẩn này định nghĩa architecture là:

> "The fundamental concepts or properties of a system in its environment embodied in its elements, relationships, and in the principles of its design and evolution."

Bên cạnh định nghĩa ISO đó, TOGAF bổ sung **một nghĩa thứ hai**, dùng tùy theo ngữ cảnh:

> "The structure of components, their inter-relationships, and the principles and guidelines governing their design and evolution over time."

Điểm quan trọng: TOGAF **coi enterprise (doanh nghiệp) như một hệ thống (system)**, và cố gắng cân bằng giữa việc dùng thuật ngữ chuẩn quốc tế (ISO 42010) với thuật ngữ quen thuộc, dễ hiểu đối với phần lớn độc giả TOGAF (vốn không phải ai cũng rành chuẩn ISO). Đây là lý do TOGAF giữ đồng thời hai cách hiểu "architecture":

1. Nghĩa 1 (theo ISO 42010): các khái niệm/thuộc tính nền tảng của một hệ thống trong môi trường của nó, thể hiện qua elements, relationships, và principles chi phối thiết kế/tiến hóa.
2. Nghĩa 2 (TOGAF bổ sung): cấu trúc của các thành phần (components), mối quan hệ giữa chúng, và các nguyên tắc/hướng dẫn chi phối thiết kế và tiến hóa của chúng theo thời gian.

Cả hai định nghĩa đều xoay quanh 3 trụ cột: **elements/components, relationships, và principles governing design & evolution** — đây là bộ khung tư duy sẽ lặp lại xuyên suốt TOGAF (ví dụ Architecture Principles ở §3.8, Architecture Views/Viewpoints ở §3.17 dựa trên ISO 42010).

## Điểm cần nhớ

- TOGAF dùng 2 định nghĩa "architecture" song song: định nghĩa ISO/IEC/IEEE 42010:2011, và định nghĩa bổ sung riêng của TOGAF.
- TOGAF "embraces but does not strictly adhere to" thuật ngữ ISO 42010 — nghĩa là linh hoạt, không giáo điều.
- Cả hai định nghĩa đều xoay quanh 3 yếu tố: elements/components, relationships, principles of design & evolution.
- TOGAF coi enterprise là một "system" — nền tảng để áp dụng tư duy kiến trúc hệ thống vào cấp độ doanh nghiệp.

## Liên kết với khái niệm khác

- [../16-architecture-views-and-viewpoints](../16-architecture-views-and-viewpoints) — cùng dựa trên chuẩn ISO/IEC/IEEE 42010:2011 (Figure 3-10 dùng các khái niệm System-of-Interest, Stakeholder, Concern...).
- [../07-architecture-principles](../07-architecture-principles) — "principles governing design and evolution" trong định nghĩa architecture chính là tiền đề cho khái niệm Architecture Principles.
- [../03-architecture-domains](../03-architecture-domains) — sau khi định nghĩa "architecture là gì", §3.3 trả lời tiếp "TOGAF xử lý những loại kiến trúc/domain nào".

## Câu hỏi ôn tập

- Nêu 2 định nghĩa "architecture" mà TOGAF sử dụng và điểm chung giữa chúng.
- Vì sao TOGAF nói "embraces but does not strictly adhere to" ISO/IEC/IEEE 42010:2011 thay vì tuân thủ hoàn toàn?
- "Coi enterprise như một system" có ý nghĩa gì đối với cách tiếp cận kiến trúc doanh nghiệp?
