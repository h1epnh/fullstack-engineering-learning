import { Crumb, Ep, KvGrid } from '../components';

export default function PartnerBank() {
  return (
    <section className="page">
      <Crumb parts={['Partners & specs', 'mock-bank-gateway']} />
      <h1>mock-bank-gateway</h1>
      <p className="lede">
        Đóng vai "ngân hàng liên kết" từ góc nhìn của <code>topup-service</code> — service duy nhất viết bằng Go
        trong lab này.
      </p>
      <KvGrid
        items={[
          ['Base URL', 'http://localhost:8093'],
          ['Ngôn ngữ', 'Go (net/http thuần, không framework)'],
        ]}
      />

      <h2>Endpoint</h2>
      <Ep verb="POST" path="/v2/gateway/api/create" tag="partner">
        <p className="ep-desc">
          Cùng path MoMo Collection Link thật dùng. Verify chữ ký HMAC-SHA256 trước khi ACK; nếu sai, trả{' '}
          <code>resultCode: 1001</code>.
        </p>
        <pre className="code">
          <span className="c">{'// Request (từ topup-service)'}</span>
          {'\n{\n  '}
          <span className="k">"partnerCode"</span>
          {': '}
          <span className="s">"EWALLET_LAB_PARTNER"</span>
          {',\n  '}
          <span className="k">"requestId"</span>
          {': '}
          <span className="s">"req-..."</span>
          {',\n  '}
          <span className="k">"amount"</span>
          {': 100000,\n  '}
          <span className="k">"orderId"</span>
          {': '}
          <span className="s">"topup-9f3e..."</span>
          {',\n  '}
          <span className="k">"orderInfo"</span>
          {': '}
          <span className="s">"ewallet-lab top-up #topup-9f3e..."</span>
          {',\n  '}
          <span className="k">"ipnUrl"</span>
          {': '}
          <span className="s">"http://topup-service:8092/ipn/topup"</span>
          {',\n  '}
          <span className="k">"requestType"</span>
          {': '}
          <span className="s">"payWithMethod"</span>
          {',\n  '}
          <span className="k">"signature"</span>
          {': '}
          <span className="s">"…hmac-sha256 hex…"</span>
          {'\n}\n\n'}
          <span className="c">{'// Response tức thời — chưa phải xác nhận tiền đã chuyển'}</span>
          {'\n{ '}
          <span className="k">"resultCode"</span>
          {': 0, '}
          <span className="k">"message"</span>
          {': '}
          <span className="s">"Successful."</span>
          {', '}
          <span className="k">"payUrl"</span>
          {': '}
          <span className="s">"…"</span>
          {' }'}
        </pre>
        <p className="dim">
          Sau đó, trong 1 goroutine riêng, gateway ngủ 0.5–2.5s (giả lập thời gian ngân hàng xử lý thật) rồi{' '}
          <code>POST</code> IPN ngược lại <code>ipnUrl</code> — ~7% được set thất bại có chủ đích để luyện đường
          lỗi.
        </p>
      </Ep>
    </section>
  );
}
