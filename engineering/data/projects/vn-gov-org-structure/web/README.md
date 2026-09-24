# Web — giao diện tra cứu

UI lấy cảm hứng bố cục từ [CivLab](https://graph.civlab.org/sf) và [civlab.org/us](https://graph.civlab.org/us):
stat tiles, "by type" breakdown, danh sách nguồn ở cuối trang, và sơ đồ vòng tròn theo cấp/nhóm
(mục "Sơ đồ") mô phỏng view "Graph" của CivLab.

**Cố tình KHÔNG clone**: tab "Power map: who is in the news" của CivLab — đó là mạng lưới cá nhân
quan chức thật (ảnh, tên, số bài báo nhắc tới, đường nối quan hệ), nằm ngoài phạm vi đã thống nhất ở
README.md của cả project (mục "Bất kỳ suy diễn/bình luận nào về cá nhân quan chức"). Sơ đồ vòng tròn
ở đây chỉ vẽ **loại cơ quan** (icon hình khối, không phải ảnh người), không có cá nhân nào.

Sơ đồ hiện có 2/3 quạt trống ("Lập pháp", "Tư pháp") vì dự án chưa thu thập dữ liệu Quốc hội/Tòa án
— vẽ trống có chủ đích, không bịa số liệu.

## Chạy local

```
npm install
npm run dev        # http://localhost:5173
npm run build       # kiểm tra TypeScript strict + build production
```

## Dữ liệu

`src/data/*.json` là **bản sao** của `../data/*.json` (copy tại build time, không symlink — tránh
vấn đề Vite giới hạn đọc file ngoài project root). Khi sửa dữ liệu gốc, chạy `npm run sync-data`
rồi rebuild. Chưa tự động hóa việc này (chưa cần thiết khi dữ liệu còn ít và sửa thủ công).

## Đã xác minh (lần cuối 2026-09-22)

- `tsc -b` (strict mode) pass, không lỗi type.
- `vite build` thành công.
- `vite preview` phục vụ 200, bundle chứa đúng dữ liệu thật (đã grep xác nhận "Bộ Quốc phòng",
  "Sở Nội vụ", số liệu ngân sách).
- **Chưa xác minh bằng trình duyệt thật** (không có công cụ browser/screenshot trong phiên làm việc
  này) — mới chỉ kiểm tra qua build/curl, chưa nhìn thấy layout render thực tế. Nên tự mở
  `npm run dev` và xem qua trước khi coi là hoàn thiện.
