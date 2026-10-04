import { BizFeature, Crumb, Note, PageLink } from '../../components';

export default function BizSocialPayments() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Lì xì, Chia tiền & Nhắc nợ']} />
      <h1>Lì xì, Chia tiền, Link nhận tiền & Nhắc trả tiền</h1>
      <p className="lede">
        4 tính năng cùng một ý tưởng gốc — "một khoản tiền chờ giữa 2 (hoặc nhiều) người" — nhưng mỗi tính năng khác
        nhau ở đúng 1 điểm: <strong>ai được phép trả/nhận, và khi nào tiền thực sự di chuyển</strong>.
      </p>

      <BizFeature
        status="done"
        title="Giật lì xì"
        what="Gửi một khoản tiền mừng cho một người cụ thể qua số điện thoại, giống lì xì điện tử."
        rules={[
          'Số tiền: tối thiểu 1.000đ, tối đa 20.000.000đ mỗi lần — đây là ngưỡng RIÊNG của lì xì, không dùng chung hạn mức 100 triệu đồng/lần của Chuyển tiền.',
          'Tiền bị trừ khỏi ví người gửi NGAY lúc tạo lì xì (trước khi người nhận bấm nhận) — để tránh người gửi tiêu số tiền đó vào giao dịch khác trong lúc chờ người nhận xác nhận.',
          'Nếu sau 48 giờ người nhận chưa nhận, tiền tự động hoàn lại người gửi — không cần ai thao tác gì thêm.',
        ]}
        source="momo.vn/hoi-dap/cach-li-xi-cho-1-nguoi; momo.vn/hoi-dap/gui-li-xi-tren-vi-momo-la-gi (xác minh trực tiếp)."
      />

      <BizFeature
        status="done"
        title="Chia tiền (split-bill)"
        what="Tạo một khoản chi chung và chia cho nhiều người — chia đều hoặc nhập số tiền riêng cho từng người — mỗi người tự trả phần của mình."
        rules={[
          'Chia cho 2–20 người, theo 1 trong 2 cách: chia đều tổng số tiền, hoặc nhập số tiền tuỳ ý cho từng người.',
          'Khi chia đều, phần dư do làm tròn được cộng vào phần của người đầu tiên, để tổng các phần luôn khớp chính xác số tiền gốc.',
          'Mỗi phần chia có một đường link riêng — giống Link nhận tiền, bất kỳ ai có tài khoản hợp lệ cũng trả được phần đó, không giới hạn đúng 1 người cụ thể phải trả.',
        ]}
        source="Luồng thao tác (tạo nhóm → chia đều/tuỳ chỉnh → theo dõi danh sách đã thu) tham khảo UI MoMo đã công bố — MoMo thật đã NGỪNG tính năng này từ 31/08/2025, trang này mô tả một bài tập mô hình nghiệp vụ, không phải một tính năng MoMo đang chạy."
      />

      <BizFeature
        status="done"
        title="Link nhận tiền"
        what="Tạo một đường link để nhận tiền — ai bấm vào link và có tài khoản hợp lệ đều trả được, dùng khi chưa biết chắc ai sẽ là người trả."
        rules={[
          'Không yêu cầu xác thực nào khác ngoài "là người dùng hợp lệ của hệ thống" — đây là đơn giản hoá có chủ đích cho mục đích học tập, không phải một lỗ hổng bảo mật cần vá.',
          'Link tự hết hạn sau 24 giờ nếu chưa ai trả.',
          'Chỉ một người trả được — người trả đầu tiên "thắng", người đến sau sẽ thấy báo khoản này đã được thanh toán.',
        ]}
      />

      <BizFeature
        status="done"
        title="Nhắc trả tiền"
        what="Nhắc đúng một người cụ thể (theo số điện thoại) trả một khoản tiền — khác Link ở chỗ biết rõ ai là người phải trả."
        rules={[
          'Chỉ đúng người được nhắc (xác định theo số điện thoại ngay lúc tạo) mới trả được — không phải "ai bấm trước thì được" như Link nhận tiền.',
          'Không có hạn tự động hết hạn — lời nhắc tồn tại cho tới khi được trả hoặc bị người tạo huỷ.',
        ]}
      />

      <Note icon="i">
        <p>
          Cả 4 tính năng trên đều settle bằng đúng 1 lần gọi vào saga Chuyển tiền (P2P nội bộ) đã có — không có
          đường tắt nào thay đổi số dư ví mà bỏ qua saga đó. Vì vậy quy tắc ở trang{' '}
          <PageLink to="biz-limits">Giới hạn & xác thực giao dịch</PageLink> (hạn mức mỗi lần/theo tháng, xác thực bổ
          sung) vẫn áp dụng đầy đủ cho từng lần trả Link/Nhắc trả tiền/Chia tiền — ngưỡng riêng 1.000đ–20.000.000đ ở
          trên chỉ áp dụng cho Giật lì xì.
        </p>
      </Note>
    </section>
  );
}
