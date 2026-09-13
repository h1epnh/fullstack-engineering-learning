# Khái niệm: Deliverables, Artifacts, Building Blocks

**Tham chiếu:** [S] §3.6

## Nội dung chính

Khi thực thi ADM, kiến trúc sư tạo ra nhiều loại "output" (process flows, architectural requirements, project plans, compliance assessments...). TOGAF Architecture Content Framework cung cấp một mô hình cấu trúc để định nghĩa nhất quán các work product này, phân thành **3 loại**:

- **Deliverable (sản phẩm bàn giao):** work product được **đặc tả theo hợp đồng (contractually specified)**, được review, approve, và sign off chính thức bởi stakeholder. Là output cuối cùng của dự án; nếu ở dạng tài liệu, thường được lưu trữ (archive) khi dự án kết thúc, hoặc chuyển vào Architecture Repository như một reference model/standard/snapshot của Architecture Landscape tại một thời điểm.
- **Artifact:** một work product kiến trúc mô tả **một khía cạnh (aspect)** của kiến trúc. Artifact được phân loại thành 3 nhóm:
  - **Catalog** — danh sách sự vật (lists of things), ví dụ: requirements catalog.
  - **Matrix** — ma trận thể hiện quan hệ giữa các sự vật, ví dụ: application interaction matrix.
  - **Diagram** — hình ảnh mô tả sự vật, ví dụ: value chain diagram.
  Một deliverable có thể chứa nhiều artifact, và artifact chính là nội dung tạo nên Architecture Repository. Một artifact có được coi là deliverable hay không phụ thuộc vào đặc tả hợp đồng.
- **Building block:** một thành phần **có thể tái sử dụng (potentially re-usable)**, có thể kết hợp với các building block khác để tạo ra kiến trúc và giải pháp. Building block có thể được định nghĩa ở nhiều mức chi tiết — ban đầu chỉ là tên/mô tả sơ lược, sau đó có thể phân rã thành nhiều building block con kèm đặc tả đầy đủ. Có 2 loại:
  - **Architecture Building Block (ABB)** — mô tả **capability cần có (required capability)**, định hình đặc tả cho các SBB. Ví dụ: một enterprise cần "customer services capability" (ABB), được hỗ trợ bởi nhiều SBB như process, data, application software.
  - **Solution Building Block (SBB)** — đại diện cho **thành phần cụ thể** sẽ dùng để hiện thực hóa capability yêu cầu. Ví dụ: một network là building block, được mô tả qua các artifact bổ trợ và dùng để hiện thực hóa giải pháp cho enterprise.

**Figure 3-2** minh họa mối quan hệ: Artifacts describe Building Blocks; Artifacts được phân loại thành Catalogs/Matrices/Diagrams; cả Architecture Deliverables và Architecture Repository đều chứa cùng cấu trúc này (Repository lưu các Re-Usable Building Blocks).

**Figure 3-3** cho ví dụ cụ thể: deliverable "Architecture Definition Document" chứa các artifact (Process Flow Diagram, Use-Case Diagram...) mô tả các building block (Baseline Call Handling Process, Target Call Handling Process, Customer Services Representative).

## Điểm cần nhớ

- 3 khái niệm phân biệt: **Deliverable** (bàn giao, có hợp đồng), **Artifact** (mô tả 1 khía cạnh kiến trúc — catalog/matrix/diagram), **Building Block** (thành phần tái sử dụng).
- Artifact có 3 dạng: **catalog** (lists), **matrix** (relationships), **diagram** (pictures).
- Building block chia làm 2: **ABB** (capability cần có) vs **SBB** (thành phần hiện thực hóa capability đó).
- Một artifact có là deliverable hay không tùy vào đặc tả hợp đồng — không phải artifact nào cũng là deliverable.
- Deliverable = tài liệu chứa nhiều artifact; artifact mô tả building block.

## Liên kết với khái niệm khác

- [../10-architecture-repository](../10-architecture-repository) — artifact và building block chính là nội dung được lưu trữ trong Architecture Repository (Figure 3-5).
- [../11-content-framework-and-metamodel](../11-content-framework-and-metamodel) — Content Framework quy định chi tiết cấu trúc/metamodel cho deliverable, artifact, building block.
- [../09-enterprise-continuum](../09-enterprise-continuum) — building block (ABB/SBB) di chuyển từ generic (Foundation) đến specific (Organization-Specific) dọc theo Enterprise Continuum.

## Câu hỏi ôn tập

- Phân biệt Deliverable, Artifact, và Building Block — mỗi khái niệm trả lời câu hỏi gì?
- Artifact được phân thành 3 loại nào? Cho ví dụ mỗi loại.
- ABB và SBB khác nhau như thế nào? Cho một ví dụ minh họa mối quan hệ giữa chúng.
