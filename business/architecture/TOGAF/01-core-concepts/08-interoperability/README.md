# Khái niệm: Interoperability

**Tham chiếu:** [S] §3.9

## Nội dung chính

**Interoperability** được định nghĩa đơn giản là **"khả năng chia sẻ thông tin và dịch vụ" (the ability to share information and services)**. Việc xác định mức độ thông tin/dịch vụ nên hay không nên được chia sẻ là một yêu cầu kiến trúc rất hữu ích, đặc biệt trong tổ chức phức tạp và/hoặc extended enterprise (hệ sinh thái mở rộng gồm cả đối tác, nhà cung cấp...).

**Interoperability xuyên suốt ADM** — mỗi phase của ADM đóng góp một khía cạnh xác định interoperability:

- **Architecture Vision (Phase A):** bản chất và các cân nhắc bảo mật của việc trao đổi thông tin/dịch vụ được bộc lộ lần đầu qua business scenarios.
- **Business Architecture (Phase B):** việc trao đổi thông tin/dịch vụ được định nghĩa chi tiết hơn bằng ngôn ngữ nghiệp vụ.
- **Data Architecture (Phase C):** nội dung của việc trao đổi thông tin được chi tiết hóa bằng data model/information exchange model của tổ chức.
- **Application Architecture (Phase C):** cách các ứng dụng chia sẻ thông tin và dịch vụ được đặc tả.
- **Technology Architecture (Phase D):** các cơ chế kỹ thuật phù hợp để cho phép trao đổi thông tin/dịch vụ được đặc tả.
- **Opportunities & Solutions (Phase E):** các giải pháp thực tế (ví dụ gói COTS) được lựa chọn.
- **Migration Planning (Phase F):** interoperability được hiện thực hóa (logically implemented).

Có nhiều cách định nghĩa interoperability; điều quan trọng là tổ chức chọn **một định nghĩa nhất quán** áp dụng xuyên suốt enterprise lẫn extended enterprise, và tốt nhất là cả enterprise lẫn extended enterprise cùng dùng chung định nghĩa đó.

**Phân loại theo góc nhìn tổ chức**, nhiều tổ chức thấy hữu ích khi phân interoperability thành 3 loại:

- **Operational/Business Interoperability** — cách các phần khác nhau của enterprise phối hợp làm việc ở mức nghiệp vụ (business level).
- **Information Interoperability** — cách thông tin được chia sẻ.
- **Technical Interoperability** — cách tài nguyên kỹ thuật được chia sẻ hoặc ít nhất kết nối được với nhau.

**Phân loại theo góc nhìn IT** (tương tự khái niệm Enterprise Application Integration - EAI), có 4 loại:

- **Presentation Integration/Interoperability** — cách tiếp cận look-and-feel chung thông qua giải pháp dạng portal chung, dẫn dắt người dùng đến chức năng bên dưới của tập hệ thống.
- **Information Integration/Interoperability** — thông tin doanh nghiệp được chia sẻ liền mạch giữa các ứng dụng để đạt được, ví dụ, một tập thông tin khách hàng thống nhất. Thường dựa trên một corporate ontology và shared services được thống nhất về structure, quality, access, và security/privacy.
- **Application Integration/Interoperability** — chức năng doanh nghiệp được tích hợp và chia sẻ được, để các ứng dụng không bị trùng lặp (ví dụ: một dịch vụ đổi địa chỉ dùng chung, không phải mỗi ứng dụng làm riêng) và được liên kết liền mạch qua các chức năng như workflow. Ảnh hưởng cả business lẫn infrastructure applications, liên quan chặt đến việc thống nhất/interoperability business process.
- **Technical Integration/Interoperability** — bao gồm các phương pháp và shared service chung cho communication, storage, processing, và access đến dữ liệu, chủ yếu ở domain application platform và communications infrastructure.

## Điểm cần nhớ

- Định nghĩa cốt lõi: interoperability = **"the ability to share information and services"**.
- Interoperability được xác định dần dần **xuyên suốt các phase ADM** (từ Vision → Business → Data → Application → Technology → Opportunities & Solutions → Migration Planning).
- Phân loại tổ chức: **Operational/Business, Information, Technical** interoperability.
- Phân loại kiểu IT/EAI: **Presentation, Information, Application, Technical** Integration/Interoperability.
- Cần dùng **một định nghĩa nhất quán** trên toàn enterprise và extended enterprise.

## Liên kết với khái niệm khác

- [../../02-adm/00-overview](../../02-adm/00-overview) — bảng liệt kê ở §3.9 map trực tiếp interoperability vào từng phase ADM (A→F).
- [../03-architecture-domains](../03-architecture-domains) — các loại interoperability (Information, Application, Technical) tương ứng với Data, Application, Technology domain.
- [../18-risk-management](../18-risk-management) — cân nhắc bảo mật (security considerations) của việc trao đổi thông tin/dịch vụ được nêu ngay từ Phase A, liên hệ đến quản trị rủi ro.

## Câu hỏi ôn tập

- Interoperability được định nghĩa như thế nào trong TOGAF, và vì sao định nghĩa cần nhất quán trên cả extended enterprise?
- Liệt kê 3 loại interoperability theo góc nhìn tổ chức và 4 loại theo góc nhìn kiểu EAI/IT — chúng khác nhau ở điểm nào?
- Interoperability được xác định ở phase nào của ADM đầu tiên, và được "hiện thực hóa" (implemented) ở phase nào?
