import { Crumb, Ep, FieldName, FieldType, FieldsTable, KvGrid, Note, PageLink } from '../components';

export default function SvcWallet() {
  return (
    <section className="page">
      <Crumb parts={['In-house services', 'wallet-service']} />
      <h1>wallet-service</h1>
      <p className="lede">
        Nguồn sự thật duy nhất về tiền trong ví. Mọi thay đổi số dư đi qua service này — không service nào khác
        được phép tự sửa số dư.
      </p>
      <KvGrid
        items={[
          ['Base URL', 'http://localhost:8091'],
          ['Database', 'ewallet_wallet (Postgres, riêng)'],
          ['Kafka consumer', 'wallet.topup.confirmed'],
        ]}
      />

      <h2>Endpoints</h2>

      <Ep verb="GET" path="/wallets/{userId}/balance" tag="public">
        <p className="ep-desc">
          Tự tạo ví với số dư 0 nếu user chưa có ví (get-or-create) — user-service không cần biết wallet-service
          tồn tại.
        </p>
        <pre className="code">
          {'{\n  '}
          <span className="k">"userId"</span>
          {': '}
          <span className="s">"a1b2c3d4-..."</span>
          {',\n  '}
          <span className="k">"balance"</span>
          {': 100000\n}'}
        </pre>
      </Ep>

      <Ep verb="GET" path="/wallets/{userId}/transactions" tag="public">
        <p className="ep-desc">Sổ giao dịch, mới nhất trước. Append-only — không dòng nào bị sửa sau khi ghi.</p>
      </Ep>

      <Ep verb="POST internal" path="/wallets/{userId}/credit" tag="internal">
        <p className="ep-desc">Gọi bởi service khác (transfer-service, bill-payment-service) hoặc gián tiếp qua Kafka từ topup-service.</p>
        <FieldsTable
          head={['Field', 'Type', 'Ghi chú']}
          rows={[
            [<FieldName required>amount</FieldName>, <FieldType>decimal</FieldType>, '≥ 0.01, ≤ 200.000.000 (issue #6 — xem Note bên dưới)'],
            [
              <FieldName required>type</FieldName>,
              <FieldType>enum</FieldType>,
              'TOPUP · WITHDRAW · TRANSFER_OUT · TRANSFER_IN · BILL_PAYMENT · REFUND',
            ],
            [<FieldName>reference</FieldName>, <FieldType>string</FieldType>, 'Mã giao dịch ngân hàng / user id đối phương'],
            [<FieldName>note</FieldName>, <FieldType>string</FieldType>, '—'],
          ]}
        />
      </Ep>

      <Ep verb="POST internal" path="/wallets/{userId}/debit" tag="internal">
        <p className="ep-desc">
          Cùng field như <code>/credit</code>. Trả <strong>409</strong> nếu số dư không đủ (không cho âm số dư).
        </p>
      </Ep>

      <Note icon="i">
        <p>
          <strong><code>@DecimalMax</code> theo hạn mức MoMo thật đã xác minh (issue #6)</strong>: giới hạn trên
          nêu ở bảng field áp cho endpoint nội bộ này (<code>AdjustBalanceRequest.amount</code> ≤ 200.000.000, mức
          trần số dư ví thật MoMo công bố, dùng làm ceiling chung). Caller cụ thể lại có ngưỡng chặt hơn ở chính
          DTO của mình trước khi gọi vào đây — vd. <code>TopupRequestDto</code>/<code>WithdrawalRequestDto</code> ≤
          50.000.000, <code>TransferRequestDto</code> (P2P) ≤ 100.000.000. Đây là hạn mức <strong>mỗi lần gọi</strong>
          (per-request), <em>không</em> phải tổng cộng dồn theo ngày/tháng — xem trang{' '}
          <PageLink to="roadmap">Roadmap</PageLink> cho gap này.
        </p>
      </Note>

      <Note icon="!">
        <p>
          <strong>Optimistic lock trên <code>Wallet</code> (issue #5)</strong>: khi 2 request debit/credit cùng ví
          chạy đồng thời, service tự retry tối đa 4 lần (đọc lại <code>@Version</code> mới nhất mỗi lần) trước khi
          trả <strong>409</strong> với message "Ví đang được xử lý ở giao dịch khác, vui lòng thử lại" — không bao
          giờ để lộ <code>ObjectOptimisticLockingFailureException</code> thô (500) ra ngoài như trước khi fix.
        </p>
      </Note>
    </section>
  );
}
