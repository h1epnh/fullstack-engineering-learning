# Khái niệm: Architecture Abstraction (Contextual→Conceptual→Logical→Physical)

**Tham chiếu:** [S] §3.7

## Nội dung chính

**Architecture Abstraction** là một kỹ thuật kiến trúc dùng để **chia nhỏ một problem area lớn thành các problem area nhỏ hơn**, dễ mô hình hóa và do đó dễ giải quyết hơn. Các mức trừu tượng (abstraction levels) mang tính **phân lớp (layered)**, đi từ mô hình mức cao (high-level) đến mô hình chi tiết hơn.

Effort kiến trúc được chia thành **4 mức trừu tượng riêng biệt**, mỗi mức **cắt ngang (cross)** cả 4 domain Business/Data/Application/Technology, và mỗi mức trả lời một câu hỏi nền tảng khác nhau:

- **Contextual Abstraction Level** — trả lời **Why**: tại sao enterprise thực hiện công việc kiến trúc này. Tập trung hiểu môi trường mà enterprise vận hành và bối cảnh (context) mà công việc kiến trúc được lên kế hoạch/thực thi — bao gồm phạm vi công việc (scope) và động lực (motivation) dưới dạng drivers, goals, objectives.
- **Conceptual Abstraction Level** — trả lời **What**: cần gì để đáp ứng yêu cầu. Tập trung phân rã requirements để hiểu vấn đề và những gì cần thiết để giải quyết vấn đề, mà **chưa** tập trung vào việc kiến trúc sẽ được hiện thực hóa như thế nào. Thường được mô hình hóa bằng **service models** (business service, application service, technology service) thể hiện hành vi mong muốn. Mức này còn được gọi là **service abstraction** hoặc **behavior abstraction**.
- **Logical Abstraction Level** — trả lời **How** (một phần: cấu trúc): xác định các loại thành phần Business/Data/Application/Technology cần thiết để đạt được các service đã xác định ở mức Conceptual. Tập trung vào việc kiến trúc được tổ chức và cấu trúc như thế nào theo cách **độc lập với hiện thực hóa (implementation-independent)**. Có thể có nhiều cách nhóm service thành logical component khác nhau, dựa trên principles và tiêu chí nhóm khác, tạo ra nhiều phương án giải pháp logic.
- **Physical Abstraction Level** — trả lời **With What**: quản lý việc phân bổ và hiện thực hóa các thành phần vật lý để đáp ứng các logical component đã xác định — tức là xác định logical-level component sẽ được hiện thực hóa bằng physical component nào. Cũng có thể có nhiều phương án hiện thực hóa vật lý khác nhau.

Bốn câu hỏi tương ứng 4 mức: **Why → What → How → With What**. Lưu ý quan trọng: TOGAF nhấn mạnh rằng thứ tự why/what/how/with-what **không có liên hệ** với cách các khái niệm này được dùng trong **Zachman Enterprise Architecture Framework** (dù bề ngoài có vẻ tương đồng, đây là hai cách phân loại độc lập).

## Điểm cần nhớ

- 4 mức: **Contextual (Why) → Conceptual (What) → Logical (How/structure) → Physical (With What)**.
- Mỗi mức cắt ngang cả 4 domain (Business/Data/Application/Technology).
- Conceptual level còn gọi là service abstraction / behavior abstraction, dùng service models.
- Logical và Physical đều có thể sinh ra **nhiều phương án giải pháp thay thế** (logical solution alternatives / physical solution alternatives).
- Không nhầm lẫn thứ tự Why/What/How/With-What này với cách dùng trong Zachman Framework — TOGAF nói rõ chúng không liên quan.

## Liên kết với khái niệm khác

- [../03-architecture-domains](../03-architecture-domains) — 4 mức trừu tượng cắt ngang chính 4 domain Business/Data/Application/Technology đã học ở §3.3.
- [../09-enterprise-continuum](../09-enterprise-continuum) — trừu tượng hóa từ Contextual đến Physical song song với việc "generalization" (Foundation) và "adaptation for use" (Organization-Specific) trong Enterprise Continuum.
- [../../02-adm/02-phase-a-architecture-vision](../../02-adm/02-phase-a-architecture-vision) — Architecture Vision (Phase A) tương ứng chặt với mức Contextual (trả lời Why).

## Câu hỏi ôn tập

- Nêu tên và câu hỏi cốt lõi (Why/What/How/With What) của từng mức trong 4 mức abstraction.
- Vì sao Conceptual Abstraction Level còn được gọi là "service abstraction" hay "behavior abstraction"?
- Vì sao TOGAF phải nhấn mạnh rằng thứ tự Why/What/How/With-What không liên quan đến cách dùng trong Zachman Framework?
