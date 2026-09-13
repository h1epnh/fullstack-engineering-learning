# Khái niệm: Enterprise Architecture Services

**Tham chiếu:** [S] §3.5

## Nội dung chính

Các hoạt động mô tả trong ADM thường được cung cấp qua một **mô hình phân phối dịch vụ (service delivery model)**. Các dịch vụ này được tổ chức thành các **service categories**, mỗi category giải quyết một nhu cầu cụ thể, độc lập với mô hình vận hành riêng của từng tổ chức. Mỗi service khi thực hiện sẽ sử dụng các hoạt động phù hợp trong ADM để đáp ứng nhu cầu đó.

**Table 3-1 (Service Categories and Descriptors)** chia các category thành 2 nhóm lớn:

**Nhóm Customer-centric** (hướng tới khách hàng bên trong tổ chức là các cấp quản lý/dự án):

- **Enterprise Support Services** — khách hàng: C-level management; cho phép ra quyết định enterprise sáng suốt, độc lập với từng dự án cụ thể; deliverable: câu trả lời cho câu hỏi, assessment reports, recommendations.
- **Design Support Services** — khách hàng: program-level decision-makers; cung cấp sau khi dự án đã được cấp vốn; deliverable trọng tâm: **Minimum Viable Architectures (MVAs)** kèm tiêu chí tuân thủ, roadmap, compliance guidance/reports.
- **Development Support Services** — khách hàng: project-level decision-makers; cung cấp trong giai đoạn phát triển dự án; tương tự Design Support nhưng ở mức project/product.
- **Requirements Elicitation and Understanding Services** — khách hàng: product managers; đi xa hơn requirements management thông thường, giúp hiểu rõ nhu cầu thực sự để tạo giá trị kinh doanh lớn hơn.

**Nhóm Internal-centric** (hướng nội, phục vụ chính đội ngũ kiến trúc sư):

- **Architecture Planning Services** — hỗ trợ các dự án kiến trúc được lên kế hoạch và thực thi tốt, thường ở giai đoạn khởi đầu dự án.
- **Enterprise Architecture Practice Development Support Services** — hỗ trợ xây dựng và quản lý bản thân "thực hành EA" (EA practice), tập trung cải thiện EA Capability.

## Điểm cần nhớ

- EA Services được tổ chức thành **service categories**, không phải hoạt động rời rạc — mỗi category có typical customer, typical provider, deliverable(s), và desired result riêng (xem Table 3-1).
- 4 category đầu là **customer-centric** (Enterprise Support, Design Support, Development Support, Requirements Elicitation); phần còn lại là **internal-centric** (Architecture Planning, EA Practice Development Support).
- Khái niệm **Minimum Viable Architecture (MVA)** xuất hiện ở cả Design Support và Development Support Services — là bộ kiến trúc tối thiểu đủ để ra quyết định.
- Các service này hoạt động độc lập với việc dự án theo waterfall hay agile.

## Liên kết với khái niệm khác

- [../../02-adm/00-overview](../../02-adm/00-overview) — mỗi service category dùng "appropriate activities in the ADM" để thực hiện, tức là service delivery model là lớp bọc ngoài, ADM là cơ chế thực thi bên trong.
- [../05-deliverables-artifacts-building-blocks](../05-deliverables-artifacts-building-blocks) — deliverable của mỗi service category (assessment reports, MVAs, compliance reports...) là các artifact/deliverable cụ thể được định nghĩa chi tiết ở §3.6.
- [../12-establishing-maintaining-ea-capability](../12-establishing-maintaining-ea-capability) — Enterprise Architecture Practice Development Support Services chính là dịch vụ nhằm xây dựng EA Capability được mô tả sâu hơn ở §3.13.

## Câu hỏi ôn tập

- Phân biệt nhóm dịch vụ "customer-centric" và "internal-centric" trong EA Services — nêu ví dụ mỗi nhóm.
- Minimum Viable Architecture (MVA) xuất hiện ở những service category nào và có vai trò gì?
- Vì sao EA Services được mô tả là "độc lập với operation model cụ thể của tổ chức"?
