# VN Gov Org Structure

Dự án dữ liệu về cơ cấu tổ chức hành chính Việt Nam — lấy cảm hứng từ
[CivLab](https://graph.civlab.org/sf) (mô hình đồ thị chính quyền San Francisco), nhưng phạm vi và
ranh giới được điều chỉnh riêng cho bối cảnh Việt Nam sau khi phân tích khác biệt về cấu trúc chính
quyền, tính sẵn có của dữ liệu, và rủi ro pháp lý.

## Phạm vi (đã thống nhất trước khi bắt đầu code)

**Trong phạm vi** — dữ liệu đã được luật quy định công khai và ổn định:

- Cơ cấu tổ chức hành chính nhà nước: bộ, cơ quan ngang bộ, sở/ngành cấp tỉnh, theo các Nghị định
  quy định chức năng/nhiệm vụ/cơ cấu tổ chức (ban hành công khai trên Cổng thông tin điện tử Chính
  phủ, thuvienphapluat.vn, vbpl.vn).
- Số liệu ngân sách nhà nước đã công bố theo Luật Ngân sách nhà nước (dự toán, quyết toán cấp
  quốc gia/tỉnh đã công khai).
- Văn bản pháp luật liên quan đến tổ chức bộ máy (Luật Tổ chức Chính phủ, Luật Tổ chức chính quyền
  địa phương, các Nghị định/Quyết định thành lập cơ quan).

**Ngoài phạm vi — cố tình không làm**:

- Mạng lưới quan hệ nhân sự/quyền lực phi chính thức (ai bổ nhiệm ai ngoài quy trình luật định, quan
  hệ cấp ủy Đảng lồng trong bộ máy nhà nước) — đây là phần CivLab làm mạnh nhất ở San Francisco
  (bầu cử trực tiếp, hồ sơ công khai minh bạch), nhưng ở Việt Nam ranh giới giữa "tổng hợp thông tin
  công khai" và "hệ thống hóa thông tin nhạy cảm" theo Luật An ninh mạng 2018 chưa rõ ràng. Không
  làm để tránh rủi ro pháp lý, không phải vì thiếu giá trị.
- Bất kỳ suy diễn/bình luận nào về cá nhân quan chức — dự án chỉ mô hình hóa **cơ cấu tổ chức tĩnh**
  (entity: cơ quan, chức danh theo quy định; relation: trực thuộc, quản lý nhà nước theo ngành dọc),
  không phải hồ sơ cá nhân. **Ngoại lệ tối thiểu đã xác nhận với người dùng** (2026-09-22): tên +
  chức danh + nguồn phê chuẩn của người hiện giữ chức danh đứng đầu mỗi cơ quan (vd. "Bộ trưởng Bộ
  Quốc phòng: Phan Văn Giang") — coi đây là mở rộng nhỏ của field "chức danh", **không** mở rộng
  thêm sang tiểu sử/ảnh/quá trình công tác/quan hệ bổ nhiệm nếu chưa hỏi lại. Xem
  `data/agency_heads.json` + DESIGN.md#NguoiDungDauHienTai.

## Nguồn dữ liệu

Chưa có API/cổng dữ liệu mở tương đương DataSF cho cấp thành phố/tỉnh ở Việt Nam. Dữ liệu ban đầu sẽ
phải tổng hợp thủ công/parse từ văn bản PDF trên các cổng chính thức — chưa có nguồn tự động hóa được
xác nhận. Mục "Nguồn đã xác minh" sẽ được cập nhật ở đây khi có, theo đúng nguyên tắc bám tài liệu
thật, không suy đoán field/dữ liệu.

## Cấu trúc project

```
DESIGN.md           # schema entity/relation, nguyên tắc thu thập dữ liệu
SOURCES.md          # nhật ký nguồn đã fetch thật — mọi record trong data/ phải trỏ về đây được
data/
  central_agencies.json     # 14 Bộ + 3 cơ quan ngang bộ, nhiệm kỳ Quốc hội khóa XVI (2026-2031)
  agency_heads.json          # tên + chức danh người đứng đầu hiện tại (phạm vi tối thiểu, xem README)
  department_framework.json # khung 12 sở bắt buộc + 4 sở đặc thù (Nghị định 150/2025/NĐ-CP)
  state_budget.json          # dự toán NSNN theo năm (2026: Nghị quyết 245/2025/QH15)
  provinces.json             # 34 tỉnh/thành phố sau sáp nhập (Nghị quyết 202/2025/QH15)
scripts/
  validate.py        # kiểm tra nhanh số lượng/field bắt buộc — chạy: python3 scripts/validate.py
web/                 # giao diện tra cứu (Vite + React + TS) — xem web/README.md để chạy
```

## Trạng thái

Đã có dữ liệu thật cho 5 bảng: cơ cấu Chính phủ trung ương, người đứng đầu hiện tại của 17 cơ quan
đó (Thủ tướng + Bộ trưởng/Thống đốc..., phạm vi tối thiểu), khung sở/ngành chuẩn cấp tỉnh, dự toán
ngân sách nhà nước năm 2026, và đơn vị hành chính cấp tỉnh — mỗi record đều có nguồn trong
`SOURCES.md`. Xem mục "Còn thiếu" trong đó: vài chi tiết (số hiệu Nghị quyết cơ cấu Chính phủ, đối
chiếu chéo nguồn tỉnh, nội dung Nghị định 370/2025/NĐ-CP sửa đổi khung sở) chưa được xác minh 100%.

Phát hiện đáng chú ý trong lúc thu thập: cùng đợt cải cách hành chính 2025, Việt Nam đã **bỏ cấp
huyện**, chuyển chính quyền địa phương từ 3 cấp xuống 2 cấp (tỉnh → xã/phường/đặc khu).

**Chưa làm** (xem DESIGN.md "Định hướng tiếp theo"): danh sách sở thực tế theo từng tỉnh (khác khung
chuẩn), cấp xã/phường/đặc khu, ngân sách chi tiết theo Bộ/tỉnh (mới có mức tổng quốc gia) và số liệu
quyết toán các năm trước, quan hệ quản lý ngành dọc.

Giao diện tra cứu (`web/`) đã có bản đầu: tổng quan, danh sách Chính phủ trung ương, khung sở/ngành,
34 tỉnh/thành (có tìm kiếm), ngân sách, và trang nguồn dữ liệu. Đã qua `tsc --strict` + `vite build`
+ kiểm tra bundle chứa đúng dữ liệu, nhưng **chưa được xem qua trình duyệt thật** trong phiên này
(không có công cụ browser) — xem `web/README.md` mục "Đã xác minh" trước khi coi là hoàn thiện.
