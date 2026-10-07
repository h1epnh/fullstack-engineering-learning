import { BizFeature, Crumb, Note } from '../../components';

export default function BizFundSpending() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Quỹ nhóm & Quản lý chi tiêu']} />
      <h1>Quỹ nhóm & Quản lý chi tiêu</h1>
      <p className="lede">
        2 tính năng mới nhất đã nối backend thật (issue #14 và #16) — một tính năng về{' '}
        <strong>nhiều người cùng giữ một quỹ tiền chung</strong>, một tính năng về{' '}
        <strong>tự động tổng hợp lại tiền chính mình đã chi</strong>. Cả 2 trước đây từng nằm trong trang{' '}
        <em>Chưa làm thật (Sắp có)</em> — đã chuyển sang đây khi được wire thật.
      </p>

      <BizFeature
        status="done"
        title="Quỹ nhóm"
        what="Nhiều người cùng tạo một quỹ chung (đi du lịch, sinh hoạt, tiết kiệm nhóm...), góp tiền vào quỹ trực tiếp từ ví cá nhân; chỉ người tạo quỹ mới được rút tiền ra ví của mình hoặc giải thể quỹ (rút hết, đóng quỹ vĩnh viễn)."
        rules={[
          'MVP của lab đơn giản hoá HƠN cả MoMo thật: MoMo thật có luồng "thành viên gửi yêu cầu rút, chủ quỹ phải duyệt mới được rút". Lab này KHÔNG có bước duyệt trung gian đó — chỉ người tạo quỹ (creator) được tự rút trực tiếp; thành viên hoàn toàn không có quyền khởi tạo một yêu cầu rút.',
          'Số tiền tối thiểu mỗi lần góp/rút là 1.000đ — đúng số thật công bố trên momo.vn/quy-nhom. Nhưng các hạn mức SỐ LƯỢNG khác của MoMo thật (tối đa 2 quỹ tự tạo/tài khoản, 20 quỹ tham gia/tài khoản, 200 thành viên/quỹ, trần 25.000.000đ/quỹ) KHÔNG được áp dụng trong lab này — chỉ ghi nhận lại để không bịa số khác.',
          'Góp quỹ trên 10.000.000đ/lần cần xác thực bổ sung (step-up) — áp dụng đúng quy tắc chung của toàn hệ thống, xem trang Giới hạn & xác thực giao dịch.',
          'Không có lãi suất trên số dư quỹ (khác với Túi Thần Tài) và không có giới hạn thời gian tồn tại của quỹ — MoMo thật cũng không công bố 2 điều này.',
          'Chỉ thành viên đã được mời mới xem/góp được quỹ; mời thành viên qua tra số điện thoại đã có tài khoản, và chỉ người tạo quỹ mới được mời — quỹ không có khái niệm "thành viên tự xin tham gia" hay "thành viên tự rời quỹ" trong MVP này.',
        ]}
        source="momo.vn/quy-nhom (fetch trực tiếp) + backend DESIGN.md mục 'Quỹ nhóm (issue #14)'."
      />

      <BizFeature
        status="done"
        title="Quản lý chi tiêu"
        what="Báo cáo tự động tổng hợp số tiền đã chi tuần này/tháng này, tính thẳng từ lịch sử giao dịch ví đã có sẵn — không cần người dùng tự nhập tay bất cứ gì."
        rules={[
          '"Chi tiêu" chỉ tính 3 loại giao dịch: rút tiền, chuyển tiền đi, thanh toán hoá đơn. Nạp tiền và nhận tiền KHÔNG được tính là chi tiêu.',
          'MoMo thật có 4 phần (Sổ chi tiêu theo danh mục tự đặt, Ngân sách, Báo cáo tuần/tháng, Chatbot trợ lý chi tiêu AI). Lab này chỉ làm đúng phần "Báo cáo" — không có category tự đặt tên, không có đặt ngân sách/cảnh báo vượt mức, không có chatbot AI.',
          '"Tuần" tính theo lịch ISO-8601 (thứ Hai 00:00 giờ server là đầu tuần, đúng quy ước Việt Nam) — không phải một cửa sổ trượt 7 ngày gần nhất.',
          'Đây là tính năng đọc (read-only) hoàn toàn — không có bước nhập tay giao dịch ngoài hệ thống, nên không có rủi ro số liệu "tự gõ" sai lệch với tiền thật đã di chuyển.',
        ]}
        source="momo.vn/quan-ly-chi-tieu (fetch trực tiếp 2026-10-03) + backend DESIGN.md mục 'Quản lý chi tiêu (issue #16)'."
      />

      <Note icon="i">
        <p>
          Cả 2 tính năng này từng xuất hiện trong bảng "Sắp có" của trang <em>Chưa làm thật</em> — đã gỡ khỏi bảng đó
          và chuyển nội dung nghiệp vụ sang đây đúng lúc code thật được wire (xem lịch sử: <code>Home.tsx</code>'s{' '}
          <code>spending</code> tile và <code>TransferHome.tsx</code>'s <code>fund</code> tile đều đã mang cờ{' '}
          <code>real</code>/<code>wired</code>, không còn rơi vào màn hình "Sắp ra mắt" chung nữa).
        </p>
      </Note>

      <h2>Case study — rút quỹ dưới tải cao từng làm "mất tiền thật" 3 lần liên tiếp</h2>
      <p>
        Góc nhìn nghiệp vụ, không chỉ kỹ thuật: tính năng Quỹ nhóm trông đơn giản ("rút tiền khỏi quỹ, cộng vào ví")
        nhưng khi nhiều người rút CÙNG LÚC trên cùng 1 quỹ, hệ thống phải tự dò và tự sửa 3 lớp lỗi khác nhau trước
        khi được coi là an toàn để vận hành thật — đúng những gì xảy ra với issue #14 trong dự án này.
      </p>
      <Note kind="warn" icon="!">
        <p>
          <strong>Vì sao đáng lo hơn một bug UI bình thường</strong>: lớp lỗi nặng nhất (phát hiện khi giả lập 60
          lượt rút đồng thời trên 1 quỹ) không phải là "trả lỗi sai" — mà là tiền đã bị trừ khỏi quỹ, nhưng vì một
          bước ghi nhận tiếp theo (cộng vào ví người rút) thất bại đúng lúc hệ thống đang quá tải, số tiền đó tạm
          thời không nằm ở đâu cả trong khi người dùng nhận được thông báo "vui lòng thử lại" — dễ hiểu lầm là lỗi
          tạm thời vô hại, trong khi thực ra tiền đã rời quỹ.
        </p>
        <p>
          Cách hệ thống tự vá: (1) thử lại việc "hoàn tiền về đúng chỗ cũ" nhiều lần hơn hẳn một giao dịch bình
          thường, có độ trễ ngẫu nhiên giữa các lần thử để tránh hàng loạt yêu cầu cùng thức dậy retry cùng lúc; (2)
          nếu vẫn thua hết số lần thử đó — thay vì im lặng trả lỗi chung, hệ thống đánh dấu rõ "có 1 khoản tiền đang
          tạm kẹt, không phải lỗi thường" kèm mã tham chiếu; (3) một tiến trình chạy ngầm mỗi 15 giây tự rà soát và
          hoàn tất những khoản còn kẹt đó, không cần người dùng tự thử lại hay nhân viên vận hành phải tự tay dò số.
        </p>
        <p>
          Bài học nghiệp vụ: một tính năng ví điện tử thật không chỉ cần "đúng logic lúc 1 người dùng, 1 request" —
          còn cần có cơ chế tự phát hiện và tự sửa khi nhiều thao tác tài chính tranh chấp nhau dưới tải cao, vì đây
          là tình huống THẬT xảy ra ở quy mô hàng triệu người dùng, không phải một edge case lý thuyết.
        </p>
      </Note>
      <p className="lede" style={{ fontSize: '0.9em' }}>
        Nguồn: backend DESIGN.md mục "Quỹ nhóm (issue #14)", 3 lượt bug fix liên tiếp do agent-tester phát hiện qua
        test tải thật (race ≥20, ≥60 concurrent withdraw), không phải tình huống giả định.
      </p>
    </section>
  );
}
