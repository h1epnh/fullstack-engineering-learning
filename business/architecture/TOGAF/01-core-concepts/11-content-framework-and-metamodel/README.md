# Khái niệm: TOGAF Content Framework & Enterprise Metamodel

**Tham chiếu:** [S] §3.12

## Nội dung chính

### 3.12.1 Overview

ADM cung cấp lifecycle management để tạo và quản lý kiến trúc. Ở mỗi phase, có một discussion về inputs/outputs/steps mô tả nhiều work product kiến trúc. Khi thiết lập Enterprise Architecture Capability đặc thù tổ chức (ở Preliminary Phase), một nhiệm vụ thiết yếu là định nghĩa:

- Một **categorization framework** dùng để cấu trúc Architecture Descriptions, các work product biểu diễn kiến trúc, và tập hợp các model mô tả kiến trúc — gọi là **Content Framework**.
- Một hiểu biết về các loại thực thể (entities) trong enterprise và mối quan hệ giữa chúng cần được ghi nhận, lưu trữ, phân tích để tạo Architecture Description — gọi là **Enterprise Metamodel**, mô tả thông tin này dưới dạng một mô hình chính thức (formal model).
- Các artifact cụ thể cần phát triển (xem §3.6).

Content Framework được chọn thường bị ảnh hưởng bởi: Architecture Framework được chọn làm nền tảng cho EA Capability, và công cụ phần mềm được chọn để hỗ trợ EA Capability.

### 3.12.2 Content Framework

Content Framework định nghĩa một categorization framework để mô tả building block và artifact phản ánh các quyết định trong việc tạo tổng thể architecture deliverable. Architecture Repository (§3.11) được cấu trúc để lưu trữ đúng những artifact/work product mà Content Framework xác định. Content Framework là một phần của Enterprise-Specific Architecture Framework.

Có nhiều Content Framework thay thế (TOGAF Content Framework, Zachman Framework, DoDAF, NAF...). Việc **chọn một** Content Framework là thiết yếu, dù bản thân việc chọn framework nào ít quan trọng hơn — Content Framework cuối cùng thường được tailor cho nhu cầu riêng của tổ chức.

TOGAF Content Framework nhằm: cung cấp mô hình chi tiết về architectural work products; thúc đẩy tính nhất quán trong output khi theo ADM; cung cấp checklist toàn diện về architecture output có thể tạo ra; giảm rủi ro thiếu sót (gaps) trong tập deliverable cuối cùng; giúp enterprise chuẩn hóa khái niệm/thuật ngữ/deliverable kiến trúc.

**Figure 3-6 (Content Framework by ADM Phase)** cấu trúc theo các phase ADM:

- **Architecture Principles, Vision, and Requirements** — bao trùm Preliminary, Architecture Requirements, Architecture Vision; ghi nhận Architecture Principles chung, bối cảnh chiến lược làm input cho mô hình hóa kiến trúc, và các requirements sinh ra từ kiến trúc.
- **Architecture Definition** — gồm Motivation, và 3 cột: **Business Architecture** (Strategy, Operational), **Information Systems Architectures** (Data, Application), **Technology Architecture**.
- **Architecture Realization** — gồm Opportunities/Solutions/Migration Planning và Implementation Governance.
- **Architecture Change Management** — bao trùm toàn bộ chiều dọc bên phải, liên tục qua mọi phase.

Mô tả từng nhóm nội dung (bullet points ứng với các khối trong Figure 3-6):

- **Architecture Principles, Vision, Motivation, and Requirements models**: nắm bắt bối cảnh xung quanh các mô hình kiến trúc chính thức — bối cảnh chiến lược làm phát sinh Request for Architecture Work thường được điều tra, tinh chỉnh, xác thực, ghi nhận trong Preliminary và Architecture Vision.
- **Business Architecture**: mô hình kiến trúc của business, xem xét các yếu tố tạo động lực (motivate) cho enterprise, cấu trúc, và capability của nó.
- **Information Systems Architecture**: mô hình kiến trúc hệ thống thông tin (applications và data), theo đúng các phase ADM.
- **Technology Architecture**: mô hình kiến trúc các tài sản công nghệ dùng để hiện thực hóa giải pháp hệ thống thông tin.
- **Architecture Realization/Transformation models**: nắm bắt các roadmap thay đổi thể hiện chuyển tiếp giữa các trạng thái kiến trúc, và các binding statement dùng để dẫn dắt/quản trị việc hiện thực hóa kiến trúc.
- **Architecture Change Management models**: nắm bắt các sự kiện quản lý hiện thực giá trị (value realization management events), nội bộ và bên ngoài, tác động đến EA và sinh ra requirements cho hành động.

### 3.12.3 Enterprise Metamodel

