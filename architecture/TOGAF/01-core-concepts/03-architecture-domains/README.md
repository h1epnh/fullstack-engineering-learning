# Khái niệm: 4 Architecture Domains (Business/Data/Application/Technology)

**Tham chiếu:** [S] §3.3

## Nội dung chính

TOGAF được thiết kế để hỗ trợ **4 domain kiến trúc** được công nhận rộng rãi là các tập con (subsets) của một Enterprise Architecture tổng thể:

- **Business Architecture** — định nghĩa chiến lược kinh doanh (business strategy), governance, tổ chức (organization), và các quy trình nghiệp vụ cốt lõi (key business processes).
- **Data Architecture** — mô tả cấu trúc tài sản dữ liệu logic và vật lý (logical and physical data assets) và các tài nguyên quản lý dữ liệu (data management resources) của tổ chức.
- **Application Architecture** — cung cấp bản thiết kế (blueprint) cho từng ứng dụng riêng lẻ sẽ được triển khai, cách chúng tương tác với nhau, và mối quan hệ của chúng với các business process cốt lõi.
- **Technology Architecture** — mô tả kiến trúc số (digital architecture) và hạ tầng phần mềm/phần cứng logic (logical software and hardware infrastructure) cùng các chuẩn cần thiết để hỗ trợ triển khai các dịch vụ business, data, application. Bao gồm: digital services, IoT, hạ tầng social media, cloud services, hạ tầng IT, middleware, networks, communications, processing, standards, v.v.

Lưu ý: Data Architecture và Application Architecture thường được gộp chung dưới tên **Information Systems Architecture** (đây là cách ADM Phase C gọi chúng — xem 02-adm/04-phase-c).

Ngoài 4 domain "chuẩn" này, TOGAF cho phép định nghĩa **các domain khác** bằng cách kết hợp các góc nhìn (views) phù hợp từ Business, Data, Application, Technology. Ví dụ được liệt kê: Information Architecture, Risk and Security Architectures, Digital Architecture. Đây là minh chứng cho việc TOGAF framework cho phép tạo ra các "multi-dimensional views" và phân loại chúng thành domain cụ thể để tổ chức xem xét phạm vi rộng hơn của enterprise và capabilities của mình.

## Điểm cần nhớ

- 4 domain chuẩn: **Business, Data, Application, Technology** — viết tắt quen thuộc là B-D-A-T.
- Data + Application thường gộp thành "Information Systems Architecture" trong ADM (Phase C).
- Technology Architecture bao phủ cả các yếu tố hiện đại: IoT, cloud, social media infrastructure — không chỉ hạ tầng truyền thống.
- Có thể tạo domain lai (Information Architecture, Risk & Security Architecture, Digital Architecture...) bằng cách kết hợp views từ 4 domain gốc.

## Liên kết với khái niệm khác

- [../../02-adm/03-phase-b-business-architecture](../../02-adm/03-phase-b-business-architecture), [../../02-adm/04-phase-c-information-systems-architectures](../../02-adm/04-phase-c-information-systems-architectures), [../../02-adm/05-phase-d-technology-architecture](../../02-adm/05-phase-d-technology-architecture) — mỗi domain tương ứng trực tiếp với một phase trong ADM (B, C, D).
- [../11-content-framework-and-metamodel](../11-content-framework-and-metamodel) — Content Framework (Figure 3-6) tổ chức nội dung kiến trúc theo đúng 4 domain này.
- [../06-architecture-abstraction](../06-architecture-abstraction) — 4 mức trừu tượng (Contextual/Conceptual/Logical/Physical) áp dụng "cross" (cắt ngang) cả 4 domain này.

## Câu hỏi ôn tập

- Kể tên 4 architecture domain chuẩn của TOGAF và mô tả ngắn gọn phạm vi của mỗi domain.
- Vì sao Data Architecture và Application Architecture thường được gộp thành "Information Systems Architecture"?
- Cho một ví dụ về domain "lai" được tạo ra bằng cách kết hợp view từ nhiều domain gốc.
