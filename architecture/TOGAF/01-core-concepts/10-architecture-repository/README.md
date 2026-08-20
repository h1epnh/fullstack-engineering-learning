# Khái niệm: Architecture Repository

**Tham chiếu:** [S] §3.11

## Nội dung chính

**Architecture Repository** là khái niệm hỗ trợ Enterprise Continuum, dùng để **lưu trữ các lớp output kiến trúc khác nhau ở các mức trừu tượng khác nhau**, được tạo ra bởi ADM. Nhờ đó, TOGAF giúp các stakeholder và practitioner ở các cấp độ khác nhau hiểu nhau và hợp tác dễ dàng hơn.

Thông qua Enterprise Continuum và Architecture Repository, kiến trúc sư được khuyến khích **tận dụng tất cả tài nguyên và tài sản kiến trúc liên quan** khác khi phát triển một Organization-Specific Architecture. ADM khi đó có thể được xem như mô tả một **vòng đời quy trình (process lifecycle)** hoạt động ở nhiều cấp trong tổ chức, vận hành trong một khung governance tổng thể (holistic governance framework), tạo ra các output nhất quán được lưu trong Architecture Repository. Enterprise Continuum cung cấp bối cảnh quý giá để hiểu các mô hình kiến trúc: nó cho thấy building block và mối quan hệ giữa chúng, cùng các ràng buộc/yêu cầu trên một chu kỳ phát triển kiến trúc.

**Figure 3-5 (TOGAF Architecture Repository Structure)** — mô tả 8 thành phần chính:

- **Architecture Metamodel** — mô tả việc áp dụng khung kiến trúc được tailor hóa theo tổ chức (organizationally tailored application of an architecture framework), bao gồm metamodel cho architecture content.
- **Architecture Capability** — định nghĩa các tham số, cấu trúc, và quy trình hỗ trợ governance của Architecture Repository.
- **Architecture Landscape** — biểu diễn kiến trúc của các tài sản đã triển khai trong enterprise vận hành **tại một thời điểm cụ thể**; landscape có thể tồn tại ở nhiều mức trừu tượng khác nhau để phù hợp với các mục tiêu kiến trúc khác nhau.
- **Standards Library** — chứa các chuẩn mà kiến trúc mới phải tuân thủ, có thể bao gồm chuẩn ngành, sản phẩm/dịch vụ đã chọn từ nhà cung cấp, hoặc shared services đã triển khai sẵn trong tổ chức.
- **Reference Library** — cung cấp guideline, template, pattern, và các dạng tài liệu tham khảo khác có thể tận dụng để tăng tốc việc tạo kiến trúc mới.
- **Governance Repository** — cung cấp bản ghi (record) hoạt động governance trên toàn enterprise.
- **Architecture Requirements Repository** — cung cấp góc nhìn tổng thể tất cả các yêu cầu kiến trúc đã được phê duyệt (authorized), đã thống nhất với Architecture Board.
- **Solutions Landscape** — trình bày biểu diễn kiến trúc của các SBB hỗ trợ Architecture Landscape, đã được lên kế hoạch hoặc triển khai bởi enterprise.

Ngoài các thành phần nội bộ, Repository còn tương tác với các yếu tố bên ngoài: **External Reference Models** (được enterprise adopt vào Reference Library), **External Standards** (được adopt vào Standards Library), và **Architecture Board** (theo dõi/định hướng governance, và có visibility & escalation vào Governance Repository).

## Điểm cần nhớ

- Architecture Repository lưu trữ nhiều lớp output kiến trúc **ở nhiều mức trừu tượng khác nhau**, tạo bởi ADM.
- 8 thành phần chính (Figure 3-5): Architecture Metamodel, Architecture Capability, Architecture Landscape, Standards Library, Reference Library, Governance Repository, Architecture Requirements Repository, Solutions Landscape.
- Architecture Landscape ≠ Solutions Landscape: một mô tả tài sản **đã triển khai** (kiến trúc), một mô tả **SBB** hỗ trợ landscape đó.
- Repository liên kết với 3 yếu tố ngoại vi: External Reference Models, External Standards, Architecture Board.

## Liên kết với khái niệm khác

- [../09-enterprise-continuum](../09-enterprise-continuum) — Architecture Repository là hiện thực hóa vật lý (Figure 3-5) của cơ chế phân loại mà Enterprise Continuum mô tả (Figure 3-4).
- [../05-deliverables-artifacts-building-blocks](../05-deliverables-artifacts-building-blocks) — Architecture Deliverables/Repository lưu trữ chính xác artifacts và building blocks đã định nghĩa ở §3.6 (xem lại Figure 3-2).
- [../../03-governance-content/01-architecture-governance](../../03-governance-content/01-architecture-governance) — Governance Repository và Architecture Board tương ứng trực tiếp với chủ đề Architecture Governance.

## Câu hỏi ôn tập

- Liệt kê 8 thành phần chính trong TOGAF Architecture Repository Structure (Figure 3-5) và mô tả vai trò ngắn gọn của mỗi thành phần.
- Phân biệt Architecture Landscape và Solutions Landscape.
- Architecture Repository tương tác với những yếu tố bên ngoài nào, và qua kênh nào?
