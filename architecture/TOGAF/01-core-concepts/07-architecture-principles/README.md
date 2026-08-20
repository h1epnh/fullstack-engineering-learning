# Khái niệm: Architecture Principles

**Tham chiếu:** [S] §3.8

## Nội dung chính

**Principles (nguyên tắc)** là các quy tắc và hướng dẫn tổng quát, được thiết kế để **tồn tại lâu dài (enduring) và hiếm khi bị sửa đổi (seldom amended)**, giúp định hướng và hỗ trợ cách một tổ chức thực hiện sứ mệnh của mình.

TOGAF phân biệt **2 domain chính** chi phối việc phát triển và sử dụng kiến trúc:

- **Enterprise Principles** — cung cấp cơ sở ra quyết định (basis for decision-making) xuyên suốt toàn enterprise, định hướng cách tổ chức thực hiện sứ mệnh của mình. Đây là công cụ hài hòa hóa việc ra quyết định trên toàn tổ chức, và là yếu tố then chốt trong chiến lược **Architecture Governance**. Trong phạm vi rộng của Enterprise Principles, thường tồn tại các **subsidiary principles** (nguyên tắc cấp dưới) riêng cho từng đơn vị kinh doanh/tổ chức — ví dụ nguyên tắc riêng cho IT, HR, domestic operations, overseas operations. Các subsidiary principles này cung cấp cơ sở ra quyết định trong phạm vi domain con của mình và định hướng phát triển kiến trúc trong domain đó. Điều quan trọng là phải đảm bảo các principle dùng để định hướng phát triển kiến trúc luôn **align (khớp)** với bối cảnh tổ chức của Architecture Capability.
- **Architecture Principles** — tập hợp các nguyên tắc liên quan riêng đến công việc kiến trúc (architecture work). Chúng phản ánh mức độ đồng thuận (consensus) trên toàn enterprise và thể hiện tinh thần, tư duy của các Enterprise Principles hiện có. Architecture Principles **chi phối (govern)** toàn bộ quy trình kiến trúc, ảnh hưởng đến việc phát triển, bảo trì, và sử dụng Enterprise Architecture.

**Cấu trúc phân cấp (hierarchy):** trong một enterprise, hệ thống phân cấp principle bắt đầu từ Enterprise Principles (bao trùm nhất). Các subsidiary segment principles phải tồn tại **trong phạm vi (within the bounds)** của các Enterprise Principles này. Do đó, ở mỗi cấp phân cấp, tập principle sẽ được định hướng bởi và mở rộng thêm từ các principle kế thừa từ cấp trên, và **không được vượt quá ranh giới (cannot overstep their boundaries)** của cấp trên.

Các điểm bổ sung quan trọng:

- Architecture Principles có thể **diễn giải lại (restate)** các hướng dẫn khác của enterprise theo ngôn ngữ/hình thức hướng dẫn hiệu quả cho phát triển kiến trúc.
- Architecture Principles định nghĩa các quy tắc chung nền tảng cho việc sử dụng và triển khai mọi resource/asset trên toàn enterprise; chúng phản ánh mức đồng thuận giữa các thành phần của enterprise và là cơ sở cho các quyết định kiến trúc trong tương lai.
- Mỗi Architecture Principle phải được liên hệ rõ ràng (clearly related back) tới business objectives và các architecture driver chính — nguyên tắc không được tồn tại tách rời khỏi mục tiêu kinh doanh.

## Điểm cần nhớ

- Principles = general rules & guidelines, **enduring, seldom amended**.
- 2 domain: **Enterprise Principles** (toàn tổ chức, cơ sở governance) và **Architecture Principles** (riêng cho công việc kiến trúc, phản ánh tinh thần Enterprise Principles).
- Phân cấp: subsidiary principles luôn nằm **trong phạm vi** của Enterprise Principles cấp trên — không được vượt biên giới đó.
- Mỗi Architecture Principle phải liên hệ rõ ràng với business objectives và key architecture drivers.

## Liên kết với khái niệm khác

- [../11-content-framework-and-metamodel](../11-content-framework-and-metamodel) — Architecture Principles là một phần của nhóm "Architecture Principles, Vision, Motivation, and Requirements" trong Content Framework (Figure 3-6).
- [../../03-governance-content/01-architecture-governance](../../03-governance-content/01-architecture-governance) — Enterprise Principles là "a key element in a successful Architecture Governance strategy".
- [../../02-adm/01-preliminary](../../02-adm/01-preliminary) — việc định nghĩa Architecture Principles diễn ra trong Preliminary Phase, khi customize TOGAF framework cho tổ chức.

## Câu hỏi ôn tập

- Phân biệt Enterprise Principles và Architecture Principles — mối quan hệ giữa hai loại này là gì?
- Vì sao subsidiary principles không được "vượt qua ranh giới" của Enterprise Principles cấp trên?
- Vì sao mỗi Architecture Principle cần được liên hệ rõ ràng với business objectives?
