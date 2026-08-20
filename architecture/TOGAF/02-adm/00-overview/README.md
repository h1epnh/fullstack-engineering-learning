# ADM: Overview & Architecture Development Cycle

**Tham chiếu:** [S] §3.4 (Figure 3-1) / [G] Ch.4

## Nội dung chính

**ADM là gì:** Architecture Development Method (ADM) là phần lõi của TOGAF — một quy trình đã được kiểm chứng, lặp lại được, dùng để phát triển Enterprise Architecture theo yêu cầu cụ thể của tổ chức. ADM bao gồm việc thiết lập một architecture framework, phát triển nội dung kiến trúc, chuyển giao (transition), và quản trị việc hiện thực hóa kiến trúc.

**Chu trình ADM (Figure 3-1 / Figure 7):** ADM được minh họa dưới dạng một vòng tròn gồm 8 phase chính (A→H) bao quanh **Requirements Management** ở tâm, và **Preliminary Phase** ở đỉnh (chạy trước khi vào vòng lặp chính):

- Preliminary
- A. Architecture Vision
- B. Business Architecture
- C. Information Systems Architectures (Data + Application)
- D. Technology Architecture
- E. Opportunities & Solutions
- F. Migration Planning
- G. Implementation Governance
- H. Architecture Change Management
- Requirements Management (ở tâm, tương tác hai chiều với tất cả các phase khác)

**Không phải waterfall:** Đồ họa ADM (vòng tròn với các mũi tên hai chiều) chỉ là một biểu diễn cách điệu (stylized) của luồng thông tin thiết yếu giữa các phase, **không phải** một trình tự hoạt động (activity sequence) hay một process model tuyến tính. Đây là điểm hay bị hiểu lầm nhất: ADM thường bị đọc sai thành quy trình waterfall tuần tự A→B→C…→H, nhưng thực chất các phase tương tác lẫn nhau liên tục.

**Tính lặp (iteration):** ADM có tính lặp ở ba cấp độ: xuyên suốt toàn bộ chu trình (giữa các chu kỳ ADM), giữa các phase, và trong nội bộ một phase. Với mỗi vòng lặp, kiến trúc sư phải quyết định lại: phạm vi bao phủ doanh nghiệp (breadth), mức độ chi tiết (depth), khoảng thời gian hướng tới, và tài sản kiến trúc (architectural assets) nào sẽ được tận dụng lại. Việc phát triển Target Architecture mang tính liên đới (inter-dependent): khi một nhóm làm việc trên một phase (ví dụ Phase E), họ vẫn phải cân nhắc tác động lên toàn bộ kiến trúc, các gap phát sinh, và công việc cần thiết để lấp gap đó — vì vậy trên thực tế nhiều phase thường chạy song song (xem Gantt chart minh họa "Iteration via Information Flow").

**Draft vs Approved deliverable:** tài liệu đang phát triển, chưa qua rà soát/phê duyệt chính thức gọi là "draft"; tài liệu đã được rà soát và phê duyệt theo quy trình governance của tổ chức gọi là "approved" (approved không nhất thiết là "final" — vẫn có thể tiến hóa qua change control).

**Scoping (định phạm vi):** trước khi bắt đầu, cần giới hạn phạm vi hoạt động kiến trúc theo 4 chiều: **Breadth** (toàn bộ enterprise hay một phần?), **Depth** (mức độ chi tiết cần đạt?), **Time Period** (kiến trúc hướng tới mốc thời gian nào?), **Architecture Domains** (Business/Data/Application/Technology — kiến trúc đầy đủ cần cả 4 domain).

**Trade-off giữa các phương án:** vì thường có nhiều Target Architecture khả dĩ cùng thỏa Vision/Principles/Requirements, TOGAF khuyến nghị kỹ thuật đánh giá phương án (Figure 9: Vision + Principles + Requirements → các Alternative theo từng Criteria → Select) để trình bày trade-off cho stakeholder, giúp lộ ra các mối quan tâm/yêu cầu ẩn.

**Governance xuyên suốt ADM:** dù được tổ chức tùy biến hay dùng nguyên bản, ADM phải được quản lý như một tài sản kiến trúc khác (lưu trong Architecture Repository, phân loại qua Enterprise Continuum). Hai khái niệm chính để governance Target Architecture: **Architecture Project** (khởi đầu bằng Request for Architecture Work, kiểm soát qua Statement of Architecture Work) và, để governance các Implementation Project, **Architecture Contract** + **Architecture Requirements Specification**.

## Điểm cần nhớ

- ADM có 1 Preliminary Phase + 8 phase A–H xoay quanh Requirements Management ở trung tâm — Requirements Management chạy liên tục, không phải một bước rời rạc.
- Đồ họa vòng tròn ADM biểu diễn luồng thông tin, KHÔNG phải trình tự waterfall — nhiều phase chạy song song trong thực tế (concurrent execution).
- Tính lặp diễn ra ở 3 cấp: toàn chu trình, giữa các phase, trong một phase; mỗi lần lặp phải re-quyết định breadth/depth/time/assets.
- Scoping một kiến trúc dựa trên 4 chiều: Breadth, Depth, Time Period, Architecture Domains.
- Draft ≠ Approved: approved nghĩa là đã qua governance, không có nghĩa là bất biến/final.
- Architecture Project (qua Statement of Architecture Work) governance việc phát triển kiến trúc; Architecture Contract governance việc triển khai (implementation).

## Liên kết với khái niệm khác

- `../11-adm-techniques/` — kỹ thuật hỗ trợ trực tiếp cho scoping và trade-off (Architecture Principles, Gap Analysis) được dùng xuyên suốt các phase của ADM.
- `../12-applying-the-adm/` — đi sâu vào cách tùy biến chu trình ADM này (iteration patterns, Architecture Landscape, partitioning).
- `../../01-core-concepts/09-enterprise-continuum/` — nơi phân loại/lưu trữ các deliverable draft/approved sinh ra từ ADM.

## Câu hỏi ôn tập

- Tại sao nói đồ họa ADM không phải là một process model hay activity sequence?
- Kể tên 4 chiều dùng để scoping một kiến trúc và giải thích ý nghĩa từng chiều.
- Trong một vòng lặp ADM, kiến trúc sư cần quyết định lại những gì?
