# Khái niệm: Architecture Views and Viewpoints

**Tham chiếu:** [S] §3.17

## Nội dung chính

Khả năng tạo ra các **"view" (góc nhìn) cụ thể** của một phần trong kiến trúc phức tạp là yếu tố nền tảng để có thể giao tiếp với, và xoa dịu mối quan tâm (allay concerns) của, các stakeholder hoặc nhóm stakeholder. Để đạt được sự hiểu biết và ủng hộ đầy đủ từ stakeholder, cần trình bày thông tin theo hình thức mà **mỗi stakeholder có thể liên hệ và hiểu được**.

**Figure 3-10 (Basic Architectural Concepts)** — được điều chỉnh (adapted) từ các định nghĩa chính thức hơn trong **ISO/IEC/IEEE 42010:2011** và **ISO/IEC/IEEE 15288:2015** — mô tả mối quan hệ giữa các khái niệm kiến trúc nền tảng:

- **System-of-Interest** *exhibits* → **Architecture**, và Architecture *expresses* → **Architecture Description**.
- System-of-Interest *has interests in* → **Stakeholder**; Architecture Description *identifies* → Stakeholder.
- Stakeholder *has* → **Concern**; Architecture Description cũng *identifies* → Concern.
- Concern *frames* → **Architecture Viewpoint**; Architecture Viewpoint *governs* → **Architecture View**.
- Architecture Description *identifies* → Architecture View; Architecture View *addresses* → Concern (vòng khép kín: concern sinh ra viewpoint, viewpoint chi phối view, view lại giải quyết đúng concern ban đầu).
- Architecture Viewpoint *governs* → **Model Kind**; Model Kind *governs* → **Architecture Model**; Architecture View liên kết (composed of) với Architecture Model.

Nói ngắn gọn theo chuỗi quan hệ chính:

1. Một **System-of-Interest** (hệ thống đang được xem xét) thể hiện (exhibits) một **Architecture**.
2. Architecture đó được diễn đạt (expressed) bằng một **Architecture Description**.
3. Architecture Description xác định các **Stakeholder** có mối quan tâm (interests) đến System-of-Interest, và các **Concern** mà mỗi stakeholder có.
4. Mỗi Concern **định khung (frames)** cho một **Architecture Viewpoint**.
5. Architecture Viewpoint **chi phối (governs)** một **Architecture View** — view này là thứ thực sự **giải quyết (addresses)** concern ban đầu của stakeholder.
6. Architecture Viewpoint cũng chi phối **Model Kind**, và Model Kind chi phối **Architecture Model** — tức là viewpoint quy định "loại mô hình" nào được dùng để xây dựng view.

Nói cách khác: **Viewpoint** là "công thức"/quy ước xác định cách xây dựng một view (dành cho một loại concern/stakeholder cụ thể); **View** là kết quả cụ thể áp dụng viewpoint đó lên một hệ thống thực tế, nhằm giải quyết đúng concern của stakeholder tương ứng.

## Điểm cần nhớ

- View và Viewpoint là công cụ để giao tiếp kiến trúc phù hợp với **từng nhóm stakeholder** và **concern** của họ.
- Figure 3-10 dựa trên **ISO/IEC/IEEE 42010:2011** và **ISO/IEC/IEEE 15288:2015** — không phải TOGAF tự sáng tác từ đầu.
- Chuỗi quan hệ cốt lõi: Stakeholder → có Concern → Concern frame ra Viewpoint → Viewpoint govern View → View address (giải quyết) lại Concern.
- Viewpoint còn chi phối "Model Kind" (loại mô hình), từ đó chi phối Architecture Model cụ thể.
- Một Architecture Description có thể identify nhiều Stakeholder, Concern, và View khác nhau cho cùng một kiến trúc.

## Liên kết với khái niệm khác

- [../02-what-is-architecture](../02-what-is-architecture) — Figure 3-10 mở rộng trực tiếp định nghĩa "architecture" theo ISO/IEC/IEEE 42010:2011 đã giới thiệu ở §3.2.
- [../15-using-togaf-with-different-architecture-styles](../15-using-togaf-with-different-architecture-styles) — việc "điều chỉnh model, viewpoint, tool" theo architectural style (§3.16) chính là vận dụng khái niệm Viewpoint/Model Kind ở đây.
- [../../02-adm/03-phase-b-business-architecture](../../02-adm/03-phase-b-business-architecture) — Phase B/C/D là nơi practitioner thực sự chọn và áp dụng các viewpoint/view cụ thể cho từng domain.

## Câu hỏi ôn tập

- Mô tả chuỗi quan hệ từ Stakeholder → Concern → Viewpoint → View trong Figure 3-10.
- Phân biệt Architecture Viewpoint và Architecture View — cái nào là "công thức" và cái nào là "kết quả cụ thể"?
- Figure 3-10 được điều chỉnh (adapted) từ những chuẩn ISO nào?
