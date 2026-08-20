# Architecture Content: danh mục Deliverables/Artifacts chuẩn

**Tham chiếu:** [G] Ch.8

## Nội dung chính

### Khái niệm nền tảng (ISO/IEC/IEEE 42010)

TOGAF Content Framework dựa trên 4 khái niệm cốt lõi:

- **Stakeholder** — cá nhân/nhóm/tổ chức có lợi ích trong hệ thống (người dùng, developer...).
- **Concern** — mối quan tâm của stakeholder đối với hệ thống (hiệu năng, bảo mật, khả năng mở rộng...). Concern *không đồng nghĩa* với requirement — concern là gốc để phân rã thành các requirement cụ thể.
- **Architecture View** — biểu diễn hệ thống từ góc nhìn của một tập concern liên quan; là "cái ta thấy" (hoặc cái stakeholder thấy).
- **Architecture Viewpoint** — định nghĩa góc nhìn để tạo ra view đó: cách xây dựng/sử dụng view, thông tin cần, kỹ thuật mô hình hóa, và lý do lựa chọn. Quan hệ giữa viewpoint và view giống như quan hệ giữa template và instance — kiến trúc sư chọn viewpoint trước, rồi mới dựng view tương ứng.

**Building block** là gói chức năng được định nghĩa để đáp ứng nhu cầu nghiệp vụ, có type tương ứng với metamodel (actor, business service, application, data entity...), có ranh giới rõ ràng, và có thể tương tác với building block khác. Có hai loại:

- **ABB (Architecture Building Block)** — nhóm ở mức chức năng cơ bản, nắm bắt yêu cầu kiến trúc (trừu tượng).
- **SBB (Solution Building Block)** — sản phẩm cụ thể có thể mua hoặc phát triển tùy chỉnh (cụ thể).

Việc đặc tả building block là một quá trình lặp và tiến hóa, diễn ra chủ yếu ở Phase A-D: bắt đầu từ thực thể trừu tượng ở Phase A, tinh chỉnh dần qua B/C/D theo mẫu 4 bước (chọn reference model/viewpoint/tool → phát triển Baseline description → phát triển Target description → gap analysis), rồi ở Phase E các building block được gắn với work package để giải quyết gap.

### Bảng deliverable chính theo từng ADM Phase

| ADM Phase | Deliverable chính |
|---|---|
| Preliminary | Architecture Principles; Business Principles/Goals/Drivers; Request for Architecture Work |
| A – Architecture Vision | Statement of Architecture Work; Architecture Vision; Communications Plan; Capability Assessment; Architecture Definition Document (khởi tạo) |
| B – Business Architecture | Architecture Definition Document (cập nhật); Architecture Requirements Specification |
| C – Information Systems Architectures | Architecture Roadmap (khởi tạo) |
| D – Technology Architecture | (tiếp tục cập nhật Definition Document/Requirements Spec) |
| E – Opportunities & Solutions | Architecture Definition Document; Architecture Roadmap; Implementation and Migration Plan; Implementation Governance Model |
| F – Migration Planning | Architecture Roadmap; Implementation and Migration Plan; Implementation Governance Model |
| G – Implementation Governance | Implementation Governance Model; Architecture Contracts; Change Request; Compliance Assessment |
| H – Architecture Change Management | Implementation Governance Model; Architecture Contracts; Change Request; Compliance Assessment; Request for Architecture Work; Requirements Impact Assessment |
| Requirements Management (xuyên suốt) | Architecture Requirements Specification; Requirements Impact Assessment |

### Danh mục deliverable/artifact (tóm tắt)

