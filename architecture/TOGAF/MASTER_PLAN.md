# TOGAF Master Plan

Kế hoạch nắm vững TOGAF dựa trên nguồn tài liệu trong thư mục này:

- **[S]** = *The TOGAF Standard, 10th Edition — Introduction and Core Concepts.pdf* (nguồn chuẩn, The Open Group — bản tóm tắt; bản đầy đủ chính thức là `01-core-concepts/TOGAF-Standard-Part0-...pdf`)
- **[G]** = *The TOGAF Enterprise Architecture Foundation Study Guide (Van Haren).pdf* (ôn thi chứng chỉ Foundation Part 1)
- **6 tài liệu Fundamental Content đầy đủ** (Part0-5, evaluation copy chính thức từ Open Group) nay nằm ngay trong `01-core-concepts/`, `02-adm/`, `03-governance-content/` — dùng khi cần đào sâu hơn [S]/[G].
- **26 TOGAF Series Guide** (PDF thật) nằm trong từng subfolder của `05-series-guides/`.

> Nguyên tắc dùng tài liệu: **[S]/[G] để học tuần tự theo lộ trình dưới**, **PDF Part1-5 đầy đủ để tra cứu sâu khi [S]/[G] chưa đủ chi tiết** (ví dụ input/output từng bước ADM, chi tiết kỹ thuật).

---

## 1. Bức tranh tổng quan (nắm trong 5 phút)

- TOGAF = architecture framework của **The Open Group**, gốc từ TAFIM (US DoD, 1995).
- TOGAF 10 tách nội dung thành **6 tài liệu Fundamental Content** + **TOGAF Series Guides** (linh hoạt, cập nhật theo ngành). File **[S]** chỉ là bản tóm tắt của 1/6 phần đó ("Introduction and Core Concepts") — **cả 6 phần đầy đủ đã có sẵn** trong các folder chủ đề tương ứng, dùng khi [S]/[G] chưa đủ chi tiết.
- Xương sống của TOGAF là **ADM (Architecture Development Method)**: vòng lặp 9 pha, không phải waterfall.
- Các khối khái niệm còn lại (Enterprise Continuum, Repository, Content Framework, Governance...) đều là **hạ tầng hỗ trợ ADM chạy được trong thực tế** — học ADM trước, học phần còn lại sau sẽ dễ ráp nối hơn.

---

## 2. Bản đồ khái niệm cốt lõi

| Khối | Trả lời câu hỏi | Vị trí trong [S] |
|---|---|---|
| **ADM** | Làm kiến trúc theo quy trình nào? | §3.4 |
| **Deliverables / Artifacts / Building Blocks** | Sản phẩm đầu ra là gì? | §3.6 |
| **Architecture Abstraction** (Contextual→Conceptual→Logical→Physical) | Mức chi tiết nào đang mô tả? | §3.7 |
| **Architecture Principles** | Nguyên tắc nào chi phối quyết định? | §3.8 |
| **Enterprise Continuum** | Tài sản kiến trúc nằm ở đâu trên phổ generic→specific? | §3.10 |
| **Architecture Repository** | Tài sản kiến trúc lưu trữ ở đâu, gồm những gì? | §3.11 |
| **Content Framework & Enterprise Metamodel** | Phân loại artifact/thực thể theo khung nào? | §3.12 |
| **EA Capability & Governance** | Ai vận hành, ai kiểm soát tuân thủ? | §3.13–3.14 |
| **Views/Viewpoints** | Trình bày kiến trúc cho từng stakeholder ra sao? | §3.17 |
| **Enterprise Agility** | Làm ADM nhanh hơn bằng cách nào (partition/level)? | §3.18 |
| **Risk Management** | Quản lý rủi ro kiến trúc thế nào? | §3.19 |

---

## 3. ADM — 9 pha (thuộc lòng bảng này trước tiên)

| Pha | Mục tiêu chính |
|---|---|
| **Preliminary** | Thiết lập Architecture Capability, tùy biến framework, xác định Architecture Principles |
| **A — Architecture Vision** | Xác định phạm vi, stakeholder, tạo Vision, xin phê duyệt |
| **B — Business Architecture** | Kiến trúc nghiệp vụ hỗ trợ Vision |
| **C — Information Systems Architectures** | Data Architecture + Application Architecture |
| **D — Technology Architecture** | Kiến trúc công nghệ hỗ trợ Vision |
| **E — Opportunities & Solutions** | Xác định delivery vehicles, kế hoạch triển khai sơ bộ |
| **F — Migration Planning** | Implementation & Migration Plan chi tiết (Baseline → Target) |
| **G — Implementation Governance** | Giám sát kiến trúc trong quá trình triển khai |
| **H — Architecture Change Management** | Quản lý thay đổi kiến trúc sau triển khai |
| **Requirements Management** (tâm vòng tròn) | Quản lý yêu cầu xuyên suốt mọi pha |

---

## 4. Lộ trình học — 6 giai đoạn

### Giai đoạn 1 — Nền tảng
- [ ] Đọc **[S] Ch.1–2** (bối cảnh, cấu trúc bộ tài liệu TOGAF 10)
- [ ] Đọc **[G] Ch.1** (Introduction)

