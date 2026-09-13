# Khái niệm: Using TOGAF with Different Architecture Styles

**Tham chiếu:** [S] §3.16

## Nội dung chính

TOGAF được thiết kế để **linh hoạt (flexible)** và có thể dùng với nhiều **kiến trúc style (architectural styles)** khác nhau. Các style kiến trúc khác nhau ở nhiều chiều: **focus, form, techniques, materials, subject, và time period**. Vì TOGAF là generic framework, được thiết kế để dùng trong nhiều môi trường, nó là một khung linh hoạt và mở rộng được, có thể dễ dàng thích ứng với nhiều architectural style.

Architecture Landscape của một tổ chức thường chứa các công việc kiến trúc được phát triển theo **nhiều style khác nhau cùng lúc**. TOGAF đảm bảo nhu cầu của mỗi stakeholder được xử lý phù hợp trong bối cảnh của các stakeholder khác và Baseline Architecture.

**Quy trình 2 bước** khi dùng TOGAF để hỗ trợ một style kiến trúc cụ thể:

1. **Xác định các đặc điểm khác biệt (distinctive features)** của style đó — bước đầu tiên bắt buộc.
2. **Xác định cách xử lý** các đặc điểm khác biệt này — việc xử lý một style riêng biệt **không nên** đòi hỏi thay đổi đáng kể (significant changes) đối với TOGAF framework; thay vào đó nên **điều chỉnh (adjust)** các model, viewpoint, và tool mà practitioner sử dụng.

Trong **Phase B, Phase C, và Phase D**, practitioner được kỳ vọng sẽ lựa chọn các tài nguyên kiến trúc liên quan (model, viewpoint, tool) để mô tả đúng architecture domain và chứng minh rằng các mối quan tâm (concern) của stakeholder đã được giải quyết (xem TOGAF Standard — ADM Techniques). Tùy theo đặc điểm khác biệt của style, các architectural style khác nhau sẽ: thêm yếu tố mới cần mô tả, làm nổi bật yếu tố hiện có, điều chỉnh notation mô tả kiến trúc, và tập trung kiến trúc sư vào một số stakeholder/concern nhất định.

Việc xử lý các đặc điểm khác biệt thường bao gồm: mở rộng (extensions) Architecture Content Metamodel, sử dụng notation/kỹ thuật mô hình hóa cụ thể, và xác định các viewpoint. Nếu một architectural style chiếm ưu thế, có thể cần practitioner quay lại **Preliminary Phase** để thay đổi Architecture Capability, hoặc để xử lý một đặc điểm khác biệt trong phạm vi dự kiến của một chu kỳ ADM đơn lẻ.

**Reference model và maturity model đặc thù cho từng style** là các công cụ thường dùng để hỗ trợ practitioner.

Trong suốt vòng đời của TOGAF framework, nhiều architectural style đã được phát triển để giải quyết các vấn đề then chốt mà practitioner gặp phải, và để chứng minh cách TOGAF framework có thể được làm cho phù hợp hơn trong các bối cảnh cụ thể. Một số được phát triển bởi The Open Group Forums/Work Groups và công bố trong Guides, White Papers, Standards. Ví dụ được liệt kê:

- TOGAF® Series Guide: *Using the TOGAF® Framework to Define and Govern Service-Oriented Architectures*
- TOGAF® Series Guide: *Integrating Risk and Security within a TOGAF® Enterprise Architecture*

Một số được phát triển hợp tác giữa The Open Group và các tổ chức khác:

- *TOGAF® and SABSA® Integration*
- *Archi Banking Group: Combining the BIAN Reference Model, ArchiMate® Modeling Notation, and the TOGAF® Framework*
- *Exploring Synergies between TOGAF® and Frameworx*
- *TOGAF® 9 and DoDAF 2.0*

**TOGAF Library** (www.opengroup.org/togaf-library) là thư viện tài nguyên có cấu trúc hỗ trợ TOGAF Standard, nơi tập hợp các guide/reference material theo style nói trên.

## Điểm cần nhớ

- Architectural style khác nhau theo 6 chiều: **focus, form, techniques, materials, subject, time period**.
- Quy trình 2 bước khi áp dụng TOGAF cho một style: **(1) xác định distinctive features → (2) điều chỉnh model/viewpoint/tool** (không đổi core framework).
- Việc chọn resource (model, viewpoint, tool) diễn ra chủ yếu ở **Phase B, C, D**.
- Nếu style chiếm ưu thế mạnh, có thể cần quay lại **Preliminary Phase** để điều chỉnh Architecture Capability.
- TOGAF Library chứa các Series Guide thể hiện style cụ thể (SOA, Risk & Security, SABSA, DoDAF...).

## Liên kết với khái niệm khác

- [../14-using-togaf-with-other-frameworks](../14-using-togaf-with-other-frameworks) — cùng chủ đề tailor TOGAF, nhưng §3.15 nói về kết hợp framework khác còn §3.16 nói về architectural style.
- [../16-architecture-views-and-viewpoints](../16-architecture-views-and-viewpoints) — việc "điều chỉnh model, viewpoint, và tool" theo style chính là ứng dụng trực tiếp khái niệm Architecture View/Viewpoint ở §3.17.
- [../../02-adm/01-preliminary](../../02-adm/01-preliminary) — trường hợp style chiếm ưu thế đòi hỏi quay lại Preliminary Phase để điều chỉnh Architecture Capability.

## Câu hỏi ôn tập

- Nêu quy trình 2 bước khi dùng TOGAF để hỗ trợ một architectural style cụ thể.
- Việc xử lý một architectural style riêng biệt có nên đòi hỏi thay đổi lớn với TOGAF framework không? Thay vào đó nên làm gì?
- Ở những phase ADM nào practitioner chọn các resource kiến trúc (model, viewpoint, tool) phù hợp với style, và khi nào cần quay lại Preliminary Phase?