- **Architecture Contract** — thỏa thuận chung giữa các bên phát triển và sponsor về deliverable/chất lượng/fitness-for-purpose; xuất hiện chủ yếu ở Phase G. (Xem chi tiết ở [../01-architecture-governance](../01-architecture-governance).)
- **Architecture Definition Document** — "container" chứa các artifact kiến trúc cốt lõi, bao quát cả 4 domain (Business/Data/Application/Technology) và mọi trạng thái (Baseline/Transition/Target). Khởi tạo ở Phase A, cập nhật xuyên suốt B/C/D/E. Là cặp bổ sung định tính cho Architecture Requirements Specification (định lượng).
- **Architecture Principles** — quy tắc/hướng dẫn chung cho công việc kiến trúc; đầu ra của Preliminary Phase.
- **Architecture Requirements Specification** — tập hợp các phát biểu định lượng mà một dự án triển khai phải đáp ứng để tuân thủ kiến trúc; thường là thành phần chính của hợp đồng triển khai. Được nạp dữ liệu từ Phase B (business/technical requirements), Phase C (data/application interoperability), Phase D (technology requirements).
- **Architecture Roadmap** — liệt kê các work package hiện thực hóa Target Architecture, sắp trên timeline từ Baseline đến Target, nêu bật giá trị nghiệp vụ từng giai đoạn; phát triển dần ở Phase E/F, dựa trên input từ B/C/D.
- **Architecture Vision** — tóm tắt cấp cao các thay đổi doanh nghiệp sẽ có được từ Target Architecture; tạo ở Phase A để thống nhất kết quả mong muốn trước khi đi vào chi tiết.
- **Business Principles, Goals, and Drivers** — thường đã được định nghĩa sẵn trong doanh nghiệp; được nhắc lại làm đầu ra của Preliminary Phase và rà soát lại ở Phase A.
- **Capability Assessment** — đánh giá baseline/target về năng lực doanh nghiệp; thực hiện lần đầu ở Phase A, cập nhật ở Phase E. Gồm 4 phần: Business Capability Assessment, IT Capability Assessment, Architecture Maturity Assessment, Business Transformation Readiness Assessment.
- **Change Request** — được xem xét ở Phase H khi thông tin mới cho thấy kiến trúc/yêu cầu gốc không còn phù hợp hoặc không đủ để hoàn thành triển khai; có thể khởi động lại một chu kỳ ADM.
- **Communications Plan** — kế hoạch truyền đạt thông tin kiến trúc đúng đối tượng, đúng thời điểm; phát triển ở Phase A vì đây là Critical Success Factor của Enterprise Architecture.
- **Compliance Assessment** — rà soát định kỳ tại Phase G để đảm bảo triển khai đi đúng Architecture Vision, gồm checklist theo nhiều mảng (hardware/OS, phần mềm/middleware, ứng dụng, quản lý thông tin, bảo mật, quản lý hệ thống...).
- **Implementation and Migration Plan** — phát triển ở Phase E/F, cung cấp lịch trình dự án triển khai Target Architecture, nhóm các dự án khả thi thành portfolio/program có quản lý; bao gồm Implementation and Migration Strategy.
- **Implementation Governance Model** — đầu ra của Phase F, đảm bảo dự án chuyển sang triển khai (implementation) cũng chuyển tiếp mượt mà sang Architecture Governance phù hợp (cho Phase G); gồm quy trình, cơ cấu tổ chức, vai trò/trách nhiệm, checkpoint governance.
- **Request for Architecture Work** — tài liệu gửi từ tổ chức bảo trợ đến tổ chức kiến trúc để kích hoạt một chu kỳ phát triển kiến trúc; sản phẩm của Preliminary Phase, có thể cũng phát sinh từ Change Request đã duyệt.
- **Requirements Impact Assessment** — đánh giá tác động khi thông tin mới làm thay đổi yêu cầu/đặc tả kiến trúc hiện tại; thường được tạo ra để phản hồi một Change Request.
- **Statement of Architecture Work** — deliverable của Phase A, thực chất là hợp đồng giữa tổ chức kiến trúc và sponsor; là phản hồi cho Request for Architecture Work, mô tả kế hoạch tổng thể giải quyết yêu cầu công việc.

## Điểm cần nhớ

- Content Framework xoay quanh 4 khái niệm ISO 42010: stakeholder → concern → viewpoint (template) → view (instance).
- Concern ≠ requirement: concern là gốc, requirement là kết quả phân rã của concern.
- Architecture Definition Document (định tính) và Architecture Requirements Specification (định lượng) là một cặp bổ sung nhau, cùng bao quát 4 domain và 3 trạng thái kiến trúc.
- ABB (trừu tượng, yêu cầu) khác SBB (cụ thể, sản phẩm/giải pháp thật); việc chuyển từ ABB sang SBB diễn ra qua Phase A-D.
- Nhiều deliverable "song sinh" theo cặp Phase G/H: Implementation Governance Model, Architecture Contracts, Change Request, Compliance Assessment đều tái xuất hiện ở cả hai phase vì đó là chu kỳ governance-triển khai-thay đổi liên tục.

## Liên kết với khái niệm khác

- [../01-architecture-governance](../01-architecture-governance) — Architecture Contract và Compliance Assessment gắn chặt với cơ chế governance mô tả ở đó.
- [../../01-core-concepts/16-architecture-views-and-viewpoints](../../01-core-concepts/16-architecture-views-and-viewpoints) — đào sâu khái niệm view/viewpoint làm nền cho toàn bộ Content Framework.
- [../../02-adm/00-overview](../../02-adm/00-overview) — bảng deliverable-theo-phase ở trên chỉ có ý nghĩa khi đặt cạnh tổng quan trình tự các Phase A-H của ADM.

## Câu hỏi ôn tập

- Phân biệt Architecture Definition Document và Architecture Requirements Specification: tài liệu nào mang tính định tính, tài liệu nào định lượng, và vì sao TOGAF tách chúng thành hai deliverable riêng?
- ABB được "tinh chỉnh" thành SBB qua những bước nào trong Phase B/C/D?
- Deliverable nào đóng vai trò là "cầu nối" giữa Phase F (Migration Planning) và Phase G (Implementation Governance), và tại sao?
