import { Crumb, FlowDiagram } from '../components';

export default function Architecture() {
  return (
    <section className="page">
      <Crumb parts={['Architecture']} />
      <h1>System design</h1>
      <p className="lede">
        6 service backend độc lập (5 Spring Boot/Java + 1 Go), mỗi service có DB riêng (trừ{' '}
        <code>mock-bank-gateway</code> và <code>transfer-service</code>, cố tình không có DB — xem bên dưới), giao
        tiếp qua REST (đồng bộ, nội bộ) và Kafka (bất đồng bộ, chỉ dùng cho xác nhận nạp tiền).
      </p>

      <h2>Sơ đồ (luồng nạp tiền — đường Kafka duy nhất trong hệ thống)</h2>
      <FlowDiagram
        steps={[
          { n: 'CLIENT', t: 'Frontend / curl', d: 'React microfrontend — xem trang Frontend' },
          { n: ':8090', t: 'user-service', d: <>Danh tính, DB riêng <code>ewallet_user</code></> },
          { n: ':8092', t: 'topup-service', d: <>Orchestrator, DB riêng <code>ewallet_topup</code></> },
          { n: ':8093', t: 'mock-bank-gateway', d: 'Đóng vai ngân hàng (Go)' },
          { n: ':8091', t: 'wallet-service', d: <>Consume Kafka, cộng số dư — DB riêng <code>ewallet_wallet</code></>, confirm: true },
        ]}
      />
      <p className="dim">
        topup-service publish sự kiện Kafka <code>wallet.topup.confirmed</code> sau khi nhận IPN —{' '}
        <code>wallet-service</code> tiêu thụ độc lập để cộng số dư, không bị <code>topup-service</code> gọi trực
        tiếp.
      </p>

      <h2>2 service còn lại — gọi REST đồng bộ thẳng vào wallet-service</h2>
      <ul>
        <li>
          <strong><code>transfer-service</code></strong> (:8094) — saga P2P chuyển tiền giữa 2 user nội bộ: tra
          cứu người nhận qua <code>user-service</code>, debit người gửi rồi credit người nhận qua{' '}
          <code>wallet-service</code>, compensate (hoàn lại debit) nếu bước credit fail. <strong>Cố tình không có
          DB</strong> — saga chạy đồng bộ trong 1 request, không cần persist state trung gian (xem mục Roadmap
          "Đã xong" để biết lý do đầy đủ).
        </li>
        <li>
          <strong><code>bill-payment-service</code></strong> (:8095) — tra cứu &amp; thanh toán hoá đơn, DB riêng{' '}
          <code>ewallet_bill_payment</code>. Biller <strong>hoàn toàn mock</strong> (due amount = hash
          deterministic của category+customerCode), gọi <code>wallet-service</code>'s <code>/debit</code> với{' '}
          <code>type=BILL_PAYMENT</code> khi thanh toán thành công.
        </li>
      </ul>
      <p className="dim">
        Cả 2 service này gọi thẳng REST vào <code>wallet-service</code> (không qua Kafka) vì cần biết kết quả
        debit/credit ngay trong cùng request — khác hẳn luồng nạp tiền ở trên, vốn dĩ đã bất đồng bộ do phải chờ
        ngân hàng xử lý.
      </p>

      <h2>Vì sao mỗi service có DB riêng</h2>
      <p>
        Tránh anti-pattern chia sẻ database giữa các microservice — bài học lặp lại từ <code>payment-hub</code>{' '}
        (Q&amp;A 3.77, sách <em>Cracking Spring Microservices Interviews</em>). Nếu <code>wallet-service</code> cần
        biết số điện thoại người dùng, nó gọi API của <code>user-service</code>, không join thẳng bảng{' '}
        <code>users</code>.
      </p>

      <h2>Đồng bộ vs bất đồng bộ — chọn theo tình huống</h2>
      <ul>
        <li>
          <strong>REST đồng bộ</strong>: mọi lệnh gọi <code>credit</code>/<code>debit</code> cần biết kết quả ngay
          (đủ số dư hay không) → không hợp với async.
        </li>
        <li>
          <strong>Kafka bất đồng bộ</strong>: xác nhận nạp tiền từ ngân hàng vốn dĩ không tức thời (ngân hàng xử lý
          mất thời gian) → ép đồng bộ ở đây sẽ tạo ra timeout giả.
        </li>
      </ul>
    </section>
  );
}
