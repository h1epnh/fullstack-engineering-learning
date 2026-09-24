import { Crumb, FieldsTable, Note, PageLink } from '../components';

export default function FrontendDesign() {
  return (
    <section className="page">
      <Crumb parts={['Frontend', 'Design & UI system']} />
      <h1>Design &amp; UI system</h1>
      <p className="lede">
        Sau bản khung microfrontend ban đầu, giao diện được thiết kế lại dựa trên{' '}
        <strong>ảnh chụp màn hình thật</strong> của app MoMo (không chỉ tài liệu viết) — trang này ghi lại từng
        quyết định và nguồn thật đứng sau nó.
      </p>

      <h2>Màu sắc — MoMo Pink thật, không phải màu tự chọn</h2>
      <p>
        <code>packages/ui/src/tokens.css</code> dùng đúng bảng màu chính thức của MoMo (
        <a href="https://momopartners.m-n.associates/en/colors/momo-color-palette/" target="_blank" rel="noopener">
          MoMo Partners Brandbook
        </a>
        ): hồng chủ đạo <code>#A50064</code>, dải tint <code>#FFEFF4</code> → <code>#F95396</code>. Chi tiết nguồn ở{' '}
        <PageLink to="momo-spec">MoMo spec references</PageLink>.
      </p>
      <Note kind="warn" icon="!">
        <p>
          <strong>Ranh giới rõ ràng:</strong> đây là <em>màu</em> thật của MoMo, không phải <em>tên hay logo</em>{' '}
          của MoMo. Khi được yêu cầu trực tiếp dùng luôn tên/logo "MoMo" cho app này, quyết định là{' '}
          <strong>không</strong> — app giữ tên riêng "Ewallet Lab" xuyên suốt. Copy cấu trúc/màu sắc/layout là
          functional clone hợp lý cho mục đích học tập; copy thương hiệu của một công ty tài chính thật đang hoạt
          động (đã đăng ký nhãn hiệu tại Việt Nam) là rủi ro nhãn hiệu thật sự, không phải lựa chọn thẩm mỹ.
        </p>
      </Note>

      <h2>Bộ icon — Material Symbols, không phải emoji</h2>
      <p>
        Toàn bộ icon (trước đây là emoji: 💳📥📷...) đã đổi sang{' '}
        <a href="https://fonts.google.com/icons" target="_blank" rel="noopener">
          Google Material Symbols
        </a>{' '}
        (Outlined) — trông giống ứng dụng thật hơn nhiều so với emoji. Font được nạp một lần qua{' '}
        <code>@import</code> ngay trong <code>tokens.css</code> (không phải <code>&lt;link&gt;</code> trong từng
        HTML riêng), nên mọi remote — kể cả standalone dev harness của từng micro-app — tự động có icon mà không
        cần cấu hình gì thêm. Component <code>&lt;Icon name="..." /&gt;</code> trong <code>packages/ui</code> render
        icon bằng tên ligature (ví dụ <code>"account_balance_wallet"</code>).
      </p>

      <h2>Màn hình Home — dựng lại từ ảnh chụp thật</h2>
      <p>
        Cấu trúc dưới đây lấy trực tiếp từ ảnh chụp app MoMo thật (không phải từ trang landing momo.vn — hai nguồn
        cho ra 2 cấu trúc khác nhau, xem ghi chú ở <PageLink to="momo-spec">MoMo spec references</PageLink>):
      </p>
      <ol>
        <li>Hàng 4 icon nhanh: Nạp/Rút (thật, gọi topup-service), Nhận tiền, QR Thanh toán, Ví tiện ích.</li>
        <li>Dải 3 ví song song: Ví chính (thật), Ví Trả Sau, Túi Thần Tài (2 cái sau: "Chưa mở", coming-soon).</li>
        <li>
          Grid dịch vụ gọn 7 ô, kết thúc bằng "Xem thêm dịch vụ" → mở màn hình <code>AllServices</code> riêng (10
          danh mục lấy từ momo.vn) — thay vì nhồi hết vào Home như bản đầu tiên.
        </li>
        <li>
          Feed cuộn: "Chi tiêu tháng [X]" (<strong>thật</strong> — tính từ transaction history có sẵn của
          wallet-service, không phải số minh hoạ), "Mẹo hôm nay" (rule-based theo giờ trong ngày, ghi rõ không
          phải AI thật — khác "Moni" của MoMo thật), và 3 thẻ teaser (vé phim, ưu đãi, sản phẩm tài chính) —
          không dùng lại tên thương hiệu thật (Samsung, Shopee, Sting...) xuất hiện trong ảnh chụp gốc vì lab
          không có quan hệ đối tác thật với các bên đó.
        </li>
      </ol>

      <h2>Bottom nav — 5 tab, không phải 3</h2>
      <p>
        Bản đầu tiên áp dụng máy móc quy tắc "tối đa 3 module" từ trang dev-guideline của MoMo. Sau khi xem ảnh
        chụp app thật: MoMo tự dùng <strong>5 tab</strong> (Trang chủ · Ưu đãi · Quét mọi QR · Giao dịch · Tôi) với
        nút QR nổi ở giữa dạng hành động (mở camera), không phải tab thường. Quy tắc "tối đa 3" hoá ra là hướng dẫn
        cho <strong>mini-app đối tác</strong> nhúng trong MoMo, không áp dụng cho chính app MoMo. Đã sửa lại{' '}
        <code>BottomNav</code> để hỗ trợ item dạng <code>special</code> (nút tròn nổi) và cập nhật 5 tab đúng thật
        — tab đầu ghi "Ewallet" thay vì tên thương hiệu.
      </p>

      <h2>Onboarding — theo đúng trình tự thật của MoMo</h2>
      <p>
        <code>shell/src/screens/Onboarding.tsx</code> chạy ngay sau khi đăng ký tài khoản mới (không chạy khi đăng
        nhập lại), theo đúng{' '}
        <a href="https://www.momo.vn/hoi-dap/cac-buoc-thuc-hien" target="_blank" rel="noopener">
          hướng dẫn chính thức của MoMo
        </a>
        : tạo tài khoản → liên kết ngân hàng → nạp tiền lần đầu (tối thiểu 10.000đ). Tái sử dụng nguyên luồng đã có
        của <code>mfe-topup</code> thay vì viết lại state machine mới.
      </p>

      <h2>Thông báo — dữ liệu thật, không phải feed giả</h2>
      <p>
        Chuông thông báo ở góc phải Home hiển thị thông báo được <strong>suy ra từ transaction history thật</strong>{' '}
        (mỗi giao dịch <code>TOPUP</code> đã <code>CONFIRMED</code> → 1 thông báo "Nạp tiền thành công"), không
        phải nội dung dựng sẵn. Trạng thái đã đọc/chưa đọc lưu <code>localStorage</code> theo từng người xem —
        cùng nguyên tắc "best-effort, per-viewer" như <code>packages/session</code>, không đồng bộ qua backend.
      </p>

      <h2>Bảng tổng hợp thay đổi</h2>
      <FieldsTable
        head={['Khu vực', 'Trước', 'Sau (dựa trên ảnh chụp thật)']}
        rows={[
          ['Màu sắc', 'Teal tự chọn', 'MoMo Pink #A50064 (brandbook thật)'],
          ['Icon', 'Emoji', 'Material Symbols Outlined'],
          ['Home', 'Grid 12 ô từ momo.vn', '4 quick + 3 ví + 7 grid + feed thật/teaser'],
          ['Bottom nav', '3 tab', '5 tab + nút QR nổi'],
          ['Onboarding', 'Không có', 'Wizard theo đúng hướng dẫn MoMo thật'],
          ['Thông báo', 'Không có', 'Suy ra từ transaction thật + đọc/chưa đọc local'],
        ]}
      />
    </section>
  );
}