TOGAF khuyến khích phát triển một **Enterprise Metamodel**, định nghĩa các loại thực thể xuất hiện trong các mô hình mô tả enterprise, cùng mối quan hệ giữa chúng. Ví dụ: một type có thể là "Role", và các model Business Architecture của enterprise có thể chứa instance của Role như Teller, Pilot, Manager, Volunteer, Customer, Firefighter.

Enterprise Metamodel mang lại giá trị theo nhiều cách: cung cấp cho kiến trúc sư một tập khởi điểm (starter set) các loại sự vật cần điều tra và bao phủ trong mô hình; cung cấp một dạng completeness-check cho bất kỳ ngôn ngữ mô hình hóa/metamodel kiến trúc nào được đề xuất dùng trong enterprise (đánh giá xem nó xử lý đầy đủ các entity type và các fact bắt buộc như attribute, relationship hay không); giúp đảm bảo **Consistency, Completeness, Traceability**.

TOGAF **không** nhằm ràng buộc lựa chọn artifact hay modeling notation của enterprise — có thể dùng ArchiMate, BPMN, UML, entity-relationship diagramming, flowcharting, hay bất kỳ notation nào diễn đạt được ý tưởng TOGAF. Việc phát triển một metamodel chất lượng cao là khía cạnh quan trọng khi thiết lập Enterprise Architecture Capability.

### 3.12.4 Developing the Enterprise Metamodel

Enterprise Metamodel là phần quan trọng của Organization-Specific Architecture Framework. **Figure 3-7** cho thấy Enterprise Continuum (§3.10) cung cấp cách xem xét tài nguyên trên một trục từ tổng quát nhất ("Foundation") đến cụ thể nhất ("Organization-Specific"), qua các mức trung gian Common và Industry, với "Adaptation for Use" là cơ chế chuyển tiếp giữa các mức.

Để hỗ trợ phát triển metamodel của enterprise, TOGAF Library cung cấp một **Foundation-level Core Enterprise Metamodel** (chi tiết trong TOGAF Standard — Architecture Content), cho thấy các loại thực thể và quan hệ giữa chúng có khả năng cần thiết khi mô hình hóa phần lớn enterprise, cung cấp bối cảnh cho các artifact được đề xuất trong ADM.

**Figure 3-8 (TOGAF Core Enterprise Metamodel)** minh họa cấu trúc: khối **General Entities** (Principle, Constraint, Assumption, Requirement, Location, Gap, Work Package — liên kết với Capability) áp dụng cho mọi object; khối **Business Architecture** (lớn nhất) chứa Driver, Goal, Objective, Measure, Course of Action, Organization Unit, Business Capability, Value Stream, Product, Function, Actor, Role, Process, Event, Service Quality, Contract, Control... liên kết xuống Business Service; ba khối **Data Architecture / Application Architecture / Technology Architecture** ở dưới cùng, với Logical/Physical Data/Application/Technology Component tương ứng.

## Điểm cần nhớ

- **Content Framework** = categorization framework cho work product; **Enterprise Metamodel** = mô hình các entity/relationship trong enterprise. Hai khái niệm khác nhau nhưng bổ trợ.
- Figure 3-6 cấu trúc Content Framework theo 4 nhóm lớn: Principles/Vision/Requirements → Architecture Definition (Business/Information Systems/Technology) → Architecture Realization → Architecture Change Management (chiều dọc, xuyên suốt).
- TOGAF không ép buộc modeling notation cụ thể (có thể dùng ArchiMate, BPMN, UML...).
- Enterprise Metamodel giúp đảm bảo 3 tính chất: **Consistency, Completeness, Traceability**.
- TOGAF Library cung cấp sẵn Foundation-level Core Enterprise Metamodel (Figure 3-8) làm điểm khởi đầu, được "adapt for use" theo trục Enterprise Continuum (Foundation → Common → Industry → Organization-Specific).

## Liên kết với khái niệm khác

- [../05-deliverables-artifacts-building-blocks](../05-deliverables-artifacts-building-blocks) — Content Framework quy định cách cấu trúc chính các Deliverables/Artifacts/Building Blocks đã học ở §3.6.
- [../09-enterprise-continuum](../09-enterprise-continuum) — trục Foundation → Common → Industry → Organization-Specific (Figure 3-7) chính là ứng dụng của Enterprise Continuum vào việc phát triển metamodel.
- [../03-architecture-domains](../03-architecture-domains) — Core Enterprise Metamodel (Figure 3-8) tổ chức entity theo đúng 4 domain Business/Data/Application/Technology.

## Câu hỏi ôn tập

- Phân biệt Content Framework và Enterprise Metamodel — mỗi khái niệm giải quyết vấn đề gì?
- Figure 3-6 tổ chức Content Framework theo 4 nhóm lớn nào, và nhóm nào chạy xuyên suốt (dọc) qua các nhóm còn lại?
- Enterprise Metamodel giúp đảm bảo 3 tính chất nào, và vì sao TOGAF không ràng buộc notation mô hình hóa cụ thể?
