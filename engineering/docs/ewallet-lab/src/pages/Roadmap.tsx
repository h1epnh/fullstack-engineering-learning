import { Crumb, PageLink, RoadmapItem, RoadmapList } from '../components';

export default function Roadmap() {
  return (
    <section className="page">
      <Crumb parts={["What's next"]} />
      <h1>Roadmap</h1>
      <p className="lede">Feature đang lên kế hoạch, theo đúng phạm vi đã thống nhất khi thiết kế lab này.</p>

      <RoadmapList>
        <RoadmapItem status="planned" title="Xác thực chữ ký IPN đầy đủ">
          Đóng gap đã ghi ở trang Partners — cần xác nhận công thức IPN signature thật trước khi coi đây là
          production-ready.
        </RoadmapItem>
        <RoadmapItem status="planned" title="Camera QR (own QR + scan), payment-link, split-bill, ...">
          Còn nhiều tile "comingSoon" ở Home screen (xem <code>shell/src/screens/ComingSoon.tsx</code>) — chưa có
          backend hay UI thật, không giả vờ có spec.
        </RoadmapItem>
      </RoadmapList>

      <h2>Đã xong</h2>
      <RoadmapList>
        <RoadmapItem status="done" title="transfer-service — P2P transfer nội bộ">
          Saga đồng bộ: tra cứu người nhận qua user-service, debit người gửi rồi credit người nhận qua
          wallet-service, compensate nếu bước 2 fail. Không qua rail ngoài — khác hẳn mọi luồng trong payment-hub.
          Không có spec MoMo công khai để bám, thiết kế theo logic ví phổ quát. Cố tình không có DB (xem trang{' '}
          <PageLink to="architecture">Architecture</PageLink>).
        </RoadmapItem>
        <RoadmapItem status="done" title="bill-payment-service">
          Tra cứu &amp; thanh toán hoá đơn — <strong>hoàn toàn mock</strong> (due amount = hash deterministic của
          category+customerCode, không phải biller thật nào). Đồng bộ, có DB riêng (<code>ewallet_bill_payment</code>
          ), tái dùng <code>TransactionType.BILL_PAYMENT</code> đã có sẵn từ trước ở wallet-service.
        </RoadmapItem>
        <RoadmapItem status="done" title="Frontend React (microfrontend, MoMo-real-screenshot-driven UI)">
          shell + mfe-auth + mfe-wallet + mfe-topup + mfe-transfer + mfe-bill-payment, Module Federation.
          Home/bottom-nav/onboarding/notifications dựng lại từ ảnh chụp app MoMo thật — xem{' '}
          <PageLink to="frontend-design">Design &amp; UI system</PageLink>. Đã test qua trình duyệt thật.
        </RoadmapItem>
        <RoadmapItem status="done" title="Triển khai Kubernetes (local)">
          10 service trên minikube qua Helm chart, thiết kế portable sang EKS thật — xem{' '}
          <PageLink to="deploy-k8s">Kubernetes (local)</PageLink>.
        </RoadmapItem>
      </RoadmapList>
    </section>
  );
}
