import { Crumb, Note, SvcCard } from '../components';

export default function Overview() {
  return (
    <section className="page">
      <Crumb parts={['Overview']} />
      <h1>Ewallet Lab</h1>
      <p className="lede">
        Nội bộ tài liệu kỹ thuật cho một hệ microservices mô phỏng chức năng tài chính của ví điện tử kiểu MoMo —
        viết cho chính người xây dựng nó, theo đúng cách MoMo/Stripe cấu trúc developer portal của họ.
      </p>

      <h2>Vantage point</h2>
      <p>
        <code>payment-hub</code> (dự án song song) mô phỏng một <strong>ngân hàng gọi ra ví điện tử</strong> như một
        rail bên ngoài. <code>ewallet-lab</code> đứng ở phía đối diện: mô phỏng <strong>chính nhà cung cấp ví</strong>{' '}
        tự vận hành hệ thống nội bộ của họ — số dư, sổ giao dịch, liên kết ngân hàng, nạp/rút tiền.
      </p>
      <Note icon="i">
        <p>
          Hai project dùng chung 1 khái niệm domain (thanh toán/ví điện tử VN) nhưng nhìn từ 2 phía khác nhau của
          cùng 1 giao dịch — hữu ích để hiểu cả 2 bên của một API contract.
        </p>
      </Note>

      <h2>Sáu service đã dựng</h2>
      <div className="svc-grid">
        <SvcCard
          to="svc-user"
          lang="Java · Spring Boot"
          name="user-service"
          port=":8090"
          desc="Đăng ký & tra cứu người dùng theo số điện thoại."
        />
        <SvcCard
          to="svc-wallet"
          lang="Java · Spring Boot"
          name="wallet-service"
          port=":8091"
          desc="Chủ sở hữu duy nhất của số dư và sổ giao dịch."
        />
        <SvcCard
          to="svc-topup"
          lang="Java · Spring Boot"
          name="topup-service"
          port=":8092"
          desc="Orchestrator nạp tiền — mô phỏng MoMo Collection Link."
        />
        <SvcCard
          to="partner-bank"
          lang="Go"
          name="mock-bank-gateway"
          port=":8093"
          desc="Đóng vai ngân hàng liên kết, gửi IPN bất đồng bộ."
        />
        <SvcCard
          to="architecture"
          lang="Java · Spring Boot"
          name="transfer-service"
          port=":8094"
          desc="Saga P2P chuyển tiền nội bộ — cố tình không có DB, xem trang Architecture."
        />
        <SvcCard
          to="architecture"
          lang="Java · Spring Boot"
          name="bill-payment-service"
          port=":8095"
          desc="Tra cứu & thanh toán hoá đơn — biller hoàn toàn mock, xem trang Architecture."
        />
      </div>
    </section>
  );
}