### Giai đoạn 2 — Core Concepts
- [ ] Đọc song song **[S] Ch.3** và **[G] Ch.2 "Concepts"** — [G] diễn giải lại §3.x của [S] dễ hiểu hơn, có ví dụ
- [ ] Đọc **[G] Ch.3 "Terminology"** để chốt thuật ngữ chuẩn
- [ ] Làm **Test Yourself** cuối mỗi chương [G] ngay sau khi đọc xong — không dồn lại

### Giai đoạn 3 — ADM (trọng tâm)
- [ ] Học Objectives/Approach từng pha qua **[G] Ch.4 "Introduction to the ADM"**
- [ ] Quay lại **[S] §3.4** để chốt bức tranh tổng thể + Figure 3-1
- [ ] Học kỹ thuật hỗ trợ ADM: **[G] Ch.5 "ADM Techniques"**
- [ ] Học cách tùy biến/áp dụng ADM: **[G] Ch.6 "Applying the ADM"**
- [ ] Làm Test Yourself từng chương

### Giai đoạn 4 — Governance & Content
- [ ] **[G] Ch.7 "Architecture Governance"** — Architecture Board, Contracts, Compliance, 4 tầng governance (Corporate/Technology/IT/Architecture)
- [ ] **[G] Ch.8 "Architecture Content"** — danh mục đầy đủ deliverable/artifact chuẩn (Vision, Definition Document, Roadmap, Requirements Spec, Statement of Architecture Work...)
- [ ] Đối chiếu lại §3.6, §3.11–3.12 của [S] để ráp khái niệm ↔ artifact thực tế

### Giai đoạn 5 — Tổng ôn & thi thử
- [ ] Rà lại **Appendix D [G]** (TOGAF EA Level 1 Syllabus) như checklist cuối — đảm bảo mọi Learning Unit đều đã học
- [ ] Làm **đề thi mô phỏng 40 câu (Appendix B [G])** trong điều kiện giống thi thật (giới hạn thời gian)
- [ ] Đối chiếu **Appendix C [G]** — hiểu rõ lý do đúng/sai từng câu, không chỉ chấm điểm
- [ ] Mốc đạt: **≥ 24/40 (60%)**; nếu chưa đạt, quay lại đúng chương liên quan tới câu sai (Appendix D map ngược Learning Unit)

### Giai đoạn 6 (tuỳ chọn, sau khi thi/nắm vững Foundation) — TOGAF Series Guides
- [ ] Tải và học các guide theo nhu cầu thực tế từ `05-series-guides/` — không nằm trong phạm vi thi
      Foundation, chỉ cần khi áp dụng TOGAF vào tình huống cụ thể (Business Architecture sâu, Security,
      Agile, Digital Transformation...). Xem [05-series-guides/README.md](05-series-guides/README.md)
      để biết nhóm nào ưu tiên theo nhu cầu công việc.

---

## 5. Cấu trúc thư mục ghi chú

Đã tạo sẵn folder tương ứng để ghi chú khi deep dive (xem [README.md](README.md) để điều hướng):

- `01-core-concepts/` — 18 subfolder (mỗi cái ứng với một §3.x của [S], trừ ADM) + PDF Part0 đầy đủ
- `02-adm/` — overview + 9 pha + Requirements Management + ADM Techniques + Applying the ADM + PDF Part1-3 đầy đủ
- `03-governance-content/` — Architecture Governance, Architecture Content/Deliverables + PDF Part4-5 đầy đủ
- `04-exam-prep/` — tổng quan chứng chỉ, Test Yourself, mock exam 40 câu, syllabus checklist, đăng ký thi Pearson VUE (kèm exam guide chính thức)
- `05-series-guides/` — 26 TOGAF Series Guide theo 7 nhóm, **mỗi guide đã có PDF gốc trong đúng folder** — học ở Giai đoạn 6
- `06-tool-certification/` — chương trình chứng nhận công cụ phần mềm (tham khảo, không thuộc lộ trình học cá nhân)

Mỗi subfolder có `README.md` khung sẵn (tham chiếu section/PDF nguồn + mục Ghi chú/Câu hỏi/Liên kết) — điền trực tiếp vào đó theo đúng thứ tự Giai đoạn 1→6 ở trên.

## 6. Lưu ý khi học

- **[S]/[G] để học tuần tự** — khi cần đào sâu chi tiết hơn (input/output từng bước ADM, kỹ thuật cụ thể, đầy đủ governance), tra PDF Part1-5 đầy đủ nằm ngay trong `02-adm/` và `03-governance-content/` thay vì tìm ở nơi khác.
- Phần dễ nhầm lẫn nhất: **Enterprise Continuum vs Architecture Repository vs Content Framework/Metamodel** — cả ba đều nói về "tổ chức tài sản kiến trúc" nhưng ở góc nhìn khác nhau (phổ trừu tượng / nơi lưu trữ / khung phân loại). Học kỹ §3.10–3.12 [S] cùng lúc, đối chiếu Figure 3-4 → 3-9.
- Phần trực quan, học nhanh: **ADM 9 pha** — nhờ sơ đồ vòng tròn lặp lại xuyên suốt cả hai tài liệu.
