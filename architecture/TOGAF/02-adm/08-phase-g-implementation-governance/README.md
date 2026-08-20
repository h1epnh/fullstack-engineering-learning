# ADM: Phase G — Implementation Governance

**Tham chiếu:** [G] Ch.4

## Nội dung chính

**Mục đích (Purpose):** Hoàn thành các dự án nhằm triển khai những thay đổi cần thiết để đạt được trạng thái target đã điều chỉnh (adjusted target state).

**Essential knowledge cần xác định trong Phase G:**
- Mục đích và ràng buộc đối với đội triển khai (implementation team) — thể hiện qua Gap, Architecture Requirement Specification, Control
- Mức ưu tiên/sở thích của stakeholder điều chỉnh thế nào theo success, value, effort, risk của thay đổi (Stakeholder Requirements)

**Objectives:**
1. Đảm bảo sự tuân thủ (conformance) với Target Architecture bởi các Implementation Project.
2. Thực hiện các chức năng Architecture Governance phù hợp cho giải pháp và bất kỳ Architecture Change Request nào phát sinh do việc triển khai.

## Điểm cần nhớ

- Phase G là nơi ADM "giám sát" — không tự triển khai, mà đảm bảo các Implementation Project (do các đội dự án bên ngoài architecture team thực hiện) tuân thủ đúng Target Architecture.
- Architecture Contract và Architecture Requirements Specification (giới thiệu ở Phase A/00-overview) là công cụ chính để governance ở Phase G — chúng "chỉ đạo và kiểm soát" (direct and control) đội triển khai.
- Bất kỳ thay đổi nào phát sinh trong lúc triển khai (implementation-driven Architecture Change Request) đều phải qua đúng chức năng Architecture Governance, không được tự ý thực hiện ngoài quy trình.
- Phase G là cầu nối trực tiếp sang Phase H: các gap giữa target đã duyệt và thực tế triển khai (value realization) được Phase H tiếp nhận để đánh giá nhu cầu thay đổi kiến trúc tiếp theo.

## Liên kết với khái niệm khác

- `../07-phase-f-migration-planning/` — các dự án được phê duyệt và lên kế hoạch ở Phase F là đối tượng được governance ở Phase G.
- `../09-phase-h-architecture-change-management/` — Phase H tiếp nhận kết quả giám sát của Phase G (gap giữa target và thực tế) để quyết định có cần một chu trình ADM mới hay không.
- `../../03-governance-content/01-architecture-governance/` — cơ chế Architecture Governance, Architecture Board, Architecture Contract được mô tả chi tiết ở đây, là nền tảng cho toàn bộ hoạt động của Phase G.

## Câu hỏi ôn tập

- Objective của Phase G tập trung vào "conformance" và "governance functions" — hai điều đó khác nhau thế nào trong thực tế?
- Architecture Contract và Architecture Requirements Specification đóng vai trò gì trong Phase G?
- Khi một Implementation Project phát sinh Architecture Change Request, quy trình nào được áp dụng?
