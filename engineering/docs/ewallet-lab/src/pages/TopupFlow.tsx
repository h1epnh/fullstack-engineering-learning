import { Crumb, FlowDiagram, Note, PageLink } from '../components';

export default function TopupFlow() {
  return (
    <section className="page">
      <Crumb parts={['Architecture', 'Data flow']} />
      <h1>Luồng nạp tiền (Top-up)</h1>
      <p className="lede">
        Mô phỏng đúng cơ chế thật của MoMo: phản hồi tức thời (ACK) và xác nhận tiền đã vào ví (IPN) là{' '}
        <strong>hai sự kiện tách rời theo thời gian</strong>.
      </p>

      <FlowDiagram
        steps={[
          { n: '1', t: 'Client gọi topup-service', d: <><code>POST /topups</code> {'{userId, amount}'}</> },
          { n: '2', t: 'topup-service → bank gateway', d: 'Collection Link request, ký HMAC-SHA256' },
          { n: '3', t: 'ACK tức thời', d: 'resultCode=0, payUrl — CHƯA phải tiền vào ví' },
          { n: '4', t: 'IPN xác nhận (async)', d: 'Bank gateway gọi ngược, ~0.5–2.5s sau', confirm: true },
          { n: '5–6', t: 'Kafka → wallet-service', d: 'Cộng số dư, ghi Transaction', confirm: true },
        ]}
      />

      <h2>Vì sao tách 2 bước 3 và 4</h2>
      <p>
        Đây là lỗi hiểu sai phổ biến nhất khi tích hợp cổng thanh toán:{' '}
        <strong>response 200 của bước tạo giao dịch không có nghĩa là tiền đã chuyển</strong>. Ngân hàng/PSP xử lý
        giao dịch thật cần thời gian; chỉ IPN (webhook bất đồng bộ) mới là nguồn sự thật cuối cùng.{' '}
        <code>topup-service</code> giữ trạng thái <code>PENDING</code> cho tới khi IPN xác nhận.
      </p>

      <Note kind="gap" icon="!">
        <p>
          <strong>Gap đã biết:</strong> <code>IpnController</code> hiện chưa verify chữ ký của chính IPN (khác công
          thức chữ ký của request tạo giao dịch) — công thức IPN signature cụ thể chưa được xác nhận từ tài liệu đã
          fetch. Xem mục <PageLink to="momo-spec">MoMo spec references</PageLink>.
        </p>
      </Note>
    </section>
  );
}
