# Architecture Governance (Board, Contracts, Compliance, 4-tier hierarchy)

**Tham chiếu:** [G] Ch.7

## Nội dung chính

### Governance là gì

ISO/IEC 38500:2015 định nghĩa governance (quản trị) là "hệ thống chỉ đạo và kiểm soát trạng thái hiện tại và tương lai" của một tổ chức. Governance khác management (quản lý) ở chỗ nó không phải là kiểm soát trực tiếp, chặt chẽ theo quy tắc, mà là một quá trình ra quyết định có cấu trúc quan hệ rõ ràng, đặt trọng tâm vào trách nhiệm ủy thác (fiduciary) và tính bền vững. Governance trả lời ba câu hỏi: ai chịu trách nhiệm (responsible), ai tham gia (involved), ai chịu trách nhiệm giải trình (accountable).

### Architecture Governance

Architecture Governance là thực hành và định hướng để quản lý và kiểm soát Enterprise Architecture (và các kiến trúc khác) ở cấp độ toàn doanh nghiệp. Nó bao gồm:

- Kiểm soát việc tạo và giám sát các thành phần/hoạt động — đảm bảo việc đưa vào, triển khai, và tiến hóa kiến trúc diễn ra đúng hướng.
- Đảm bảo tuân thủ các chuẩn nội bộ, chuẩn bên ngoài, và nghĩa vụ pháp lý.
- Hỗ trợ việc quản lý các hoạt động trên.
- Đảm bảo trách nhiệm giải trình với các bên liên quan nội bộ và bên ngoài.

Governance vận hành như một cơ chế quan sát và đo lường: việc quan sát không nên làm thay đổi cách công việc được thực hiện, mà tạo ra các phép đo (measurements/metrics) để tập trung tổ chức vào mục tiêu. Minh bạch về lý do đo lường và các phương án khắc phục sẽ thúc đẩy hành vi tích cực.

### Hệ thống phân cấp governance (4 tầng)

Architecture Governance thường vận hành trong một hệ thống phân cấp gồm 4 miền (domain) governance riêng biệt, mỗi miền có kỷ luật và quy trình riêng, và có thể tồn tại ở nhiều cấp địa lý (toàn cầu, khu vực, địa phương):

1. **Corporate Governance** — tầng cao nhất, quản trị doanh nghiệp nói chung (tuân thủ pháp lý, trách nhiệm với cổ đông...).
2. **Technology Governance** — quản trị việc lựa chọn và sử dụng công nghệ.
3. **IT Governance** — quản trị các nguồn lực và hoạt động CNTT nói chung.
4. **Architecture Governance** — quản trị riêng cho vòng đời kiến trúc doanh nghiệp; là tầng cụ thể nhất, lồng bên trong ba tầng trên.

Bốn tầng này không tách biệt hoàn toàn mà chồng lấp và hỗ trợ lẫn nhau — Architecture Governance là công cụ thực thi các mục tiêu của Corporate/Technology/IT Governance ở mức độ kiến trúc.

### Architecture Board

Yếu tố then chốt của một chiến lược Architecture Governance thành công là một **Architecture Board** liên tổ chức (cross-organization) — cơ quan bảo trợ (sponsor) cho hoạt động kiến trúc, đại diện cho các bên liên quan chính. Tên gọi cụ thể không quan trọng (có thể gọi là "EA governance board"). Trong doanh nghiệp lớn, Board thường có ít nhất 2 cấp: local (chuyên gia miền, trách nhiệm theo tuyến) và global (trách nhiệm toàn tổ chức).

Một sai lầm phổ biến là để Architecture Board nghĩ rằng mình nắm quyền quyết định (decision rights) về Target Architecture — quyền này luôn thuộc về các stakeholder của kiến trúc. Board sở hữu **quy trình** và đưa ra khuyến nghị về mức độ hoàn chỉnh/tin cậy của công việc dẫn đến Target Architecture, không phải quyền quyết định nội dung.

Trách nhiệm của Architecture Board chia làm 3 nhóm:

- **Ra quyết định:** là cơ sở cho mọi quyết định về kiến trúc; đảm bảo tính nhất quán giữa các sub-architecture; thiết lập mục tiêu tái sử dụng thành phần; thực thi Architecture Compliance; hỗ trợ cơ chế leo thang (escalation) cho các quyết định vượt phạm vi.
- **Vận hành:** giám sát và kiểm soát Architecture Contract; họp định kỳ; đảm bảo triển khai kiến trúc hiệu quả, nhất quán; giải quyết mâu thuẫn/tranh chấp được leo thang; cung cấp tư vấn, hướng dẫn; cấp miễn trừ (dispensation) phù hợp chiến lược công nghệ.
- **Governance:** tạo ra tài liệu governance dùng được; cung cấp cơ chế chấp thuận chính thức qua đồng thuận và công bố có thẩm quyền; là cơ chế kiểm soát nền tảng để đảm bảo triển khai kiến trúc hiệu quả; xác định độ lệch khỏi kiến trúc và lên kế hoạch điều chỉnh (qua dispensation hoặc cập nhật chính sách).

### Architecture Contract

