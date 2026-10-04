import { BizFeature, Crumb, Note, PageLink } from '../../components';

export default function BizTransferPayments() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Chuyển tiền & Thanh toán']} />
      <h1>Chuyển tiền, Nạp/Rút tiền & Thanh toán hoá đơn</h1>
      <p className="lede">
        5 tính năng chuyển/thanh toán tiền cốt lõi. Tất cả đều chịu sự chi phối của{' '}
        <PageLink to="biz-limits">Giới hạn & xác thực giao dịch</PageLink> — trang này chỉ nhắc lại phần áp dụng
        riêng cho từng tính năng, không lặp lại toàn bộ chi tiết.
      </p>

      <BizFeature
        status="done"
        title="Chuyển tiền (P2P nội bộ)"
        what="Chuyển tiền trực tiếp cho một người dùng Ewallet Lab khác bằng số điện thoại của họ."
        rules={[
          'Tối đa 100.000.000đ mỗi lần chuyển (tầng 1).',
          'Cộng dồn chung với rút tiền + thanh toán hoá đơn trong cùng tháng, tổng không vượt 100.000.000đ (tầng 2, theo quy định NHNN).',
          'Chuyển trên 10 triệu đồng/lần, hoặc tổng giao dịch trong ngày đạt 20 triệu đồng, cần xác thực bổ sung trước khi chuyển.',
        ]}
        source="Điều 26 TT 40/2024/TT-NHNN (sửa bởi TT 41/2025) + QĐ 2345/QĐ-NHNN."
      />

      <BizFeature
        status="done"
        title="Nạp / Rút tiền"
        what="Nạp tiền vào ví từ một ngân hàng đã liên kết, hoặc rút tiền từ ví ra ngân hàng."
        rules={[
          'Nạp tối đa 50.000.000đ/lần, rút tối đa 50.000.000đ/lần (tầng 1, theo hạn mức MoMo công bố).',
          'Rút tiền tính vào hạn mức cộng dồn theo tháng (tầng 2) cùng nhóm với chuyển tiền/thanh toán hoá đơn — nạp tiền thì KHÔNG tính vào hạn mức này.',
          'Cả nạp lẫn rút đều có thể cần xác thực bổ sung nếu vượt ngưỡng 10 triệu đồng/lần hoặc 20 triệu đồng/ngày cộng dồn — nạp tiền cũng bị kiểm tra dù không tính vào hạn mức tháng.',
          'Nạp tiền không cộng vào ví ngay lập tức — hệ thống phải chờ xác nhận từ "ngân hàng" (mô phỏng) trước khi số dư thực sự tăng, giống cách các ví điện tử thật xử lý nạp tiền qua ngân hàng liên kết.',
        ]}
        source="Hạn mức MoMo công bố + Điều 26 TT 40/2024/TT-NHNN + QĐ 2345/QĐ-NHNN; cơ chế xác nhận nạp tiền mô phỏng đúng luồng MoMo Collection Link + IPN thật."
      />

      <BizFeature
        status="done"
        title="Nhận tiền (QR cá nhân)"
        what="Hiển thị mã QR cá nhân để người khác quét và chuyển tiền cho mình."
        rules={[
          'Về bản chất đây chính là một lần "Chuyển tiền (P2P nội bộ)" do người quét khởi tạo — không có quy tắc hạn mức/xác thực riêng nào khác, áp dụng y hệt mục Chuyển tiền ở trên.',
        ]}
      />

      <BizFeature
        status="done"
        title="QR Thanh toán (quét QR để chuyển)"
        what="Quét mã QR của một người dùng Ewallet Lab khác để tự động điền thông tin người nhận, thay vì gõ tay số điện thoại."
        rules={[
          'Cũng là một lần Chuyển tiền (P2P nội bộ) — chỉ khác cách nhập người nhận, áp dụng cùng quy tắc hạn mức/xác thực của mục Chuyển tiền.',
          'Chỉ nhận diện được mã QR riêng của Ewallet Lab — chưa quét/giải mã được QR ngân hàng/VietQR thật (tính năng "Quét mọi QR" vẫn đang Sắp có, xem trang riêng).',
        ]}
      />

      <BizFeature
        status="done"
        title="Thanh toán hoá đơn"
        what="Tra cứu và thanh toán một hoá đơn (điện, nước, v.v. — hoàn toàn mô phỏng, không phải nhà cung cấp dịch vụ thật nào)."
        rules={[
          'Tối đa 50.000.000đ/lần — cùng nhóm "tiền ra khỏi ví" với rút tiền (tầng 1).',
          'Cộng dồn vào hạn mức theo tháng (tầng 2) cùng với chuyển tiền + rút tiền.',
          'Áp dụng xác thực bổ sung như mọi giao dịch tiền ra khác nếu vượt ngưỡng.',
          'Số tiền hoá đơn luôn do hệ thống tự tính lại tại thời điểm thanh toán — người dùng không thể tự nhập một số tiền khác với số đã được báo lúc tra cứu.',
        ]}
      />

      <Note icon="i">
        <p>
          "Thanh toán hoá đơn" trong lab là dịch vụ <strong>hoàn toàn mô phỏng</strong>: không có nhà cung cấp điện
          nước/viễn thông thật nào đứng sau, số tiền hoá đơn được tính theo một công thức giả lập cố định (cùng mã
          khách hàng luôn ra cùng số tiền), không phải số nợ thật của bất kỳ ai.
        </p>
      </Note>
    </section>
  );
}
