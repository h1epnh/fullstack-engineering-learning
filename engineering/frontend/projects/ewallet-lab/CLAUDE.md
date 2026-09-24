# ewallet-lab (frontend) — quy ước cho AI dev

Đọc `DESIGN.md`/`README.md` trước. File này ghi quy ước vận hành rút từ lỗi thật đã gặp trong dự
án — không phải hướng dẫn chung chung.

## Cấu trúc

Module Federation, npm workspaces: `shell` (host) + `mfe-auth`, `mfe-wallet`, `mfe-topup`,
`mfe-transfer` (remotes) + `packages/api-client`, `packages/ui`, `packages/session` (dùng chung).

## Lỗi thật đã gặp — đừng lặp lại

- **Mọi remote gọi service mới → phải thêm `VITE_<X>_SERVICE_URL` build-arg vào đúng Dockerfile
  của remote đó.** Đây là lớp lỗi tái diễn nhiều lần nhất trong dự án: quên build-arg khiến bundle
  vẫn baked `localhost:xxxx` mặc định, gây CORS failed nhìn như lỗi backend nhưng thực ra là
  frontend build thiếu tham số. Mỗi lần một component gọi thêm 1 service mới → tự hỏi "Dockerfile
  của remote này đã có ARG/ENV cho service đó chưa?" trước khi báo xong việc.
- **Image tag phải là `ewallet-lab/<name>:local`**, không phải `<name>:local` — Helm chỉ deploy
  đúng tag có prefix. Build sai tag = pod chạy bundle cũ, "trông như chưa deploy" dù build thành
  công và log không báo lỗi gì.
- **`remoteEntry.js` (remote) và `index.html` (shell) cần `Cache-Control: no-cache`** trong
  `nginx.conf`. Đây là các file tên cố định (khác asset đã content-hash), nếu thiếu header này
  browser có thể cache vĩnh viễn bản cũ — deploy mới trông như "chưa có hiệu lực" dù server đúng.
- Sau mỗi thay đổi: `npm run build -w <pkg>` sạch chưa đủ — phải rebuild Docker image (đúng tag),
  xóa pod, verify qua `curl http://<name>.ewallet-lab.local/remoteEntry.js` trả 200 **và** chứa
  đúng nội dung mới (grep bundle cho một string đặc trưng, đừng chỉ tin status code).

## Grounding thật — không suy đoán

- UI theo MoMo thật (Material Symbols icon, palette `#a50064`...) nhưng **không bao giờ dùng
  tên/logo MoMo thật** — badge màu/chữ cái đầu, không phải logo thương hiệu.
- Logo ngân hàng thật lấy từ [VietQR public API](https://api.vietqr.io/v2/banks) (CORS-open, không
  cần key) — đây là API công khai đúng mục đích nhận diện ngân hàng trong luồng chuyển khoản, khác
  hẳn việc dùng logo MoMo (thương hiệu không liên quan tới lab này). API này cũng liệt kê "momo"
  như một thành viên liên ngân hàng — **luôn filter bỏ entry đó**.
- `describeApiError` (packages/ui/formErrors.ts) là nơi tập trung copy lỗi theo từng `context` —
  thêm field mới vào union type khi thêm luồng nghiệp vụ mới, không hardcode message rời rạc.
