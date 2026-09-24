import { Crumb, FieldsTable, Note, PageLink } from '../components';

export default function DeployK8s() {
  return (
    <section className="page">
      <Crumb parts={['Deployment', 'Kubernetes (local)']} />
      <h1>Kubernetes (local)</h1>
      <p className="lede">
        Toàn bộ 12 service (6 backend + 6 frontend micro-app), cộng 3 hạ tầng (Postgres, Kafka, Zookeeper) — 15
        Deployment tổng cộng — chạy trên minikube, đóng gói bằng Helm, thiết kế để
        chuyển sang EKS thật chỉ bằng cách đổi values file — xem <code>deploy/helm/ewallet-lab/</code> trong{' '}
        <code>engineering/backend/projects/ewallet-lab/</code>.
      </p>

      <Note kind="warn" icon="!">
        <p>
          Real AWS EKS không chạy được ở local — đây là một cluster Kubernetes cục bộ (minikube) với manifest
          <em> có cấu trúc</em> để port sang EKS thật sau này (đổi registry, ingress class, storage class), không
          phải EKS thật.
        </p>
      </Note>

      <h2>Chuẩn bị</h2>
      <pre className="code">
        {'minikube start --cpus=4 --memory=8192\nminikube addons enable ingress\nbrew install helm   '}
        <span className="c">{'# chưa có sẵn'}</span>
        {'\neval $(minikube docker-env)   '}
        <span className="c">{'# build image thẳng vào docker daemon của minikube, không cần registry'}</span>
      </pre>

      <h2>Build 12 image</h2>
      <p>
        6 backend dùng Dockerfile Gradle (Java) hoặc Go có sẵn. 6 frontend cần build-arg trỏ URL thật (Ingress
        host) vì <code>import.meta.env.VITE_*</code> của Vite được bake vào bundle tĩnh <strong>lúc build</strong>,
        không đọc được lúc runtime — <strong>quên 1 build-arg khi thêm remote mới (vd. lúc thêm mfe-transfer,
        mfe-bill-payment) là lỗi tái diễn thật</strong>, biểu hiện giống hệt lỗi CORS dù CORS config hoàn toàn
        đúng:
      </p>
      <pre className="code">
        {'docker build -f shell/Dockerfile \\\n'}
        {'  --build-arg MFE_AUTH_ENTRY_URL=http://mfe-auth.ewallet-lab.local/remoteEntry.js \\\n'}
        {'  --build-arg MFE_WALLET_ENTRY_URL=http://mfe-wallet.ewallet-lab.local/remoteEntry.js \\\n'}
        {'  --build-arg MFE_TOPUP_ENTRY_URL=http://mfe-topup.ewallet-lab.local/remoteEntry.js \\\n'}
        {'  --build-arg MFE_TRANSFER_ENTRY_URL=http://mfe-transfer.ewallet-lab.local/remoteEntry.js \\\n'}
        {'  --build-arg MFE_BILL_PAYMENT_ENTRY_URL=http://mfe-bill-payment.ewallet-lab.local/remoteEntry.js \\\n'}
        {'  -t ewallet-lab/shell:local .'}
      </pre>

      <h2>Helm chart</h2>
      <FieldsTable
        head={['File', 'Vai trò']}
        rows={[
          [<code>values.yaml</code>, 'Mặc định chung (image tag, port, corsAllowedOriginPattern...)'],
          [<code>values-local.yaml</code>, 'Profile minikube: pullPolicy Never, ingressClassName nginx'],
          [
            <code>values-eks.yaml</code>,
            'Toàn bộ comment, KHÔNG chạy được — ghi rõ thứ gì sẽ khác trên EKS thật (ECR, ALB, RDS, MSK, External Secrets Operator)',
          ],
        ]}
      />
      <p className="dim">
        15 Deployment/Service theo cùng một khuôn (không copy-paste logic riêng): postgres, zookeeper, kafka, 5
        Spring service (user/wallet/topup/transfer/bill-payment), mock-bank-gateway (Go), 6 frontend micro-app
        (shell, mfe-auth, mfe-wallet, mfe-topup, mfe-transfer, mfe-bill-payment).
      </p>

      <h2>Ingress: host-based, không phải path-based</h2>
      <p>
        6 hostname frontend (<code>shell.ewallet-lab.local</code>, <code>mfe-auth.ewallet-lab.local</code>,{' '}
        <code>mfe-wallet.ewallet-lab.local</code>, <code>mfe-topup.ewallet-lab.local</code>,{' '}
        <code>mfe-transfer.ewallet-lab.local</code>, <code>mfe-bill-payment.ewallet-lab.local</code>) thay vì
        path-prefix — tránh phải chỉnh <code>base</code> path của Vite cho từng static bundle. Backend API dùng 1
        host path-routed (<code>api.ewallet-lab.local/users</code>, <code>/wallets</code>, <code>/topups</code>,{' '}
        <code>/transfers</code>, <code>/bill-payment</code>...) vì REST endpoint không có vấn đề base-path.
      </p>
      <p>
        Trên macOS + Docker driver, <code>minikube ip</code> không routable trực tiếp từ host — cần{' '}
        <code>sudo minikube tunnel</code> chạy nền, và <code>/etc/hosts</code> trỏ các hostname trên về{' '}
        <code>127.0.0.1</code>.
      </p>

      <h2>2 lỗi thật gặp phải khi triển khai</h2>
      <Note kind="gap" icon="!">
        <p>
          <strong>1. Kafka/Zookeeper <code>:latest</code> đổi sang KRaft-only mặc định.</strong> Image{' '}
          <code>confluentinc/cp-kafka:latest</code> giờ không còn hiểu <code>KAFKA_ZOOKEEPER_CONNECT</code> nữa —
          crash ngay khi khởi động. Sửa bằng cách pin về <code>7.5.3</code> (bản Zookeeper-mode cuối còn phổ biến)
          cho cả Helm chart lẫn <code>docker-compose.yml</code> gốc.
        </p>
      </Note>
      <Note kind="gap" icon="!">
        <p>
          <strong>2. Kubernetes tự tiêm biến môi trường kiểu Docker-links cũ.</strong> Mọi pod trong namespace tự
          động có <code>KAFKA_PORT=tcp://10.x.x.x:9092</code> (từ Service tên "kafka") — entrypoint của Confluent
          đọc nhầm thành config <code>port</code> và crash. Sửa bằng{' '}
          <code>enableServiceLinks: false</code> trên <strong>mọi</strong> pod trong chart, không chỉ kafka, để
          tránh lớp lỗi này tái diễn ở service khác trong tương lai.
        </p>
      </Note>

      <h2>Deploy &amp; verify</h2>
      <pre className="code">
        {'helm install ewallet-lab deploy/helm/ewallet-lab \\\n'}
        {'  -f deploy/helm/ewallet-lab/values-local.yaml -n ewallet-lab --create-namespace\n\n'}
        {'kubectl -n ewallet-lab get pods -w\n\n'}
        <span className="c">{'# health thật, không đoán mò từ business endpoint'}</span>
        {'\nkubectl -n ewallet-lab exec deploy/user-service -- \\\n'}
        {'  curl -s localhost:8090/actuator/health/readiness'}
      </pre>
      <p>
        Xong: mở <code>http://shell.ewallet-lab.local</code> — flow đăng ký → onboarding → liên kết ngân hàng →
        nạp tiền → số dư cập nhật đã được test thật qua trình duyệt trên bản triển khai này (không chỉ verify
        build), xem thêm ở <PageLink to="web-client">Microfrontend architecture</PageLink>.
      </p>
    </section>
  );
}
