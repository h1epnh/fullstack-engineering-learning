# Khái niệm: Risk Management

**Tham chiếu:** [S] §3.19

## Nội dung chính

Luôn tồn tại rủi ro (risk) trong bất kỳ nỗ lực chuyển đổi kiến trúc/kinh doanh (architecture/business transformation effort) nào. Vì vậy, việc **xác định (identify), phân loại (classify), và giảm thiểu (mitigate)** các rủi ro này **trước khi bắt đầu** là rất quan trọng, để chúng có thể được theo dõi (tracked) xuyên suốt nỗ lực chuyển đổi.

Việc giảm thiểu rủi ro (mitigation) là một **nỗ lực liên tục (ongoing effort)**. Đáng chú ý, các "kích hoạt rủi ro" (risk triggers) thường nằm **ngoài phạm vi kiểm soát** của người lập kế hoạch chuyển đổi (ví dụ: sáp nhập — merger, mua lại — acquisition). Do đó, người lập kế hoạch phải liên tục theo dõi (monitor) bối cảnh chuyển đổi (transformation context).

Một điểm quan trọng về phân định trách nhiệm: **Enterprise Architect có thể nhận diện (identify) các rủi ro và giảm thiểu một số rủi ro nhất định**, nhưng chính **khung governance (governance framework)** mới là nơi rủi ro trước tiên phải được **chấp nhận (accepted)** rồi sau đó mới được **quản lý (managed)**. Nói cách khác, EA không tự quyết định xử lý rủi ro một mình — quyết định đó thuộc về governance.

**Hai mức độ rủi ro (levels of risk)** cần xem xét:

- **Initial level of risk** — mức phân loại rủi ro **trước khi** xác định và triển khai các hành động giảm thiểu.
- **Residual level of risk** — mức phân loại rủi ro **sau khi** đã triển khai các hành động giảm thiểu (nếu có).

**Quy trình quản lý rủi ro** gồm các hoạt động tuần tự:

1. **Risk classification** — phân loại rủi ro.
2. **Risk identification** — xác định rủi ro.
3. **Initial risk assessment** — đánh giá rủi ro ban đầu (tương ứng Initial level of risk).
4. **Risk mitigation and residual risk assessment** — giảm thiểu và đánh giá rủi ro còn lại (tương ứng Residual level of risk).
5. **Risk monitoring** — theo dõi rủi ro liên tục.

Về mặt phương pháp: một **cách tiếp cận định tính (qualitative approach)** đối với risk management được mô tả trong TOGAF Standard — ADM Techniques. Các khái niệm về rủi ro cũng được đưa vào **Enterprise Security Architecture**, mô tả trong TOGAF® Series Guide: *Integrating Risk and Security within a TOGAF® Enterprise Architecture*. Một cách tiếp cận **định lượng nghiêm ngặt hơn (more rigorous quantitative approach)** được mô tả trong **Open FAIR™ Body of Knowledge**, bao gồm 2 chuẩn của The Open Group: **Open Risk Taxonomy (O-RT)** và **Open Risk Analysis (O-RA)**.

## Điểm cần nhớ

- Quy trình quản lý rủi ro có 5 bước: **Risk classification → Risk identification → Initial risk assessment → Risk mitigation and residual risk assessment → Risk monitoring**.
- Phân biệt 2 mức: **Initial level of risk** (trước mitigation) vs **Residual level of risk** (sau mitigation).
- Enterprise Architect **identify** và **mitigate** rủi ro, nhưng **governance framework** mới là nơi rủi ro được **accept** rồi mới **manage**.
- Risk triggers có thể nằm ngoài tầm kiểm soát (ví dụ merger/acquisition) — cần monitor liên tục, không phải một lần.
- 2 hướng tiếp cận: **qualitative** (TOGAF ADM Techniques) và **quantitative** (Open FAIR — O-RT + O-RA).

## Liên kết với khái niệm khác

- [../../03-governance-content/01-architecture-governance](../../03-governance-content/01-architecture-governance) — chính governance framework là nơi rủi ro được "accepted" và "managed", liên kết trực tiếp với chủ đề Architecture Governance.
- [../13-ea-capability-as-operational-entity](../13-ea-capability-as-operational-entity) — "Risk and Opportunity Management" là một trong 10 năng lực vận hành mà EA practice cần thiết lập (§3.14).
- [../08-interoperability](../08-interoperability) — cân nhắc bảo mật (security considerations) của việc trao đổi thông tin/dịch vụ, được nêu từ Phase A, liên hệ với Enterprise Security Architecture ở đây.

## Câu hỏi ôn tập

- Liệt kê 5 bước trong quy trình quản lý rủi ro của TOGAF theo đúng thứ tự.
- Phân biệt Initial level of risk và Residual level of risk.
- Trong quản lý rủi ro, vai trò của Enterprise Architect khác vai trò của governance framework như thế nào?
