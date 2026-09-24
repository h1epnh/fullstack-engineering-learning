import { Crumb, Ep, FieldName, FieldType, FieldsTable, KvGrid } from '../components';

export default function SvcUser() {
  return (
    <section className="page">
      <Crumb parts={['In-house services', 'user-service']} />
      <h1>user-service</h1>
      <p className="lede">Quản lý danh tính người dùng theo số điện thoại — không có OTP/xác thực thật (lab).</p>
      <KvGrid
        items={[
          ['Base URL', 'http://localhost:8090'],
          ['Database', 'ewallet_user (Postgres, riêng)'],
          ['Nguồn', 'engineering/backend/projects/ewallet-lab/user-service'],
        ]}
      />

      <h2>Endpoints</h2>

      <Ep verb="POST" path="/users/register" tag="public">
        <p className="ep-desc">Tạo user mới. 409 nếu số điện thoại đã tồn tại.</p>
        <FieldsTable
          head={['Field', 'Type', 'Ghi chú']}
          rows={[
            [
              <FieldName required>phone</FieldName>,
              <FieldType>string</FieldType>,
              <>
                Regex <code>^0\d{'{9}'}$</code>
              </>,
            ],
            [<FieldName required>name</FieldName>, <FieldType>string</FieldType>, '—'],
          ]}
        />
        <pre className="code">
          <span className="c">{'// 201 Created'}</span>
          {'\n{\n  '}
          <span className="k">"id"</span>
          {': '}
          <span className="s">"a1b2c3d4-..."</span>
          {',\n  '}
          <span className="k">"phone"</span>
          {': '}
          <span className="s">"0912345678"</span>
          {',\n  '}
          <span className="k">"name"</span>
          {': '}
          <span className="s">"Nguyen Van A"</span>
          {'\n}'}
        </pre>
      </Ep>

      <Ep verb="GET" path="/users/{id}" tag="public">
        <p className="ep-desc">404 nếu không tồn tại.</p>
      </Ep>

      <Ep verb="GET" path="/users/by-phone/{phone}" tag="internal">
        <p className="ep-desc">
          Dùng bởi <code>transfer-service</code> để tra cứu người nhận theo số điện thoại khi chuyển tiền P2P.
        </p>
      </Ep>
    </section>
  );
}
