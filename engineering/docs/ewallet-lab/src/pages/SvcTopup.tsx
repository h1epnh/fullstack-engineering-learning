import { Crumb, Ep, FieldName, FieldType, FieldsTable, KvGrid, Note, PageLink } from '../components';

export default function SvcTopup() {
  return (
    <section className="page">
      <Crumb parts={['In-house services', 'topup-service']} />
      <h1>topup-service</h1>
      <p className="lede">
        Orchestrator cho luồng nạp tiền — sở hữu liên kết ngân hàng, gọi <code>mock-bank-gateway</code>, chờ IPN
        rồi mới báo <code>wallet-service</code> cộng tiền.
      </p>
      <KvGrid
        items={[
          ['Base URL', 'http://localhost:8092'],
          ['Database', 'ewallet_topup (Postgres, riêng)'],
          ['Kafka producer', 'wallet.topup.confirmed'],
          ['Spec nguồn', 'MoMo Collection Link + IPN — xem trang Partners'],
          ['Health probes', <code>/actuator/health/{'{liveness,readiness}'}</code>],
        ]}
      />

      <h2>Endpoints</h2>

      <Ep verb="POST" path="/linked-bank-accounts" tag="public">
        <p className="ep-desc">
          Không có KYC/xác minh thật (lab) — thực tế liên kết tài khoản ngân hàng là quy trình cần xác minh chủ sở
          hữu, xem Circular 41/45-2025 đã ghi ở payment-hub/BUSINESS.md.
        </p>
        <FieldsTable
          head={['Field', 'Type']}
          rows={[
            [<FieldName required>userId</FieldName>, <FieldType>uuid</FieldType>],
            [<FieldName required>bankCode</FieldName>, <FieldType>string</FieldType>],
            [<FieldName required>accountNumber</FieldName>, <FieldType>string</FieldType>],
          ]}
        />
      </Ep>

      <Ep verb="POST" path="/topups" tag="public">
        <p className="ep-desc">
          Trả <strong>202 Accepted</strong> ngay khi bank gateway ACK — status vẫn là <code>PENDING</code>, chưa
          phải <code>CONFIRMED</code>. Xem <PageLink to="topup-flow">Top-up data flow</PageLink>. Tối thiểu{' '}
          <strong>10.000đ</strong> mỗi lần nạp — khớp mức tối thiểu nạp lần đầu MoMo công bố (xem trang{' '}
          <PageLink to="momo-spec">MoMo spec references</PageLink>).
        </p>
        <pre className="code">
          <span className="c">{'// Request'}</span>
          {'\n{ '}
          <span className="k">"userId"</span>
          {': '}
          <span className="s">"a1b2c3d4-..."</span>
          {', '}
          <span className="k">"amount"</span>
          {': 100000 }\n\n'}
          <span className="c">{'// 202 Accepted'}</span>
          {'\n{ '}
          <span className="k">"orderId"</span>
          {': '}
          <span className="s">"topup-9f3e..."</span>
          {', '}
          <span className="k">"status"</span>
          {': '}
          <span className="s">"PENDING"</span>
          {' }'}
        </pre>
      </Ep>

      <Ep verb="GET" path="/topups/{orderId}" tag="public">
        <p className="ep-desc">
          Poll endpoint này để biết khi nào <code>status</code> chuyển <code>PENDING → CONFIRMED/FAILED</code>.
        </p>
      </Ep>

      <Ep verb="POST internal" path="/ipn/topup" tag="webhook">
        <p className="ep-desc">
          Không gọi trực tiếp — đây là webhook <code>mock-bank-gateway</code> gọi ngược lại. Phải phản hồi{' '}
          <strong>204</strong> trong 15 giây (đúng ràng buộc IPN thật của MoMo).
        </p>
      </Ep>

      <h2>Triển khai (env vars đáng chú ý)</h2>
      <FieldsTable
        head={['Env var', 'Mặc định', 'Ghi chú']}
        rows={[
          [<code>ALLOWED_ORIGIN_PATTERN</code>, <code>http://localhost:*</code>, 'CORS — Helm chart set thành pattern các Ingress host khi chạy trên Kubernetes'],
          [<code>BANK_GATEWAY_URL</code>, <code>http://localhost:8093</code>, 'Trỏ tới mock-bank-gateway'],
          [<code>SELF_BASE_URL</code>, <code>http://localhost:8092</code>, 'Dùng để build ipnUrl gửi cho bank gateway'],
        ]}
      />
      <Note icon="i">
        <p>
          Cả 3 Spring service (user/wallet/topup) đều có <code>spring-boot-starter-actuator</code> với{' '}
          <code>ALLOWED_ORIGIN_PATTERN</code> tương tự — xem trang{' '}
          <PageLink to="deploy-k8s">Kubernetes (local)</PageLink> để biết vì sao (Kubernetes liveness/readiness
          probes cần một endpoint health thật, không đoán mò từ business endpoint).
        </p>
      </Note>
    </section>
  );
}
