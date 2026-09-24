import { Crumb, FieldsTable, Note, PageLink } from '../components';

export default function WebClient() {
  return (
    <section className="page">
      <Crumb parts={['Frontend']} />
      <h1>Microfrontend architecture</h1>
      <p className="lede">
        React web client tại <code>engineering/frontend/projects/ewallet-lab/</code> — một micro-app cho mỗi
        backend service, ghép lại bằng Module Federation. Xem <code>DESIGN.md</code> trong thư mục đó để đọc phân
        tích đầy đủ (so sánh iframes/Web Components/Module Federation, vì sao không dùng shared React Context giữa
        các remote).
      </p>

      <h2>Micro-app map</h2>
      <FieldsTable
        head={['Micro-app', 'Expose', 'Gọi service', 'Port']}
        rows={[
          ['shell', '—', 'không gọi trực tiếp', <code>5173</code>],
          ['mfe-auth', <code>./App</code>, 'user-service', <code>5174</code>],
          [
            'mfe-wallet',
            <>
              <code>./Home</code>, <code>./History</code>,<br />
              <code>./AllServices</code>, <code>./Notifications</code>
            </>,
            'wallet-service',
            <code>5175</code>,
          ],
          ['mfe-topup', <code>./App</code>, 'topup-service', <code>5176</code>],
          ['mfe-transfer', <code>./App</code>, 'transfer-service, user-service, topup-service', <code>5177</code>],
          ['mfe-bill-payment', <code>./App</code>, 'bill-payment-service', <code>5178</code>],
        ]}
      />
      <p className="dim">
        <code>AllServices</code> và <code>Notifications</code> là 2 màn hình mới của <code>mfe-wallet</code> (không
        phải service mới) — xem trang <PageLink to="frontend-design">Design &amp; UI system</PageLink> cho chi
        tiết luồng.
      </p>

      <h2>Vì sao Module Federation, không phải iframe/Web Components</h2>
      <p>
        Backend đã là microservices độc lập triển khai — một SPA React monolith gọi cả 6 service từ một codebase
        sẽ xoá bỏ ranh giới đó ở phía UI. Module Federation (qua <code>@module-federation/vite</code>) cho mỗi
        micro-app có <code>vite build</code>, <code>dist/</code>, và khả năng deploy độc lập riêng — đúng tính
        chất các backend service đã có, chỉ là ở tầng frontend.
      </p>

      <h2>State giữa các app: props, không phải Context dùng chung</h2>
      <Note kind="warn" icon="!">
        <p>
          Một cạm bẫy Module Federation phổ biến: dù <code>react</code> được share dạng singleton, một{' '}
          <code>React.createContext()</code> compile trong bundle của <code>mfe-wallet</code> và một cái compile
          trong bundle của <code>shell</code> là <strong>hai object khác nhau</strong> — Provider ở bundle này
          không được Consumer ở bundle kia nhìn thấy, và lỗi này im lặng (rơi về default value) chứ không throw.
        </p>
      </Note>
      <p>
        Lab này né hoàn toàn bằng cách để <code>shell</code> là chủ sở hữu duy nhất của session (
        <code>packages/session/src/useSession.ts</code>) và truyền <code>session</code> + callback (
        <code>onAuthenticated</code>, <code>onTopup</code>, <code>onDone</code>...) xuống dạng props cho remote
        đang được mount — không có state nào băng qua ranh giới federation ngoài props.
      </p>

      <h2>UX bám theo nguồn thật của MoMo</h2>
      <p>
        Xem trang <PageLink to="momo-spec">MoMo spec references</PageLink> cho danh sách đầy đủ nguồn UX/brand đã
        dùng, và trang <PageLink to="frontend-design">Design &amp; UI system</PageLink> cho cách áp dụng cụ thể
        (bottom nav 5 tab, màu MoMo pink, icon set...).
      </p>

      <h2>Giới hạn đã biết</h2>
      <Note kind="gap" icon="!">
        <p>
          Đã test qua trình duyệt thật (người dùng trực tiếp thao tác trên bản triển khai Kubernetes local — xem{' '}
          <PageLink to="deploy-k8s">Kubernetes (local)</PageLink>), không chỉ verify bằng <code>vite build</code>.
          Chưa dùng routing library — điều hướng bằng <code>useState</code> đơn giản trong shell (camera QR,
          payment-link, split-bill... vẫn còn comingSoon, xem <PageLink to="roadmap">Roadmap</PageLink>).
        </p>
      </Note>
    </section>
  );
}
