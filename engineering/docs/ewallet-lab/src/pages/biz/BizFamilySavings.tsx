import { BizFeature, Crumb, Note } from '../../components';

export default function BizFamilySavings() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Ví Gia đình & Túi Thần Tài']} />
      <h1>Ví Gia đình & Túi Thần Tài</h1>
      <p className="lede">
        2 tính năng quản lý tiền nằm ngoài luồng "chuyển/thanh toán giữa 2 người" — một tính năng về{' '}
        <strong>kiểm soát chi tiêu của người khác</strong>, một tính năng về <strong>tách riêng tiền của chính
        mình</strong>.
      </p>

      <BizFeature
        status="done"
        title="Ví Gia đình"
        what="Chủ ví chính mời một thành viên (con cái, người thân...) và đặt hạn mức chi tiêu riêng mỗi tháng cho người đó, xem được họ đã chi tiêu bao nhiêu."
        rules={[
          'Hạn mức gia đình là một "trần" RIÊNG do chủ ví tự đặt — cộng thêm vào, KHÔNG thay thế, hạn mức pháp luật ở trang Giới hạn & xác thực giao dịch. Một giao dịch của thành viên phải vượt qua cả 2 lớp kiểm tra.',
          'Thành viên vẫn phải tự có một tài khoản Ewallet Lab riêng của họ — lab chưa hỗ trợ kiểu "mở ví hộ hoàn toàn" (thành viên không cần tài khoản riêng) như một số ví điện tử thật.',
          'Nếu dịch vụ kiểm tra hạn mức gia đình tạm thời gặp sự cố, giao dịch của thành viên VẪN được cho qua bình thường (không bị chặn toàn bộ) — đây là một đánh đổi rủi ro/tiện lợi có chủ đích: không để một tính năng phụ trợ (Ví Gia đình) làm nghẽn giao dịch của toàn bộ người dùng hệ thống, kể cả những người không dùng tính năng này.',
        ]}
        source="Tham khảo VNPay (đối thủ, không phải MoMo — MoMo không có tính năng tương đương công khai tương tự): tính năng 'mở ví thành viên' cho cha/mẹ/con cái, cấp hạn mức chi tiêu, xem được chi tiêu của thành viên."
      />

      <BizFeature
        status="done"
        title="Túi Thần Tài"
        what="Một 'ngăn' tiền tách riêng khỏi ví chính, tự sinh lãi mô phỏng theo thời gian, có thể nạp/rút qua lại với ví chính bất kỳ lúc nào."
        rules={[
          'Lãi suất mô phỏng 4%/năm — lấy theo sản phẩm "Tài khoản Tích luỹ" của ZaloPay (đối thủ), KHÔNG dùng con số 6%/năm của chính "Túi Thần Tài" MoMo thật, để tránh mô phỏng bám sát 1-1 vào đúng một sản phẩm tài chính thật của bên thứ ba.',
          'Đây là lãi suất MÔ PHỎNG cho mục đích học tập — không có quỹ đầu tư hay ngân hàng lưu ký thật nào đứng sau khoản tiền này; tiền vẫn nằm nguyên trong cùng hệ thống ví, chỉ được cộng thêm "lãi" ảo theo công thức đơn giản.',
          'Mở Túi Thần Tài lần đầu cần một số tiền tối thiểu (10.000đ) — tránh tạo một túi gần như rỗng không có ý nghĩa thực tế.',
          'Nạp/rút giữa ví chính và Túi Thần Tài là thao tác nội bộ, xử lý ngay lập tức — khác với nạp/rút qua ngân hàng ngoài (vốn cần một bước chờ xác nhận, xem trang Chuyển tiền & Thanh toán).',
        ]}
        source="zalopay.vn — lãi suất 'Tài khoản Tích luỹ' 4%/năm (xác minh trực tiếp, không dùng số MoMo công bố)."
      />

      <Note icon="i">
        <p>
          Disclaimer "lãi suất mô phỏng, không phải sản phẩm tài chính thật" hiển thị trực tiếp trên màn hình Túi
          Thần Tài của webapp, không chỉ nằm trong tài liệu kỹ thuật — vì đây là nội dung có thể gây hiểu lầm nếu
          chỉ đọc UI mà không có ngữ cảnh "đây là bài tập học tập".
        </p>
      </Note>
    </section>
  );
}
