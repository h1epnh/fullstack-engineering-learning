import { Crumb, FieldsTable, Note } from '../../components';

export default function BizComingSoon() {
  return (
    <section className="page">
      <Crumb parts={['Business', "What's next"]} />
      <h1>Chưa làm thật (Sắp có)</h1>
      <p className="lede">
        Các mục còn lại xuất hiện trên giao diện webapp nhưng chưa nối backend thật — bấm vào chỉ hiện màn "Sắp ra
        mắt". Đây không phải mô tả nghiệp vụ sâu (vì chưa có nghiệp vụ thật để mô tả), chỉ là tên + lý do ngắn tại
        sao chưa làm, lấy đúng nguyên văn/ý từ code hiện tại.
      </p>

      <Note icon="i">
        <p>
          Danh sách này đối chiếu trực tiếp <code>Home.tsx</code>/<code>TransferHome.tsx</code>/<code>ComingSoon.tsx</code>{' '}
          tại thời điểm viết trang — có thể đã đổi theo thời gian khi các tính năng này lần lượt được làm thật
          (giống cách Chia tiền, Lì xì, Link nhận tiền, Nhắc trả tiền từng nằm trong danh sách này trước khi được
          wire thật).
        </p>
      </Note>

      <h2>Dịch vụ tài chính liên quan trực tiếp tới ví</h2>
      <FieldsTable
        head={['Tính năng', 'Vì sao chưa có']}
        rows={[
          [
            'Chuyển khoản ra ngân hàng ngoài',
            'Cần một rail thanh toán liên ngân hàng thật (NAPAS). Dự án song song payment-hub có mô phỏng rail này, nhưng 2 project chưa được nối với nhau.',
          ],
          [
            'Nạp tiền bằng chuyển khoản từ ngân hàng bất kỳ (không cần liên kết trước)',
            'Cần một số tài khoản ảo/mã QR động sinh riêng cho từng giao dịch — hiện lab chỉ hỗ trợ nạp qua ngân hàng đã liên kết trước.',
          ],
          [
            'Quét mọi QR (QR ngân hàng/VietQR thật)',
            'Cần quyền truy cập camera trình duyệt và hỗ trợ một chuẩn QR thanh toán thật để giải mã — hiện chỉ quét được đúng định dạng QR riêng của Ewallet Lab.',
          ],
          ['Ví tiện ích', 'Chưa có mô tả nghiệp vụ cụ thể trong code hiện tại.'],
          ['Quản lý chi tiêu', 'Chưa có mô tả nghiệp vụ cụ thể trong code hiện tại.'],
          [
            'Ví Trả Sau / sản phẩm tài chính đối tác (vay nhanh, bảo hiểm)',
            'Đây là sản phẩm tín dụng/tài chính thật cần hợp tác với bên thứ ba — ngoài phạm vi một lab học tập.',
          ],
          ['Quỹ', 'Ví chung nhiều thành viên đóng góp — cần domain model và quyền truy cập riêng, chưa có trong lab.'],
          ['Gửi thiệp', 'Tính năng xã hội (thiệp kèm tiền mừng) — ngoài phạm vi lab tập trung vào giao dịch tài chính cốt lõi.'],
        ]}
      />

      <h2>Nạp tiện ích & dịch vụ nhà mạng</h2>
      <FieldsTable
        head={['Tính năng', 'Vì sao chưa có']}
        rows={[
          [
            'Nạp tiền điện thoại / Data 4G-5G',
            'Cần tích hợp trực tiếp với nhà mạng thật — chưa có một "mock-telco-gateway" tương tự mock-bank-gateway đã có cho ngân hàng.',
          ],
          [
            'Thanh toán tại quầy',
            'Thanh toán QR tại quầy cần tích hợp máy POS/merchant thật — chưa có trong lab.',
          ],
        ]}
      />

      <h2>Nội dung mang tính quảng cáo/giới thiệu</h2>
      <p className="dim">
        Các mục dưới đây chủ yếu là teaser/đề xuất trên màn hình chính, không phải một tính năng tài chính độc lập.
      </p>
      <FieldsTable
        head={['Tính năng', 'Vì sao chưa có']}
        rows={[
          ['MoMo đề xuất', 'Nội dung cá nhân hoá theo hành vi người dùng — không map vào 1 service cụ thể để xây.'],
          ['Mua vé xem phim & sự kiện', 'Cần tích hợp API đặt vé rạp/sự kiện thật.'],
          ['Tiện ích giao thông', 'Bao gồm cả tra cứu phạt nguội theo dữ liệu công khai của CSGT — ngoài phạm vi lab.'],
          ['Du lịch - Đi lại', 'Vé máy bay/khách sạn cần tích hợp một nền tảng đặt chỗ (OTA) thật.'],
          ['Thương mại điện tử', 'Mini-app marketplace của ví thật là cả một nền tảng riêng — ngoài phạm vi lab.'],
          ['Game - Ứng dụng', 'Nền tảng mini-app/game riêng — ngoài phạm vi lab.'],
          ['Ví Nhân Ái', 'Quyên góp cần đối tác tổ chức từ thiện đã xác minh — ngoài phạm vi lab.'],
          ['Ưu đãi & hoàn tiền', 'Voucher/hoàn tiền thật cần hợp tác với merchant thật — không có đối tác nào trong lab.'],
        ]}
      />
    </section>
  );
}