Architecture Contract là thỏa thuận chung giữa các đối tác phát triển và bên bảo trợ (sponsor) về deliverable, chất lượng, và mức độ phù hợp mục đích (fitness-for-purpose) của một kiến trúc. Cách tiếp cận có governance đảm bảo hệ thống giám sát liên tục tính toàn vẹn, thay đổi, ra quyết định, và audit; đồng thời đảm bảo trách nhiệm giải trình khi phát triển và sử dụng artifact kiến trúc.

Architecture Contract xuất hiện tại nhiều giai đoạn của ADM:

- **Statement of Architecture Work** (tạo ở Phase A) thực chất là một Architecture Contract giữa tổ chức kiến trúc và sponsor.
- Việc phát triển một hoặc nhiều domain kiến trúc (Business, Data, Application, Technology) có thể được thuê ngoài cho system integrator/nhà cung cấp — mỗi thỏa thuận này thường được quản trị bằng một Architecture Contract.
- Đầu **Phase G (Implementation Governance)**, hợp đồng nằm giữa chức năng kiến trúc và bên chịu trách nhiệm triển khai.
- Khi Architecture Definition Document được hoàn thiện (cuối Phase F), một Architecture Contract thường được lập giữa chức năng kiến trúc (hoặc chức năng IT governance) và các bên sẽ xây dựng/triển khai hệ thống ứng dụng.

Có hai loại nội dung điển hình: **Architecture Design and Development Contract** (scope, nguyên tắc/yêu cầu kiến trúc và chiến lược, yêu cầu tuân thủ, quy trình/vai trò phát triển và quản lý kiến trúc, thước đo Target Architecture, kế hoạch công việc chung...) và **Business Users' Architecture Contract** (scope, yêu cầu chiến lược, yêu cầu tuân thủ, đối tượng áp dụng kiến trúc, cửa sổ thời gian, thước đo nghiệp vụ, kiến trúc dịch vụ bao gồm SLA...).

### Architecture Compliance

Đảm bảo các dự án tuân thủ Enterprise Architecture là khía cạnh thiết yếu của Architecture Governance, qua hai quy trình bổ sung nhau:

1. Chức năng kiến trúc chuẩn bị các **Project Architecture** — góc nhìn theo dự án cụ thể của Enterprise Architecture (xuyên suốt ADM Phase A-F).
2. Chức năng Enterprise/IT Governance định nghĩa một quy trình **Architecture Compliance review** chính thức để rà soát mức độ tuân thủ của mọi dự án.

Compliance review giúp: bắt lỗi sớm trong kiến trúc dự án; đảm bảo áp dụng best practice; tổng quan mức tuân thủ chuẩn bắt buộc; nhận diện chuẩn nào cần sửa đổi; nhận diện dịch vụ đặc thù ứng dụng có thể chuyển thành hạ tầng dùng chung; thông báo cho management về tình trạng sẵn sàng của dự án; và truyền đạt các khoảng trống kiến trúc quan trọng cho nhà cung cấp sản phẩm/dịch vụ — qua đó rút ngắn thời gian dự án và giúp doanh nghiệp hưởng lợi từ kiến trúc nhanh hơn.

## Điểm cần nhớ

- Governance ≠ management: governance là cấu trúc ra quyết định (ai chịu trách nhiệm/tham gia/giải trình), không phải kiểm soát chi tiết từng hành động.
- 4 tầng governance lồng nhau: Corporate → Technology → IT → Architecture Governance; Architecture Governance là tầng cụ thể nhất, thực thi mục tiêu của các tầng trên.
- Architecture Board sở hữu **quy trình**, không sở hữu quyền quyết định nội dung Target Architecture (quyền đó thuộc về stakeholder).
- Architecture Contract có thể chính là Statement of Architecture Work (Phase A) hoặc hợp đồng riêng ở Phase G; nó ràng buộc chất lượng và fitness-for-purpose giữa các bên.
- Architecture Compliance dựa trên hai trụ cột: Project Architecture (góc nhìn dự án) + Compliance review chính thức (đánh giá tuân thủ).

## Liên kết với khái niệm khác

- [../02-architecture-content-deliverables](../02-architecture-content-deliverables) — Architecture Contract là một trong các deliverable chuẩn của TOGAF, mô tả chi tiết nội dung điển hình.
- [../../02-adm/08-phase-g-implementation-governance](../../02-adm/08-phase-g-implementation-governance) — nơi Architecture Contract giữa chức năng kiến trúc và bên triển khai được thiết lập, và Architecture Governance vận hành thực tế.
- [../../02-adm/02-phase-a-architecture-vision](../../02-adm/02-phase-a-architecture-vision) — Statement of Architecture Work (đầu ra Phase A) chính là dạng Architecture Contract đầu tiên trong vòng đời ADM.

## Câu hỏi ôn tập

- Sự khác biệt cốt lõi giữa Corporate Governance, IT Governance, và Architecture Governance là gì, và tại sao chúng cần tồn tại như các miền lồng nhau thay vì một cơ chế duy nhất?
- Tại sao việc để Architecture Board nắm giữ "quyền quyết định" (decision rights) về Target Architecture lại được xem là một sai lầm điển hình?
- Architecture Contract xuất hiện ở những điểm nào trong ADM, và vai trò của nó khác nhau ra sao giữa Phase A và Phase G?
