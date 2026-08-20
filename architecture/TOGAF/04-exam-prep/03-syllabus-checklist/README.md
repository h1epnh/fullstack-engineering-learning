# Checklist theo TOGAF EA Level 1 Syllabus (8 Learning Units)

**Tham chiếu:** [G] Appendix D

## Nội dung chính

Appendix D của [G] công bố toàn bộ syllabus chính thức của chứng chỉ **TOGAF Enterprise Architecture Foundation** (Part 1), gồm 8 Learning Unit. Mỗi Learning Outcome trong syllabus được gắn một **mức Bloom's Taxonomy** — chỉ dùng 2 mức ở Level 1: **1_Remembering** (ghi nhớ/liệt kê/mô tả) và **2_Understanding** (giải thích/hiểu bản chất). Không có outcome nào ở Level 1 yêu cầu Applying/Analyzing trở lên — đúng với tinh thần "the learning objectives at this level focus on knowledge and comprehension" mà Chapter 1 của [G] nêu rõ.

File này dùng như **checklist cuối cùng**: đi qua từng Unit, tự hỏi "mình đã có thể trả lời được các Learning Outcome chưa", rồi bấm vào folder tương ứng nếu cần ôn lại.

### 8 Learning Unit

1. **Unit 1 — Concepts** (mix Remembering/Understanding). Khái niệm nền: enterprise là gì, mục đích và lợi ích của Enterprise Architecture, vì sao TOGAF phù hợp làm framework, 4 architecture domain, architecture abstraction, Enterprise Continuum, Architecture Repository, Content Framework/Enterprise Metamodel, Architecture Capability, risk management, gap analysis.
   → Xem [../../01-core-concepts](../../01-core-concepts) (đặc biệt 01-what-is-the-togaf-standard, 02-what-is-architecture, 03-architecture-domains, 09-enterprise-continuum, 10-architecture-repository, 11-content-framework-and-metamodel, 18-risk-management).

2. **Unit 2 — Definitions (Level 1)** (Remembering). Định nghĩa một danh sách thuật ngữ cốt lõi (Application/Business/Data/Technology Architecture, Architecture Landscape, Artifact, Capability, Deliverable, Gap, Metamodel, Requirement, Stakeholder, Transition Architecture, Work Package...). Sách lưu ý: không thuật ngữ nào trong danh sách này *bắt buộc* phải kiểm tra riêng lẻ, trừ khi nó được dùng trong learning outcome của unit khác — tức đây là "từ điển nền" hỗ trợ các unit còn lại.
   → Không có folder thuật ngữ riêng; thuật ngữ được định nghĩa rải rác trong các bài ở [../../01-core-concepts](../../01-core-concepts) khi khái niệm đó xuất hiện lần đầu.

3. **Unit 3 — Introduction to the ADM (Level 1)** (mix Remembering/Understanding). Mô tả ngắn gọn ADM và các Phase, phân biệt deliverable "draft" và "approved", tính lặp (iterative) của ADM, nhu cầu governance hóa việc tạo/phát triển/bảo trì EA, cách scope một kiến trúc, mục tiêu của Preliminary Phase và Phase A-H, luồng thông tin giữa các Phase, và cách ADM hỗ trợ Agile.
   → Xem [../../02-adm](../../02-adm) (00-overview, 01-preliminary, 02 đến 09 cho từng Phase A-H, 10-requirements-management).

4. **Unit 4 — Introduction to ADM Techniques (Level 1)** (chủ yếu Understanding, 1 outcome Remembering). Quan hệ giữa ADM và Supporting Guidelines/Techniques, mục đích và template của Architecture Principles, gap analysis, interoperability, Business Transformation Readiness Assessment, risk management trong ADM.
   → Xem [../../02-adm/11-adm-techniques](../../02-adm/11-adm-techniques) và [../../01-core-concepts/07-architecture-principles](../../01-core-concepts/07-architecture-principles).

5. **Unit 5 — Introduction to Applying the ADM (Level 1)** (mix Remembering/Understanding). Nguồn hướng dẫn áp dụng TOGAF, cách iteration cho phép chạy song song nhiều Phase, 3 cấp Architecture Landscape (Strategic/Segment/Solution), partitioning, cách TOGAF hỗ trợ digital enterprise.
   → Xem [../../02-adm/12-applying-the-adm](../../02-adm/12-applying-the-adm).

