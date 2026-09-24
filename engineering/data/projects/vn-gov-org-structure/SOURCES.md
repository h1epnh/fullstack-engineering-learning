# Nhật ký nguồn — đã xác minh trực tiếp (fetch thật, không phải nhớ)

Nguyên tắc: chỉ ghi vào `data/` những gì có nguồn ở đây. Mục "Còn thiếu" liệt kê rõ khoảng trống,
không giả vờ đã đầy đủ.

## Người đứng đầu hiện tại của 17 cơ quan trung ương (2026-2031)

**Ranh giới đã xác nhận với người dùng trước khi thu thập**: chỉ tên + chức danh + nguồn, không
tiểu sử/ảnh/quan hệ quyền lực. Xem DESIGN.md#NguoiDungDauHienTai.

- **2 nguồn chính, độc lập, cùng cổng chinhphu.vn** — fetch riêng biệt, cho ra danh sách 17 người
  giống hệt nhau (đối chiếu chéo tự nhiên, không cố ý fetch trùng):
  - [Quốc hội phê chuẩn bổ nhiệm 6 Phó Thủ tướng, các Bộ trưởng và thành viên Chính phủ](https://baochinhphu.vn/quoc-hoi-phe-chuan-bo-nhiem-6-pho-thu-tuong-cac-bo-truong-va-thanh-vien-chinh-phu-102260408130112084.htm)
    (baochinhphu.vn, fetch 2026-09-22)
  - [Danh sách thành viên Chính phủ, cơ cấu Chính phủ nhiệm kỳ 2026-2031](https://xaydungchinhsach.chinhphu.vn/danh-sach-thanh-vien-chinh-phu-co-cau-chinh-phu-nhiem-ky-2026-2031-119260409071814059.htm)
    (xaydungchinhsach.chinhphu.vn, fetch 2026-09-22)
- **Đối chiếu riêng cho vị trí Thủ tướng** (rủi ro sai sót cao nhất nếu ghi nhầm): [Quốc hội bầu đồng chí Lê Minh Hưng giữ chức Thủ tướng Chính phủ, nhiệm kỳ 2026-2031](https://vass.gov.vn/bao-ve-nen-tang-tu-tuong-cua-dang/quoc-hoi-bau-dong-chi-le-minh-hung-giu-chuc-thu-tuong-chinh-phu-nhiem-ky-2026-2031-562918)
  (Viện Hàn lâm Khoa học xã hội Việt Nam, fetch 2026-09-22) — khớp với 2 nguồn trên.

**Còn thiếu**: chưa đối chiếu bằng văn bản Nghị quyết phê chuẩn gốc (chỉ qua 3 bài báo/trang tin,
dù đều là nguồn chính thức). Dữ liệu này đổi theo thời gian (miễn nhiệm/bổ nhiệm) — chỉ đúng tại
thời điểm 2026-09-22, không tự động cập nhật.

## Cơ cấu Chính phủ nhiệm kỳ Quốc hội khóa XVI (2026) — 14 Bộ + 3 cơ quan ngang Bộ

- **Nguồn chính**: [Chính phủ nhiệm kỳ mới có 14 bộ và 3 cơ quan ngang bộ](https://baochinhphu.vn/chinh-phu-nhiem-ky-moi-co-14-bo-va-3-co-quan-ngang-bo-102260407115528555.htm)
  — Cổng Thông tin điện tử Chính phủ (baochinhphu.vn), fetch ngày 2026-09-22.
  - Quốc hội biểu quyết thông qua cơ cấu tổ chức Chính phủ nhiệm kỳ khóa XVI ngày **2026-04-07**,
    488/488 phiếu tán thành.
  - Liệt kê đầy đủ tên 14 Bộ + 3 cơ quan ngang Bộ (dùng nguyên văn trong `data/central_agencies.json`).
- Nguồn tham chiếu chéo (không fetch chi tiết, chỉ dùng để xác nhận số lượng khớp):
  [thuvienphapluat.vn — Danh sách 14 Bộ, 03 cơ quan ngang Bộ](https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/79804/nghi-dinh-ve-co-cau-to-chuc-cua-cac-bo-co-quan-ngang-bo-co-quan-thuoc-chinh-phu-moi-nhat)
  (trả 403 khi fetch trực tiếp, chỉ có snippet từ kết quả tìm kiếm).

**Còn thiếu (đã thử tìm thêm, vẫn chưa có)**: số hiệu Nghị quyết chính thức của phiên biểu quyết
2026-04-07. Đã fetch trực tiếp bài gốc trên xaydungchinhsach.chinhphu.vn
([Thông qua Nghị quyết về cơ cấu tổ chức của Chính phủ nhiệm kỳ Quốc hội khóa XVI](https://xaydungchinhsach.chinhphu.vn/thong-qua-nghi-quyet-ve-co-cau-to-chuc-cua-chinh-phu-nhiem-ky-quoc-hoi-khoa-xvi-119260407125856043.htm),
fetch 2026-09-22) — bài báo lặp lại tên "Nghị quyết về cơ cấu tổ chức của Chính phủ nhiệm kỳ Quốc
hội khóa XVI" nhiều lần nhưng **không nêu số hiệu** (khả năng số hiệu công báo chưa được gán/công
bố tại thời điểm bài viết, hoặc cần tra riêng ở Công báo). Không điền số phỏng đoán vào
`central_agencies.json` — trường này để trống cho tới khi có nguồn nêu rõ.

Chưa có Nghị định riêng cho chức năng/nhiệm vụ/cơ cấu tổ chức bên trong từng Bộ (mỗi Bộ thường có
một Nghị định riêng quy định chi tiết) — cần thu thập từng cái, chưa làm.

## Đơn vị hành chính cấp tỉnh sau sáp nhập — 34 tỉnh/thành phố

- **Nguồn chính**: [Chi tiết 34 đơn vị hành chính cấp tỉnh từ 12/6/2025](https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm)
  — Cổng Thông tin điện tử Chính phủ (xaydungchinhsach.chinhphu.vn), fetch ngày 2026-09-22.
  - Nghị quyết **202/2025/QH15**, Quốc hội thông qua **2025-06-12**, chính quyền địa phương mới
    chính thức vận hành từ **2025-07-01**.
  - 23/34 đơn vị được sắp xếp lại (19 tỉnh + 4 thành phố trực thuộc trung ương), 11/34 giữ nguyên
    (9 tỉnh + 2 thành phố).
- **Nguồn bổ sung** (cho chi tiết sáp nhập Tuyên Quang + Hà Giang, không có trong nguồn chính ở
  trên): kết quả tìm kiếm dẫn tới
  [thuvienphapluat.vn — 34 tỉnh thành hiện nay được sáp nhập và giữ nguyên thế nào](https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/34-tinh-thanh-hien-nay-duoc-sap-nhap-va-giu-nguyen-the-nao-danh-sach-sap-nhap-tinh-thanh-moi-nhat-2-29215-232808.html)
  — chưa fetch trực tiếp trang này, chỉ dùng snippet tìm kiếm cho riêng chi tiết Tuyên Quang.

**Còn thiếu (đã thử fetch văn bản gốc, không thành công vì lý do kỹ thuật)**: đã tìm và fetch trực
tiếp trang toàn văn Nghị quyết 202/2025/QH15 trên chính cổng chính phủ —
[TOÀN VĂN: Nghị quyết số 202/2025/QH15](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm),
fetch 2026-09-22. Trang này xác nhận lại đúng các con số tổng (34 đơn vị = 28 tỉnh + 6 thành phố;
19 tỉnh + 4 thành phố hình thành sau sắp xếp — khớp với dữ liệu đã có), nhưng **nội dung điều khoản
chi tiết (tỉnh nào sáp nhập từ tỉnh nào) hiển thị dưới dạng ảnh chụp văn bản, không phải text**, nên
công cụ fetch không trích xuất được. Vì vậy danh sách `don_vi_cu` trong `provinces.json` vẫn dựa
trên 2 nguồn báo trung gian đã ghi ở trên (đã đối chiếu số lượng tổng khớp với văn bản gốc, nhưng
**chưa đối chiếu được từng cặp merge với chính văn bản luật**). Ai cần độ chính xác pháp lý tuyệt
đối cho một tỉnh cụ thể nên tự tra bản PDF gốc, không chỉ tin dữ liệu ở đây.

## Khung sở/ngành chuẩn thuộc UBND cấp tỉnh — Nghị định 150/2025/NĐ-CP

- **Nguồn chính**: [Nghị định 150/2025/NĐ-CP: Tổ chức cơ quan chuyên môn thuộc UBND tỉnh, thành phố](https://luatvietnam.vn/co-cau-to-chuc/nghi-dinh-150-2025-nd-cp-to-chuc-co-quan-chuyen-mon-thuoc-ubnd-tinh-thanh-pho-402760-d1.html)
  — LuatVietnam, fetch ngày 2026-09-22. Đã thử fetch trang gốc trên
  [xaydungchinhsach.chinhphu.vn](https://xaydungchinhsach.chinhphu.vn/nghi-dinh-150-nd-cp-quy-dinh-to-chuc-cac-co-quan-chuyen-mon-thuoc-ubnd-cap-tinh-va-ubnd-xa-phuong-dac-khu-119250613093743964.htm)
  trước, nhưng nội dung hiển thị dưới dạng ảnh chụp văn bản, không trích xuất được — phải dùng
  nguồn thứ cấp (LuatVietnam) cho nội dung điều khoản.
  - Hiệu lực từ **2025-06-16**. Điều 8: 12 sở/cơ quan bắt buộc mọi tỉnh. Điều 9: 4 sở đặc thù có
    điều kiện. Điều 10: trần tối đa 14 sở (thường), 15 sở (Hà Nội, TP.HCM).
  - Phát hiện quan trọng khi tra cứu: cùng đợt cải cách 2025, Việt Nam đã **bỏ cấp huyện** (Nghị
    định 150 quy định cơ quan chuyên môn cho "UBND xã, phường, đặc khu", không còn "cấp huyện" như
    Nghị định 45/2025/NĐ-CP ngày 28/2/2025 mà nó thay thế).

**Còn thiếu**: Nghị định **370/2025/NĐ-CP** (31/12/2025) sửa đổi, bổ sung Nghị định 150 — chưa fetch
được nội dung sửa đổi cụ thể, nên chưa biết danh sách/trần số lượng sở ở trên có còn đúng nguyên vẹn
hay đã bị điều chỉnh. `data/department_framework.json` ghi rõ đây là "theo bản gốc Nghị định 150",
chưa cập nhật theo bản sửa đổi — cần làm khi có thời gian tra tiếp.

## Dự toán ngân sách nhà nước năm 2026 — Nghị quyết 245/2025/QH15

- **Nguồn chính**: [Quốc hội thông qua Nghị quyết về dự toán ngân sách nhà nước năm 2026](https://www.vietnamplus.vn/quoc-hoi-thong-qua-nghi-quyet-ve-du-toan-ngan-sach-nha-nuoc-nam-2026-post1076767.vnp)
  — VietnamPlus (TTXVN), fetch ngày 2026-09-22.
  - Quốc hội thông qua ngày **2025-11-13**, 419/420 đại biểu tán thành (88,4%).
  - Toàn bộ số liệu tổng thu/tổng chi/bội chi (trung ương + địa phương) + lương cơ sở lấy nguyên
    văn từ nguồn này.
- **Nguồn bổ sung** (chỉ cho số hiệu Nghị quyết, không có trong bài đã fetch): 2 kết quả tìm kiếm
  độc lập cùng nêu "Nghị quyết 245/2025/QH15" — studocu.vn và find-law.asia — chưa fetch trực tiếp
  2 trang này, chỉ dùng snippet tìm kiếm.

**Lưu ý đơn vị (phát hiện khi thu thập)**: công cụ fetch từng dịch "tỷ đồng" thành "trillion VND"
trong bản tóm tắt tiếng Anh — **sai đơn vị**. Số liệu trong `state_budget.json` giữ nguyên đơn vị
gốc tiếng Việt (`ty_dong` = tỷ đồng) để tránh nhầm lẫn quy đổi.

**Còn thiếu**: đây mới là số dự toán tổng quốc gia, chưa có breakdown theo từng Bộ/từng tỉnh (nằm ở
phụ lục riêng của Nghị quyết, chưa thu thập); chưa có số liệu quyết toán (số thực chi) của các năm
trước.
