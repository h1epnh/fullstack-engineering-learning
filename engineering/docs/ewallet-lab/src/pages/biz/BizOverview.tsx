import { Crumb, Note, PageLink } from '../../components';

export default function BizOverview() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Tổng quan']} />
      <h1>Nghiệp vụ Ewallet Lab</h1>
      <p className="lede">
        Không gian này dịch lại đúng những quy tắc nghiệp vụ đã được nghiên cứu/xác minh cho{' '}
        <code>ewallet-lab</code> (xem không gian <strong>Developer</strong> để đọc kiến trúc/API) sang ngôn ngữ phi
        kỹ thuật — <strong>tại sao</strong> một tính năng hoạt động theo cách nó hoạt động, không chỉ nó "là gì".
      </p>

      <Note icon="i">
        <p>
          Mọi quy tắc nghiệp vụ ở đây đều dịch lại nguyên văn từ backend <code>DESIGN.md</code> (số liệu, ngưỡng,
          nguồn trích dẫn MoMo/Thông tư-Quyết định NHNN/ZaloPay/VNPay tham khảo...) — không có nghiệp vụ nào được tự
          suy diễn thêm. Phần nào DESIGN.md không có nguồn thật thì trang tương ứng cũng nói rõ "tự thiết kế theo
          logic phổ quát", không giả vờ đã bám sát một sản phẩm thật.
        </p>
      </Note>

      <h2>Đọc gì trước</h2>
      <p>
        Trang quan trọng nhất trong không gian này là{' '}
        <PageLink to="biz-limits">Giới hạn & xác thực giao dịch</PageLink> — một bộ quy tắc áp dụng xuyên suốt hầu
        hết tính năng chuyển/rút/nạp/thanh toán tiền, không phải 1 tính năng đơn lẻ. Nên đọc trang đó trước khi đọc
        các trang tính năng còn lại, vì mọi trang tính năng "Đã có" bên dưới đều tham chiếu ngược lại nó.
      </p>

      <h2>Cấu trúc không gian Business</h2>
      <ul>
        <li>
          <PageLink to="biz-limits">Giới hạn & xác thực giao dịch</PageLink> — 2 tầng hạn mức (mỗi lần / theo tháng)
          + xác thực bổ sung khi giao dịch lớn.
        </li>
        <li>
          <PageLink to="biz-transfer-payments">Chuyển tiền, Nạp/Rút, Hoá đơn</PageLink> — 5 tính năng chuyển/thanh
          toán tiền cốt lõi.
        </li>
        <li>
          <PageLink to="biz-social-payments">Lì xì, Chia tiền, Link & Nhắc trả tiền</PageLink> — 4 tính năng "tiền
          chờ giữa 2 người" với quy tắc khác nhau.
        </li>
        <li>
          <PageLink to="biz-family-savings">Ví Gia đình, Túi Thần Tài</PageLink> — 2 tính năng quản lý tiền nằm
          ngoài luồng chuyển/thanh toán thông thường.
        </li>
        <li>
          <PageLink to="biz-fund-spending">Quỹ nhóm, Quản lý chi tiêu</PageLink> — 2 tính năng mới nhất được wire
          thật, một tính năng nhiều người cùng giữ 1 quỹ, một tính năng tự tổng hợp chi tiêu.
        </li>
        <li>
          <PageLink to="biz-coming-soon">Chưa làm thật (Sắp có)</PageLink> — các mục còn lại trên UI, vì sao chưa có
          backend thật đứng sau.
        </li>
      </ul>

      <h2>Trạng thái</h2>
      <p>
        13 tính năng đã liệt kê ở các trang trên đều <strong>Đã có</strong> thật (nối backend thật, không phải mock
        UI) tại thời điểm viết trang này — đối chiếu trực tiếp với code (<code>Home.tsx</code>,{' '}
        <code>TransferHome.tsx</code>) mỗi khi có nghi ngờ, vì danh sách này có thể thay đổi theo thời gian.
      </p>
    </section>
  );
}