6. **Unit 6 — Introduction to Architecture Governance (Level 1)** (toàn bộ Understanding). Khái niệm Architecture Governance, lý do nó có lợi, vai trò/trách nhiệm Architecture Board, vai trò Architecture Contract, nhu cầu Architecture Compliance.
   → Xem [../../03-governance-content/01-architecture-governance](../../03-governance-content/01-architecture-governance).

7. **Unit 7 — Architecture Content** (chủ yếu Understanding, riêng outcome 7.3 về danh mục deliverable là Remembering). Định nghĩa stakeholder/concern/view/viewpoint, building block và cách dùng trong ADM, và mô tả ngắn gọn toàn bộ danh mục deliverable chuẩn theo từng Phase.
   → Xem [../../03-governance-content/02-architecture-content-deliverables](../../03-governance-content/02-architecture-content-deliverables).

8. **Unit 8 — TOGAF Certification Program** (không có mức Bloom's cụ thể — ghi "None" trong bảng syllabus). Giải thích chương trình TOGAF Certification Program và phân biệt các cấp độ chứng chỉ.
   → Xem [../02-mock-exam-40-questions](../02-mock-exam-40-questions) (mục Chapter 1 tóm tắt cấu trúc kỳ thi và certification portfolio).

### Body of Knowledge (tài liệu tham chiếu — mã KLP)

Appendix D cũng liệt kê các tài liệu gốc dùng làm căn cứ cho Key Learning Points: {S0} TOGAF Standard – Introduction and Core Concepts, {S1} ADM, {S2} ADM Techniques, {S3} Applying the ADM, {S4} Architecture Content, {S5} Enterprise Architecture Capability and Governance, cùng các TOGAF Series Guide bổ sung (G184 — Leader's Guide to EA Capability, G186 — Practitioners' Approach to ADM, G20F — Enabling Enterprise Agility, G152 — Integrating Risk and Security). Đây chính là các phần tương ứng của tài liệu [S] trong bộ tài liệu gốc của repo này.

## Điểm cần nhớ

- Level 1 (Foundation) chỉ kiểm tra 2 mức Bloom's: Remembering và Understanding — không có Applying/Analyzing, nghĩa là trọng tâm ôn thi là "biết và hiểu", không phải "làm được".
- Unit 6 (Architecture Governance) là unit duy nhất mà **100% outcome** đều ở mức Understanding — không có outcome thuần Remembering.
- Unit 2 (Definitions) không tự nó thi riêng — chỉ quan trọng khi thuật ngữ đó được dùng trong outcome của unit khác, nên đừng học vẹt tách rời ngữ cảnh.
- Trọng số câu hỏi trong đề thi thật (xem [../02-mock-exam-40-questions](../02-mock-exam-40-questions)) không tỷ lệ thuận với số Learning Outcome mỗi Unit — Unit 3 (ADM) có nhiều outcome nhất và cũng chiếm tỷ trọng câu hỏi cao nhất (35%).
- Unit 8 không có mức Bloom's ghi rõ, phản ánh việc đây là kiến thức "biết về chương trình chứng chỉ" hơn là kiến thức kỹ thuật EA.

## Liên kết với khái niệm khác

- [../02-mock-exam-40-questions](../02-mock-exam-40-questions) — bảng trọng số 6 nhóm chủ đề ở đó ánh xạ gần như 1-1 với 8 Unit ở đây (một số Unit gộp chung nhóm chủ đề).
- [../01-test-yourself-per-chapter](../01-test-yourself-per-chapter) — mỗi chương của [G] tương ứng với 1-2 Learning Unit; dùng Test Yourself để tự kiểm tra từng Unit trước khi tick vào checklist này.
- [../../02-adm](../../02-adm) — chiếm 2 trong 8 Unit (Unit 3 và Unit 5), là mảng lớn nhất cần ôn theo checklist.

## Câu hỏi ôn tập

- Vì sao Level 1 (Foundation) chỉ giới hạn ở Remembering/Understanding mà không yêu cầu Applying — điều này ảnh hưởng thế nào đến cách nên ôn thi (học thuộc + hiểu khái niệm, so với luyện thực hành)?
- Trong 8 Unit, Unit nào có ít Learning Outcome nhất và điều đó có tương ứng với tỷ trọng câu hỏi thấp nhất trong đề thi thật không?
- Tài liệu Body of Knowledge nào ({S0}-{S5}, hay các Series Guide G1xx) là nguồn chính cho từng Unit, và mỗi loại tài liệu đó tương ứng với phần nào trong tài liệu [S] của repo này?
