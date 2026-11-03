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
          <strong>Đã xử lý (issue #52):</strong> <code>IpnController</code> <strong>verify chữ ký của chính
          IPN</strong> bằng công thức HMAC-SHA256 canonical của MoMo (13 trường, ký tên
          <code>key=value</code> sắp xếp a-z nối bằng <code>&amp;</code>), kèm kiểm tra cửa sổ replay
          theo <code>responseTime</code>. IPN thiếu/sai chữ ký hoặc ngoài cửa sổ replay bị từ chối với
          HTTP 401; IPN khớp số tiền trả về HTTP 400. Shared secret nằm trong K8s Secret
          (<code>bank-gateway-credentials</code>), không hardcode trong image. Xem mục{' '}
          <PageLink to="momo-spec">MoMo spec references</PageLink>.
        </p>
      </Note>
    </section>
  );
}
