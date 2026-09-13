# ADM: Phase D — Technology Architecture

**Tham chiếu:** [G] Ch.4

## Nội dung chính

**Mục đích chung của Phases B, C, D:** cùng khung essential knowledge với Phase B/C — xác định gap so với ưu tiên stakeholder, work package cần thiết, và cách stakeholder điều chỉnh ưu tiên theo value/effort/risk. (Xem `../03-phase-b-business-architecture/`.)

**Phase D — Technology Architecture:**

Objectives:
1. Phát triển **Target Technology Architecture** giúp hiện thực hóa Architecture Vision, cũng như các building block và dịch vụ công nghệ cần thiết để triển khai business, data, và application building block/service — theo cách giải quyết Statement of Architecture Work và mối quan tâm stakeholder.
2. Nhận diện các thành phần Architecture Roadmap dựa trên gap giữa Baseline và Target Technology Architecture.

Về nội dung domain Technology Architecture (tham chiếu §3.3 [S]): domain này mô tả kiến trúc digital và hạ tầng phần mềm/phần cứng logic (capability, standard) cần thiết để hỗ trợ triển khai dịch vụ business, data, application — bao gồm digital services, IoT, hạ tầng social media, cloud services, hạ tầng IT, middleware, network, communication, processing, standard, v.v.

Về interoperability trong Phase D: xác định cơ chế kỹ thuật (technical mechanism) phù hợp để cho phép trao đổi thông tin và dịch vụ giữa các thành phần.

## Điểm cần nhớ

- Phase D là phase "kỹ thuật nhất" trong bộ ba B/C/D — Technology Architecture phải enable đồng thời cả Business, Data, và Application building block/service đã được xác định trước đó.
- Cùng công thức output: Target Technology Architecture + candidate Architecture Roadmap components từ gap Baseline→Target.
- Technology Architecture ngày nay bao trùm phạm vi rộng: không chỉ hạ tầng IT truyền thống mà cả cloud, IoT, hạ tầng social media — phản ánh sự mở rộng của domain này trong TOGAF 10.
- Sau Phase D, ba Target Architecture (B, C, D) đã sẵn sàng để chuyển sang Phase E — nơi các gap được gộp lại thành work package cụ thể.

## Liên kết với khái niệm khác

- `../04-phase-c-information-systems-architectures/` — Technology Architecture enable các building block Data/Application đã xây ở Phase C.
- `../06-phase-e-opportunities-and-solutions/` — Phase E tổng hợp gap từ cả B, C, D thành work package và Architecture Roadmap hoàn chỉnh.
- `../../01-core-concepts/03-architecture-domains/` — Technology Architecture là domain thứ tư (cuối cùng) trong 4 domain kiến trúc cốt lõi.

## Câu hỏi ôn tập

- Objective của Phase D khác gì so với Phase B và C về phạm vi "enable" (hỗ trợ những gì)?
- Domain Technology Architecture theo TOGAF 10 bao gồm những thành phần nào ngoài hạ tầng IT truyền thống?
- Interoperability ở Phase D tập trung xác định điều gì, khác gì so với ở Phase C?
