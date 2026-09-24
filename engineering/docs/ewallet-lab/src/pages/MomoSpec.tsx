import { Crumb, Note, PageLink } from '../components';

export default function MomoSpec() {
  return (
    <section className="page">
      <Crumb parts={['Partners & specs', 'MoMo spec references']} />
      <h1>MoMo spec references</h1>
      <p className="lede">
        Đúng nguyên tắc luôn bám tài liệu thật: mọi field/công thức chữ ký, giới hạn số tiền, và cấu trúc IA trong
        lab này lấy trực tiếp từ đây, không suy đoán.
      </p>

      <h2>API — đã xác minh trực tiếp</h2>
      <ul>
        <li>
          <a
            href="https://developers.momo.vn/v3/docs/payment/api/collection-link/"
            target="_blank"
            rel="noopener"
          >
            Collection Link API
          </a>{' '}
          — nguồn field <code>partnerCode</code>, <code>requestId</code>, <code>amount</code>, <code>orderId</code>,{' '}
          <code>orderInfo</code>, <code>redirectUrl</code>, <code>ipnUrl</code>, <code>requestType</code>,{' '}
          <code>extraData</code>, <code>signature</code>, và công thức chữ ký (sort alphabet, nối{' '}
          <code>key=value&amp;…</code>, HMAC-SHA256).
        </li>
        <li>
          <a
            href="https://developers.momo.vn/v3/docs/payment/api/result-handling/notification/"
            target="_blank"
            rel="noopener"
          >
            Payment Notification (IPN)
          </a>{' '}
          — field IPN, yêu cầu phản hồi HTTP 204 trong 15 giây, nguyên tắc "MoMo không tự hoàn tiền dựa trên kết
          quả IPN trả về".
        </li>
        <li>
          <a
            href="https://www.momo.vn/hoi-dap/cac-buoc-thuc-hien"
            target="_blank"
            rel="noopener"
          >
            Các bước thực hiện (hướng dẫn tài khoản mới)
          </a>{' '}
          — trình tự chính thức: tải &amp; đăng ký → liên kết ngân hàng → nạp tiền lần đầu tối thiểu{' '}
          <strong>10.000đ</strong> (riêng Agribank: 50.000đ, chưa phân biệt theo ngân hàng trong lab này). Đây là
          nguồn cho <PageLink to="frontend-design">wizard onboarding</PageLink> và mức tối thiểu ở{' '}
          <PageLink to="svc-topup">topup-service</PageLink>.
        </li>
      </ul>

      <h2>UX &amp; brand — đã xác minh trực tiếp</h2>
      <ul>
        <li>
          <a
            href="https://developers.momo.vn/v3/docs/app-center/design-guideline/general-ux-principles/"
            target="_blank"
            rel="noopener"
          >
            General UX Principles
          </a>{' '}
          — quy tắc báo lỗi chính xác + chỉ cách sửa, không hiển thị nhiều loading cùng lúc, ưu tiên lựa chọn có
          sẵn thay vì nhập tay tự do. Lưu ý: trang này ghi "tối đa 3 module trên bottom tab bar", nhưng đó là hướng
          dẫn cho <strong>mini-app đối tác</strong> nhúng trong MoMo — ứng dụng MoMo thật (xem ảnh chụp màn hình
          thật) tự dùng 5 tab, không áp dụng giới hạn đó cho chính mình.
        </li>
        <li>
          <a
            href="https://momopartners.m-n.associates/en/colors/momo-color-palette/"
            target="_blank"
            rel="noopener"
          >
            MoMo Color Palette — MoMo Partners Brandbook
          </a>{' '}
          — mã màu chính thức: hồng chủ đạo <code>#A50064</code>, dải tint/shade từ <code>#FFEFF4</code> đến{' '}
          <code>#F95396</code>. Dùng làm accent color của app (xem{' '}
          <PageLink to="frontend-design">Design &amp; UI system</PageLink>) — không dùng tên/logo MoMo.
        </li>
        <li>
          <a href="https://www.momo.vn/" target="_blank" rel="noopener">
            momo.vn
          </a>{' '}
          — 12 nhóm "Tiện ích và dịch vụ" trên trang chủ web, dùng làm nội dung trang{' '}
          <code>AllServices</code> ("Xem thêm dịch vụ") trong app.
        </li>
        <li>
          <a href="https://minh.la/ui-ux-case-study-momo/" target="_blank" rel="noopener">
            UI&amp;UX Case Study — MoMo &amp; ZaloPay
          </a>{' '}
          (phân tích độc lập, không phải nguồn chính thức của MoMo): cách nhóm tính năng theo mức độ dùng thường
          xuyên.
        </li>
      </ul>

      <h2>Ranh giới cần biết</h2>
      <Note kind="warn" icon="!">
        <p>
          Collection Link là API <strong>thu tiền</strong> (merchant thu từ khách qua MoMo) —{' '}
          <code>ewallet-lab</code> thích nghi field/MAC pattern này sang chiều "ngân hàng thu tiền để nạp ví", hợp
          lý về kỹ thuật nhưng <strong>chưa được MoMo xác nhận</strong> là cách họ tự làm nội bộ.
        </p>
      </Note>
      <Note kind="gap" icon="!">
        <p>
          <strong>Gap chưa đóng:</strong> công thức chữ ký riêng cho IPN (khác request tạo giao dịch) chưa xác nhận
          được từ trang đã fetch. <code>IpnController</code> cố tình không verify bằng công thức chưa xác nhận —
          ghi rõ trong code, không bỏ sót âm thầm.
        </p>
      </Note>
      <Note icon="i">
        <p>
          MoMo's public dev docs dành cho <strong>merchant tích hợp MoMo</strong>, không công khai cách MoMo tự
          vận hành P2P transfer/bill payment nội bộ — đây là lý do 2 tính năng đó ở trạng thái "chưa có spec" trong
          Roadmap.
        </p>
      </Note>
    </section>
  );
}
