# ADM: Phase B — Business Architecture

**Tham chiếu:** [G] Ch.4

## Nội dung chính

**Mục đích chung của Phases B, C, D:** Phát triển một tập hợp các domain architecture đã được stakeholder phê duyệt (approved) cho vấn đề đang giải quyết, cùng với tập gap và công việc cần thiết để lấp gap, mà stakeholder đã hiểu rõ. Ba phase B/C/D dùng chung một khung tri thức thiết yếu (essential knowledge) cần xác định:
- Enterprise hiện tại đang thất bại thế nào trong việc đáp ứng ưu tiên (preferences) của stakeholder?
- Cái gì cần thay đổi để enterprise đáp ứng ưu tiên đó? (→ Gaps)
- Công việc nào cần thiết để hiện thực hóa thay đổi, nhất quán với giá trị bổ sung được tạo ra? (→ Work Package)
- Mức độ ưu tiên/sở thích của stakeholder điều chỉnh thế nào theo giá trị, nỗ lực, và rủi ro của thay đổi? (→ Stakeholder Requirements)

**Phase B — Business Architecture:**

Objectives:
1. Phát triển **Target Business Architecture** mô tả cách enterprise cần vận hành để đạt mục tiêu kinh doanh, đáp ứng các động lực chiến lược (strategic drivers) đã nêu trong Architecture Vision, theo cách giải quyết Statement of Architecture Work và các mối quan tâm của stakeholder.
2. Nhận diện các thành phần **Architecture Roadmap** dựa trên gap giữa Baseline và Target Business Architecture.

## Điểm cần nhớ

- B, C, D chia sẻ chung một "công thức" essential knowledge: current-state gap → work package → stakeholder requirements điều chỉnh theo value/effort/risk — đây là mạch tư duy xuyên suốt cả 3 phase domain.
- Mỗi phase (B/C/D) đều sản sinh 2 loại output giống khuôn: (1) Target [Domain] Architecture, (2) candidate Architecture Roadmap components dựa trên gap Baseline→Target.
- Business Architecture đi đầu trong nhóm B/C/D vì Data/Application/Technology Architecture (Phase C, D) phải "enable" (hỗ trợ) Business Architecture — tức là kiến trúc kỹ thuật phục vụ mục tiêu nghiệp vụ, không phải ngược lại.
- Target Business Architecture phải bám sát strategic drivers trong Architecture Vision (Phase A) và giải quyết đúng Statement of Architecture Work.

## Liên kết với khái niệm khác

- `../02-phase-a-architecture-vision/` — Business Architecture triển khai chi tiết các strategic driver và stakeholder concern đã thống nhất ở Architecture Vision.
- `../04-phase-c-information-systems-architectures/` — Data & Application Architecture phải "enable" (hỗ trợ) Target Business Architecture xây ở Phase B.
- `../../01-core-concepts/03-architecture-domains/` — Business Architecture là 1 trong 4 domain kiến trúc cốt lõi của TOGAF.

## Câu hỏi ôn tập

- Bốn câu hỏi essential knowledge chung cho Phase B, C, D là gì, và tại sao chúng lặp lại giống nhau ở cả ba phase?
- Objective của Phase B gồm những gì, và nó liên hệ thế nào với Architecture Vision từ Phase A?
- Output của Phase B là gì, và nó dùng làm input cho phase nào tiếp theo?
