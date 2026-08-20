# ADM: Phase C — Information Systems Architectures (Data + Application)

**Tham chiếu:** [G] Ch.4

## Nội dung chính

**Mục đích chung của Phases B, C, D:** cùng khung essential knowledge với Phase B — xác định enterprise hiện đang thất bại thế nào so với ưu tiên stakeholder, cái gì cần thay đổi (gaps), công việc cần thiết (work package), và mức ưu tiên stakeholder điều chỉnh theo value/effort/risk. (Xem `../03-phase-b-business-architecture/` để không lặp lại chi tiết.)

Phase C gồm **hai luồng song song** — Data Architecture và Application Architecture — vì đây là hai domain con của "Information Systems Architectures":

**Phase C — Data Architecture:**

Objectives:
1. Phát triển **Target Data Architecture** giúp hiện thực hóa Business Architecture và Architecture Vision, theo cách giải quyết Statement of Architecture Work và mối quan tâm stakeholder.
2. Nhận diện các thành phần Architecture Roadmap dựa trên gap giữa Baseline và Target Data Architecture.

**Phase C — Application Architecture:**

Objectives:
1. Phát triển **Target Application Architecture** giúp hiện thực hóa Business Architecture và Architecture Vision, theo cách giải quyết Statement of Architecture Work và mối quan tâm stakeholder.
2. Nhận diện các thành phần Architecture Roadmap dựa trên gap giữa Baseline và Target Application Architecture.

## Điểm cần nhớ

- Phase C thực chất là "2-trong-1": Data Architecture và Application Architecture có cùng khuôn objective, chỉ khác domain — cả hai đều phải "enable" (hỗ trợ) Business Architecture chứ không định hình nó.
- Interoperability trong Phase C: Data Architecture định nghĩa nội dung trao đổi thông tin (dùng corporate data/information exchange model); Application Architecture định nghĩa cách các ứng dụng chia sẻ thông tin/dịch vụ với nhau.
- Cùng công thức output như B/D: Target [Data/Application] Architecture + candidate Architecture Roadmap components từ gap Baseline→Target.
- "Information Systems Architectures" là tên gọi của TOGAF cho cặp domain Data + Application — dễ nhầm là một domain riêng lẻ.

## Liên kết với khái niệm khác

- `../03-phase-b-business-architecture/` — Data & Application Architecture phải enable Target Business Architecture đã thống nhất ở Phase B.
- `../05-phase-d-technology-architecture/` — Technology Architecture (Phase D) tiếp tục enable cả Business, Data, và Application Architecture đã xây ở B và C.
- `../11-adm-techniques/` — kỹ thuật Interoperability được áp dụng cụ thể ở Phase C để xác định nội dung/cách thức trao đổi thông tin và dịch vụ.

## Câu hỏi ôn tập

- Tại sao Phase C được coi là gồm hai luồng công việc song song (Data và Application)?
- Objective của Data Architecture và Application Architecture trong Phase C giống/khác nhau ở điểm nào?
- Interoperability được xác định thế nào riêng ở phần Data Architecture so với Application Architecture?
