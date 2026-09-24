# Schema & kiến trúc dữ liệu

## Mô hình: đồ thị tối giản (graph), lưu tạm dưới dạng JSON

Chưa cần database/API ở giai đoạn này — JSON tĩnh trong `data/` là đủ để xác thực schema và bắt đầu
tích lũy dữ liệu thật. Khi có đủ dữ liệu (nhiều cấp: trung ương → tỉnh → sở/ngành), sẽ cân nhắc
chuyển sang một graph DB (Neo4j/SQLite với bảng edge) — chưa quyết định, không làm sớm khi chưa có
đủ dữ liệu để biết truy vấn thực tế cần gì.

## Entity types (đúng theo ranh giới đã ghi ở README — chỉ cơ cấu tổ chức tĩnh)

### `CoQuanTrungUong` — Bộ / cơ quan ngang Bộ

```json
{
  "id": "bo-quoc-phong",
  "ten": "Bộ Quốc phòng",
  "loai": "bo",
  "nhiem_ky": "Quốc hội khóa XVI (2026-2031)",
  "nguon": [
    { "tieu_de": "...", "url": "...", "ngay_truy_cap": "YYYY-MM-DD" }
  ]
}
```

- `loai`: `"bo"` | `"co_quan_ngang_bo"`.
- `nguon`: bắt buộc — mọi record phải trỏ được về ít nhất một nguồn đã fetch thật, không suy đoán.
  Đây là nguyên tắc xuyên suốt project, không phải tùy chọn.

### `NguoiDungDauHienTai` — người giữ chức danh đứng đầu (phạm vi tối thiểu, đã xác nhận với user)

**Ranh giới quan trọng**: chỉ ghi tên + chức danh + nguồn phê chuẩn chính thức. **Không** ghi tiểu
sử, quá trình công tác, học vấn, ảnh, hay bất kỳ quan hệ bổ nhiệm/quyền lực nào ngoài việc "người
này hiện giữ chức danh này theo văn bản phê chuẩn của Quốc hội". Đây là mở rộng nhỏ của field
`chức danh` vốn đã có trong mô tả entity gốc — KHÔNG phải hồ sơ cá nhân. Ranh giới này được người
dùng xác nhận rõ ràng trước khi thu thập (không tự ý mở rộng thêm nếu chưa hỏi lại).

```json
{
  "co_quan_id": "bo-quoc-phong",
  "chuc_danh": "Bộ trưởng",
  "ten_nguoi_dung_dau": "Phan Văn Giang",
  "ghi_chu": "kiêm Phó Thủ tướng"
}
```

- `co_quan_id`: trỏ về `id` trong `central_agencies.json`.
- Dữ liệu đổi theo thời gian (miễn nhiệm/bổ nhiệm mới) — chỉ ghi trạng thái "hiện tại" tại thời
  điểm `ngay_truy_cap` của nguồn, không phải lịch sử. Khi có thay đổi thật, cập nhật record, không
  giữ lại bản cũ (khác với `DonViHanhChinhCapTinh` vốn cần giữ lịch sử sáp nhập).

### `DonViHanhChinhCapTinh` — tỉnh / thành phố trực thuộc trung ương

```json
{
  "id": "lao-cai",
  "ten": "Lào Cai",
  "loai": "tinh",
  "sap_nhap": true,
  "don_vi_cu": ["Yên Bái", "Lào Cai"],
  "hieu_luc_tu": "2025-07-01",
  "nghi_quyet": "Nghị quyết 202/2025/QH15",
  "nguon": [
    { "tieu_de": "...", "url": "...", "ngay_truy_cap": "YYYY-MM-DD" }
  ]
}
```

- `loai`: `"tinh"` | `"thanh_pho_tw"` (thành phố trực thuộc trung ương).
- `sap_nhap`: `false` nếu giữ nguyên địa giới cũ (không đổi tên/không hợp nhất) — khi đó
  `don_vi_cu` = `null`.

### `KhungCoQuanChuyenMon` — khung sở/ngành chuẩn thuộc UBND cấp tỉnh

Khác với 2 loại trên (từng instance cụ thể), đây là **khung quy định** áp dụng chung cho toàn bộ
34 tỉnh — tra theo Nghị định, không phải liệt kê thủ công từng sở của từng tỉnh (không khả thi,
không có nguồn tổng hợp sẵn cho việc đó). Ghi chú quan trọng phát hiện khi thu thập: cùng đợt cải
cách 2025, Việt Nam đã **bỏ cấp huyện**, chuyển mô hình chính quyền địa phương từ 3 cấp (tỉnh -
huyện - xã) xuống 2 cấp (tỉnh - xã/phường/đặc khu) — nên "cấp sở/ngành" ở đây là cấp trực thuộc
tỉnh, không còn "phòng ban cấp huyện" nữa.

```json
{
  "id": "so-noi-vu",
  "ten": "Sở Nội vụ",
  "nhom": "bat_buoc",
  "dieu_khoan": "Điều 8, Nghị định 150/2025/NĐ-CP",
  "nguon": [
    { "tieu_de": "...", "url": "...", "ngay_truy_cap": "YYYY-MM-DD" }
  ]
}
```

