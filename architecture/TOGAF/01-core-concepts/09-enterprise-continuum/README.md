# Khái niệm: Enterprise Continuum

**Tham chiếu:** [S] §3.10

## Nội dung chính

**Enterprise Continuum** thiết lập bối cảnh rộng hơn (broader context) cho kiến trúc sư và các bên liên quan, giải thích cách các **giải pháp tổng quát (generic solutions)** có thể được tận dụng và chuyên biệt hóa (specialized) để đáp ứng yêu cầu của một tổ chức cụ thể.

Định nghĩa cốt lõi: Enterprise Continuum là một **cách phân loại (categorization)** cho các tài sản (assets) được lưu trong Enterprise Repositories, cung cấp phương pháp phân loại tài sản — bao gồm architecture và solution artifact — khi chúng **tiến hóa từ Foundation Architecture tổng quát đến Organization-Specific Architecture** cụ thể.

Enterprise Continuum bao gồm **2 khái niệm bổ trợ nhau (complementary concepts)**:

- **Architecture Continuum** — phổ (continuum) của các tài sản kiến trúc, từ **Generic Architectures** (tổng quát) đến **Specific Architectures** (chuyên biệt).
- **Solutions Continuum** — phổ tương ứng của các tài sản giải pháp, từ **Generic Solutions** đến **Specific Solutions**.

**Figure 3-4** minh họa cấu trúc: Enterprise Repositories (bao gồm Requirements Repository, Architecture Repository, Design Stores, CMDB) cung cấp resource được phân loại theo Enterprise Continuum. Bên trong Enterprise Continuum:

- **Architecture Context and Requirements** nhận yếu tố bên ngoài (external factors) làm bối cảnh, và các yếu tố ngữ cảnh này định hình (shape) kiến trúc.
- **Architecture Continuum**: hai chiều mũi tên — "Generalization for future re-use" (đi từ Specific về Generic) và "Adaptation for use" (đi từ Generic sang Specific Architectures).
- **Solutions Continuum**: tương tự, với Generic Solutions ↔ Specific Solutions, liên kết "guides and supports" hai chiều với Architecture Continuum ngay phía trên.
- **Deployed Solutions**: solutions được instantiate (hiện thực hóa cụ thể) trong một triển khai thực tế; các deployed solution sau đó lại trở thành **Architecture Context** mới (vòng phản hồi khép kín).

Nói ngắn gọn: Enterprise Continuum mô tả **trục sinh chuyển đổi hai chiều** — generalize (rút tài sản cụ thể thành mẫu tổng quát để tái dùng sau) và adapt (điều chỉnh mẫu tổng quát cho nhu cầu cụ thể) — áp dụng song song cho cả trục Architecture (mô hình/kiến trúc) và trục Solutions (giải pháp/hiện thực hóa).

## Điểm cần nhớ

- Enterprise Continuum = **categorization scheme** cho tài sản trong Enterprise Repositories, từ Foundation → Organization-Specific.
- 2 continuum bổ trợ: **Architecture Continuum** (Generic ↔ Specific Architectures) và **Solutions Continuum** (Generic ↔ Specific Solutions).
- Hai lực vận hành ngược chiều: **Generalization for future re-use** vs **Adaptation for use**.
- Vòng khép kín: Deployed Solutions → trở thành Architecture Context mới cho chu kỳ kiến trúc tiếp theo.

## Liên kết với khái niệm khác

- [../10-architecture-repository](../10-architecture-repository) — Architecture Repository (Figure 3-5) chính là kho lưu trữ vật lý mà Enterprise Continuum áp dụng cách phân loại lên trên.
- [../11-content-framework-and-metamodel](../11-content-framework-and-metamodel) — §3.12.4 dùng lại trục Foundation → Common → Industry → Organization-Specific (Figure 3-7) để phát triển Enterprise Metamodel, là ứng dụng trực tiếp của Enterprise Continuum.
- [../01-what-is-the-togaf-standard](../01-what-is-the-togaf-standard) — Enterprise Continuum hiện thực hóa ý tưởng "re-usable set of existing architecture assets" đã nêu ở §3.1.

## Câu hỏi ôn tập

- Enterprise Continuum bao gồm 2 continuum nào, và mỗi continuum phân loại loại tài sản gì?
- Giải thích 2 lực "Generalization for future re-use" và "Adaptation for use" — chúng vận hành theo chiều nào trên continuum?
- Vì sao Deployed Solutions lại quay trở lại thành "Architecture Context" mới trong Figure 3-4?
