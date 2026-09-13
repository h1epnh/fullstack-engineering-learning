# ADM: Applying the ADM (tùy biến theo style/agile/iteration)

**Tham chiếu:** [G] Ch.6

## Nội dung chính

**1. Nơi tìm hướng dẫn áp dụng:** hướng dẫn chi tiết về cách áp dụng TOGAF Standard nằm trong **TOGAF Series Guides** — phần "Guidance" của TOGAF Standard, bổ sung cho TOGAF Fundamental Content (gồm Introduction and Core Concepts, ADM, ADM Techniques, Applying the ADM, Architecture Content, EA Capability and Governance). Series Guides bao phủ các chủ đề như Business Architecture, Information Architecture, Security Architecture, EA/Agile Architecture, EA/Digital Enterprise, Technology Architecture, MSA/SOA Architectures, Adapting the ADM... Không phải Series Guide nào cũng liên quan trong mọi tình huống — kiến trúc sư cần biết chúng tồn tại và chọn dùng khi phù hợp.

**2. Iteration (lặp) trong ADM — 3 kiểu:**
   - **Iteration để mô tả một Architecture Landscape toàn diện** qua nhiều chu trình ADM, mỗi chu trình gắn với một sáng kiến (initiative) trong phạm vi một Request for Architecture Work riêng.
   - **Iteration để mô tả quy trình tích hợp phát triển kiến trúc**, nơi hoạt động ở các phase khác nhau tương tác lẫn nhau để tạo ra một kiến trúc thống nhất — dự án có thể vận hành nhiều phase ADM **đồng thời** (thường dùng để quản lý mối liên hệ giữa Business, Information Systems, và Technology Architecture).
   - **Iteration để mô tả quy trình quản lý thay đổi** đối với Architecture Capability của tổ chức.
   - Hai pattern lặp cụ thể (Figure 12): (a) dự án lặp qua nhiều phase theo chu kỳ đã lên kế hoạch, dùng để hội tụ (converge) vào một Target Architecture chi tiết khi kiến trúc cấp cao hơn chưa cung cấp đủ bối cảnh/ràng buộc; (b) dự án cập nhật lại các work product với thông tin mới, dùng để hội tụ vào một Architecture Roadmap hoặc Implementation and Migration Plan khả thi khi chi tiết triển khai làm thay đổi/ưu tiên lại yêu cầu stakeholder.

**3. Architecture Landscape — 3 mức (levels):** khái niệm dùng để tổ chức toàn bộ tập hợp mô tả kiến trúc của enterprise theo 3 đặc tính khung: Breadth (phạm vi chủ đề), Level of Detail (mức chi tiết), Time (điểm thời gian hướng tới target). Ba mức granularity:
   - **Strategic Architecture** (còn gọi Enterprise Strategic Architecture) — khung tổ chức cho hoạt động vận hành/thay đổi ở cấp điều hành (executive level).
   - **Segment Architecture** — khung tổ chức cho hoạt động và Architecture Roadmap ở cấp chương trình/danh mục (program/portfolio level).
   - **Capability Architecture** — khung tổ chức và Architecture Roadmap để hiện thực hóa từng gia tăng năng lực (capability increment).

**4. Partitioning (phân vùng):** TOGAF định nghĩa Architecture Partition là "một tập con của kiến trúc, sinh ra từ việc chia nhỏ kiến trúc đó để hỗ trợ phát triển và quản lý". Partition dùng để đơn giản hóa việc phát triển/quản lý EA, là nền tảng của Architecture Governance, và **khác biệt** với khái niệm levels và Enterprise Continuum. Không có một mô hình partition chuẩn duy nhất — mỗi enterprise cần mô hình phù hợp với operating model của mình. Lý do cần partition: các kiến trúc của các đơn vị tổ chức có thể xung đột nhau; nhiều đội cần làm việc song song trên các phần khác nhau (partition cho phép nhóm kiến trúc sư sở hữu/phát triển phần riêng); tái sử dụng kiến trúc hiệu quả đòi hỏi các segment kiến trúc dạng module có thể lắp ghép vào kiến trúc/giải pháp lớn hơn.

**5. Bốn mục đích của Architecture (Purposes of Architecture)** — dùng để định khung planning horizon, breadth, và depth của một Architecture Project:
   - **Support Strategy** — cung cấp Target Architecture end-to-end và roadmap thay đổi trong khoảng 3–10 năm, thường trải rộng nhiều chương trình/danh mục.
   - **Support Portfolio** — hỗ trợ sáng kiến thay đổi đa dự án, đa phase, xuyên chức năng; thường trải rộng một danh mục (portfolio).
   - **Support Project** — hỗ trợ phương pháp triển khai dự án (delivery method) của enterprise; thường trải rộng một dự án đơn lẻ.
   - **Support Solution Delivery** — hỗ trợ việc triển khai giải pháp; thường là một dự án hoặc một phần đáng kể của dự án, đóng vai trò khung governance cho thay đổi.

**6. The Digital Enterprise:** EA hỗ trợ môi trường Agile trong việc phát triển/nâng cấp sản phẩm số nhanh và dễ hơn, thông qua: quản lý technical debt phản ứng (reactive) một cách gắn kết sau mỗi sprint; quản lý technical debt chủ động (proactive) bằng cách nhận diện standard/component tái sử dụng được và thiết lập governance/guardrail phù hợp cho việc tái sử dụng; và quản lý các sản phẩm số trưởng thành để đạt operational excellence — bằng cách đơn giản hóa độ phức tạp của hệ sinh thái số qua ADM và thiết lập EA Capability thúc đẩy operational excellence.

## Điểm cần nhớ

- Applying the ADM chủ yếu nói về "tùy biến vận hành" ADM: iteration, Architecture Landscape (3 level), partitioning, và 4 purpose để định khung dự án — không phải nội dung mới của từng phase.
- 3 level của Architecture Landscape (Strategic/Segment/Capability) khác biệt rõ với 4 purpose (Strategy/Portfolio/Project/Solution Delivery) — level nói về "kiến trúc đang mô tả cái gì, ở độ chi tiết nào", còn purpose nói về "kiến trúc được dùng để phục vụ mục đích quản trị nào".
- Partitioning khác Levels và khác Enterprise Continuum — partition là công cụ chia nhỏ để quản lý/governance, không phải phân loại theo mức độ trừu tượng.
- Iteration có 3 dạng mục đích (Landscape-wide, tích hợp phát triển kiến trúc, quản lý thay đổi Capability) và 2 pattern cụ thể minh họa cách áp dụng.
- Trong bối cảnh Digital Enterprise, ADM và EA Capability được dùng để cân bằng giữa tốc độ Agile và kiểm soát technical debt/guardrail.

## Liên kết với khái niệm khác

- `../00-overview/` — nội dung ở đây mở rộng trực tiếp phần "iteration" đã giới thiệu sơ lược trong overview.
- `../../01-core-concepts/09-enterprise-continuum/` — cần phân biệt rõ Enterprise Continuum với khái niệm partitioning và levels được nói ở đây.
- `../../01-core-concepts/17-enterprise-agility/` — mở rộng chủ đề Digital Enterprise/Agile đã nêu ở mục 6.

## Câu hỏi ôn tập

- Phân biệt 3 level của Architecture Landscape (Strategic/Segment/Capability) với 4 purpose của Architecture (Strategy/Portfolio/Project/Solution Delivery).
- Vì sao TOGAF nói không có một mô hình partitioning chuẩn duy nhất áp dụng cho mọi enterprise?
- Nêu 3 kiểu mục đích của iteration trong ADM và cho ví dụ minh họa mỗi kiểu.
