# ADM: ADM Techniques

**Tham chiếu:** [G] Ch.5

## Nội dung chính

**Vị trí trong TOGAF Library:** ADM Techniques là một trong các thành phần TOGAF Fundamental Content (cùng với Introduction and Core Concepts, ADM, Applying the ADM, Architecture Content, EA Capability and Governance). Các guideline/technique này được mô tả tách biệt để có thể tham chiếu từ các điểm liên quan trong ADM, thay vì nhúng chi tiết vào chính mô tả ADM.

**1. Architecture Principles** — các quy tắc và hướng dẫn chung liên quan đến công việc kiến trúc, do Enterprise Architect phát triển cùng stakeholder chính và được Architecture Board phê duyệt; là **output của Preliminary Phase**. Mục đích: hỗ trợ ra quyết định (đặc biệt là "tie-breaking" khi trade-off), gắn kết tổ chức (loại bỏ tính chủ quan), đảm bảo governance (quyết định đúng người đúng lúc), và làm rõ giá trị/văn hóa tổ chức.
   - **Template chuẩn (4 phần):** *Name* (dễ nhớ, tránh mơ hồ), *Statement* (phát biểu quy tắc rõ ràng, không mơ hồ), *Rationale* (lý do nghiệp vụ), *Implications* (yêu cầu/tác động khi áp dụng, cả về resource/cost/task).
   - **5 tiêu chí của một bộ nguyên tắc tốt:** Complete (bao phủ mọi tình huống), Robust (đủ chặt chẽ để hỗ trợ quyết định phức tạp), Understandable (dễ hiểu, rõ ràng), Consistent (không mâu thuẫn nhau), Stable (bền vững nhưng vẫn có cơ chế sửa đổi).

**2. Business Scenarios** — kỹ thuật giúp nhận diện và hiểu rõ business requirement mà kiến trúc phải giải quyết; kết quả là mô tả một nhu cầu/vấn đề kinh doanh quan trọng. Một business scenario mô tả: vấn đề kinh doanh, môi trường kinh doanh & công nghệ, các actor (người và hệ thống) thực thi, và kết quả mong muốn. Có thể dùng ở nhiều phase: Preliminary (định requirement cho EA Capability), Phase A (định requirement + xây đồng thuận), Business Architecture phase (suy ra đặc tính kiến trúc từ yêu cầu cấp cao). Lưu ý: business scenario KHÔNG phải use-case, business model, hay business plan.

**3. Gap Analysis** — mục đích là ghi nhận sự khác biệt giữa Baseline Architecture và Target Architecture, xác định các building block bị thêm/xóa/thay đổi.

**4. Interoperability** — TOGAF định nghĩa là "khả năng chia sẻ thông tin và dịch vụ". Phân loại thành 3 cấp: Operational/Business Interoperability (chia sẻ business process), Information Interoperability (chia sẻ thông tin), Technical Interoperability (chia sẻ/kết nối dịch vụ kỹ thuật). Việc xác định interoperability diễn ra xuyên suốt ADM: Phase A (bản chất & cân nhắc bảo mật qua business scenario), Phase B (định nghĩa theo thuật ngữ nghiệp vụ), Phase C-Data (nội dung trao đổi qua data/information exchange model), Phase C-Application (cách ứng dụng chia sẻ), Phase D (cơ chế kỹ thuật), Phase E (chọn giải pháp thực tế như COTS/SaaS), Phase F (triển khai logic).

**5. Business Transformation Readiness Assessment** — kỹ thuật đánh giá và định lượng mức độ sẵn sàng thay đổi (readiness) của tổ chức, là nỗ lực chung giữa HR, business lines, và IT planner. Khuyến nghị thực hiện ở **Phase A**, phục vụ trực tiếp cho Phase E/F. Các bước: xác định các yếu tố readiness ảnh hưởng đến tổ chức → trình bày qua maturity model → đánh giá và chấm điểm từng yếu tố → đánh giá rủi ro và hành động cải thiện cho từng yếu tố → đưa các hành động này vào Implementation and Migration Plan.

**6. Risk Management** — theo ISO 31000, risk management là "các hoạt động phối hợp để chỉ đạo và kiểm soát tổ chức liên quan đến rủi ro". Enterprise Architect có thể nhận diện và giảm thiểu một số rủi ro, nhưng rủi ro phải được **chấp nhận và quản lý trong khuôn khổ governance**. Quy trình: risk classification → risk identification → initial risk assessment → risk mitigation → residual risk assessment → risk monitoring. Rủi ro được nhận diện ở Phase A (như một phần của Business Transformation Readiness Assessment ban đầu) và được theo dõi/cập nhật liên tục ở Phase G (Implementation Governance) — nơi risk monitoring có thể phát hiện rủi ro nghiêm trọng chưa được giảm thiểu, đòi hỏi kích hoạt lại một phần hoặc toàn bộ chu trình ADM.

## Điểm cần nhớ

- Architecture Principles là output của Preliminary Phase, dùng template 4 phần (Name/Statement/Rationale/Implications) và phải đạt 5 tiêu chí Complete/Robust/Understandable/Consistent/Stable.
- Business Scenarios ≠ use-case/business model/business plan — nó là kỹ thuật khám phá requirement, dùng nhiều nhất ở Preliminary, Phase A, và Business Architecture.
- Interoperability có 3 cấp (Operational, Information, Technical) và việc xác định nó trải dài từ Phase A đến Phase F, mỗi phase làm rõ một khía cạnh khác nhau.
- Business Transformation Readiness Assessment thực hiện ở Phase A nhưng kết quả nuôi trực tiếp vào Implementation and Migration Plan ở Phase E/F.
- Risk Management là trách nhiệm chia sẻ: Architect nhận diện/giảm thiểu, nhưng governance framework mới là nơi rủi ro được chấp nhận chính thức; rủi ro khởi đầu ở Phase A, giám sát liên tục ở Phase G.

## Liên kết với khái niệm khác

- `../01-preliminary/` — Architecture Principles là output chính thức của Preliminary Phase.
- `../02-phase-a-architecture-vision/` — Business Scenarios và Business Transformation Readiness Assessment đều được khuyến nghị áp dụng chủ yếu tại Phase A.
- `../../01-core-concepts/07-architecture-principles/` — mở rộng khái niệm Architecture Principles ở tầng core concept, không giới hạn trong ADM.

## Câu hỏi ôn tập

- Trình bày 4 thành phần của template định nghĩa một Architecture Principle và giải thích vai trò từng phần.
- Ba cấp độ của Interoperability là gì, và mỗi cấp được làm rõ ở phase nào trong ADM?
- Quy trình 6 bước của Risk Management là gì, và ai chịu trách nhiệm "chấp nhận" rủi ro cuối cùng?