- `nhom`: `"bat_buoc"` (12 sở/cơ quan bắt buộc mọi tỉnh) | `"dac_thu"` (4 sở chỉ thành lập khi đủ
  điều kiện, ví dụ Sở Quy hoạch - Kiến trúc chỉ ở Hà Nội/TP.HCM).
- Trần tổng số sở mỗi tỉnh (`so_luong_toi_da`) nằm ở field cấp file, không lặp lại ở từng item —
  xem `data/department_framework.json`.

**Chưa làm**: liệt kê sở thực tế của từng tỉnh trong 34 tỉnh (framework chỉ quy định khung/trần,
tỉnh nào chọn tổ chức sở đặc thù nào cần tra quyết định riêng của HĐND/UBND tỉnh đó — chưa có nguồn
tổng hợp, không suy đoán).

### `NganSachNhaNuoc` — dự toán ngân sách nhà nước theo năm

Khác 2 loại trên (không phải "cơ quan"), đây là số liệu tài khóa theo năm — một record/năm, lấy từ
Nghị quyết dự toán NSNN mà Quốc hội thông qua hàng năm (thường vào kỳ họp cuối năm trước).

```json
{
  "nam": 2026,
  "nghi_quyet": "245/2025/QH15",
  "ngay_thong_qua": "2025-11-13",
  "don_vi": "ty_dong",
  "tong_thu": { "tong": 2529467, "trung_uong": 1225356, "dia_phuong": 1304111 },
  "tong_chi": { "tong": 3159106, "trung_uong": 1809056, "dia_phuong": 1350050 },
  "boi_chi": { "tong": 605800, "phan_tram_gdp": 4.2, "trung_uong": 583700, "dia_phuong": 22100 },
  "nguon": [
    { "tieu_de": "...", "url": "...", "ngay_truy_cap": "YYYY-MM-DD" }
  ]
}
```

- `don_vi`: luôn `"ty_dong"` (tỷ đồng) — **không** dùng "trillion"/"billion" tiếng Anh trong dữ liệu
  vì dễ quy đổi sai (một số công cụ dịch tự động từng nhầm "tỷ đồng" sang "trillion VND", sai đơn
  vị — đã phát hiện khi thu thập, ghi lại để không lặp lại).
- Đây là **dự toán** (kế hoạch được duyệt trước năm tài khóa), không phải **quyết toán** (số thực
  chi sau khi kết thúc năm) — hai khái niệm khác nhau, sẽ cần phân biệt field khi có dữ liệu quyết
  toán.

## Relation types — mới có 1 loại, sẽ mở rộng sau khi có dữ liệu

- `HOP_NHAT_TU` (ngầm định qua field `don_vi_cu` ở trên, chưa tách thành edge riêng — chưa cần
  thiết vì hiện tại toàn bộ dữ liệu vẫn còn đơn giản).

**Chưa làm** (đúng theo phạm vi ở README): quan hệ `QUAN_LY_NGANH_DOC` (Bộ nào quản lý ngành dọc ở
sở nào cấp tỉnh) — cần nguồn xác nhận rõ ràng cho từng cặp Bộ–Sở, chưa có nguồn nào được fetch xác
minh. Không tự suy diễn.

## Nguyên tắc thu thập dữ liệu

1. Mọi con số/tên gọi phải đến từ một nguồn đã thực sự fetch (không phải nhớ từ training data) —
   xem `SOURCES.md` để biết nguồn nào đã xác minh, nguồn nào còn thiếu.
2. Khi có khoảng trống (ví dụ: chưa có số hiệu Nghị quyết chính xác), ghi rõ là "chưa xác minh",
   không điền số phỏng đoán.
3. Dữ liệu thay đổi theo thời gian (sáp nhập, đổi tên) — mỗi record có `hieu_luc_tu` để biết áp dụng
   từ khi nào; không xóa record cũ, thêm field `hieu_luc_den` khi cần versioning (chưa cần ngay).

## Định hướng tiếp theo (chưa làm, ghi lại để không quên)

- Danh sách sở thực tế đã tổ chức ở từng tỉnh trong 34 tỉnh (khác với khung chuẩn ở
  `KhungCoQuanChuyenMon` — đây là instance thật, cần tra quyết định riêng từng tỉnh, không có nguồn
  tổng hợp sẵn, khối lượng lớn).
- Cấp xã/phường/đặc khu (cấp hành chính thấp nhất sau khi bỏ cấp huyện) — quy mô rất lớn (hàng nghìn
  đơn vị), cân nhắc có cần thiết cho mục tiêu project hay dừng ở cấp tỉnh.
- Ngân sách mới có mức tổng quốc gia (`NganSachNhaNuoc`) — chưa có breakdown theo từng Bộ/từng tỉnh
  (Nghị quyết dự toán tổng không chia theo Bộ; số liệu chi tiết theo Bộ/tỉnh nằm ở các phụ lục riêng,
  chưa thu thập). Cũng chưa có số liệu quyết toán (số thực chi) — mới chỉ có dự toán (kế hoạch).
- Cân nhắc một script Python nhỏ trong `scripts/` để validate JSON theo schema này (jsonschema),
  chạy như một pre-commit check khi thêm dữ liệu mới — chưa làm vì dữ liệu còn quá ít để cần tự
  động hóa.
- Giao diện tra cứu (web) — chỉ làm sau khi có đủ dữ liệu thật để hiển thị, không dựng UI rỗng.
