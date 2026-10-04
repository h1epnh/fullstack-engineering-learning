import { Crumb, FieldsTable, Note } from '../../components';

export default function BizLimits() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Giới hạn & an toàn giao dịch']} />
      <h1>Giới hạn & xác thực giao dịch</h1>
      <p className="lede">
        Đây không phải 1 tính năng riêng trên màn hình — đây là bộ quy tắc áp dụng{' '}
        <strong>xuyên suốt mọi giao dịch đưa tiền ra khỏi ví</strong> (chuyển tiền, rút tiền, thanh toán hoá đơn) và
        cả nạp tiền vào ví. Theo đánh giá của người vận hành, đây là nội dung nghiệp vụ quan trọng nhất trong toàn
        bộ không gian Business.
      </p>

      <Note kind="warn" icon="!">
        <p>
          Có <strong>3 cơ chế độc lập</strong>, kiểm tra theo thứ tự khác nhau, có thể cùng áp dụng lên 1 giao dịch:
          hạn mức mỗi lần (tầng 1), hạn mức cộng dồn theo tháng (tầng 2, quy định pháp luật), và xác thực bổ sung
          khi giao dịch lớn. Một giao dịch có thể vượt qua tầng 1 nhưng vẫn bị chặn ở tầng 2, hoặc ngược lại không
          chạm tầng nào nhưng vẫn cần xác thực bổ sung.
        </p>
      </Note>

      <h2>Tầng 1 — hạn mức mỗi lần giao dịch</h2>
      <p>
        Mô phỏng theo hạn mức giao dịch <strong>MoMo thật đã công bố công khai</strong>, áp dụng cho từng lần giao
        dịch riêng lẻ (không cộng dồn trong ngày — lab chỉ áp dụng như trần "mỗi lần gọi", khác với cách MoMo thật
        công bố các số này theo ngày).
      </p>
      <FieldsTable
        head={['Giao dịch', 'Hạn mức mỗi lần']}
        rows={[
          ['Chuyển tiền (P2P nội bộ)', '100.000.000đ'],
          ['Nạp tiền vào ví', '50.000.000đ'],
          ['Rút tiền / Chuyển khoản ra ngân hàng', '50.000.000đ'],
          ['Số dư tối đa của 1 ví', '200.000.000đ'],
        ]}
      />
      <p className="dim">Nguồn: momo.vn/hoi-dap/han-muc-giao-dich-moi-ngay, momo.vn/hoi-dap/han-muc-nap-rut-tien-moi-ngay-la-bao-nhieu.</p>

      <h2>Tầng 2 — hạn mức cộng dồn theo tháng (quy định pháp luật)</h2>
      <p>
        Khác hẳn tầng 1, đây là số liệu từ <strong>quy định pháp luật của Ngân hàng Nhà nước</strong>, không phải số
        một nhà cung cấp ví tự công bố: <strong>Chuyển tiền + Thanh toán hoá đơn + Rút tiền cộng chung lại</strong>{' '}
        của 1 khách hàng tại 1 ví điện tử, tối đa <strong>100.000.000đ trong 1 tháng dương lịch</strong> (hạn mức tự
        reset vào ngày 1 hàng tháng, không phải "30 ngày gần nhất"). Nạp tiền vào ví <strong>không</strong> tính vào
        hạn mức này.
      </p>
      <p>
        Vì 2 tầng độc lập: một giao dịch 80 triệu đồng có thể hợp lệ ở tầng 1 (dưới 100tr/lần), nhưng nếu tháng này
        đã chuyển/rút/thanh toán 30 triệu đồng rồi thì giao dịch đó vẫn bị <strong>từ chối ở tầng 2</strong> (tổng
        110tr vượt trần tháng).
      </p>
      <p className="dim">
        Nguồn: Điều 26 Thông tư 40/2024/TT-NHNN (17/07/2024), sửa đổi bởi Thông tư 41/2025/TT-NHNN (05/11/2025 —
        thông tư sau có nâng mức này lên 300.000.000đ/tháng riêng cho nhóm giao dịch thiết yếu như điện/nước/viễn
        thông/học phí, nhưng lab này áp dụng mức 100 triệu đồng cho mọi giao dịch, vì dịch vụ thanh toán hoá đơn
        trong lab hoàn toàn mô phỏng, không có dữ liệu thật để phân loại đúng nhóm "thiết yếu" theo luật).
      </p>

      <h2>Xác thực bổ sung khi giao dịch lớn</h2>
      <p>
        Mô phỏng <strong>Quyết định 2345/QĐ-NHNN</strong> (hiệu lực từ 01/07/2024, áp dụng cho toàn ngành ngân
        hàng/ví điện tử thật — không riêng MoMo): một giao dịch <strong>vượt 10.000.000đ</strong>, HOẶC tổng các
        giao dịch trong <strong>cùng 1 ngày đạt/vượt 20.000.000đ</strong>, bắt buộc phải{' '}
        <strong>xác thực bổ sung</strong> trước khi được xử lý — kể cả khi giao dịch đó chưa chạm tầng 1 hay tầng 2
        ở trên.
      </p>
      <ul>
        <li>
          Áp dụng cho <strong>cả 4 loại</strong>: chuyển tiền, rút tiền, thanh toán hoá đơn, và{' '}
          <strong>cả nạp tiền vào ví</strong> — phạm vi rộng hơn tầng 2 (vốn không tính nạp tiền), vì quy định pháp
          luật thật nói rõ áp dụng cho "nạp tiền vào ví điện tử".
        </li>
        <li>
          Ngưỡng theo ngày được tính <strong>chung 1 pool</strong> cho cả 4 loại giao dịch — không tách riêng "tiền
          vào" và "tiền ra". Ví dụ: rút 12 triệu (đã kèm xác thực) rồi nạp thêm 9 triệu (dù bản thân khoản nạp dưới
          cả 2 ngưỡng) vẫn cần xác thực bổ sung, vì tổng trong ngày đã vượt 20 triệu.
        </li>
        <li>
          Lab <strong>mô phỏng</strong> bước xác thực này bằng 1 bước xác nhận đơn giản trên màn hình — không có
          sinh trắc học/vân tay/khuôn mặt thật ở bất kỳ đâu trong lab. Giao diện nói rõ đây là mô phỏng, không ngụ ý
          đã tích hợp xác thực sinh trắc học thật.
        </li>
      </ul>
      <p className="dim">Nguồn: Quyết định 2345/QĐ-NHNN (18/12/2023, hiệu lực 01/07/2024).</p>

      <h2>Tóm tắt 3 cơ chế</h2>
      <FieldsTable
        head={['Cơ chế', 'Ngưỡng', 'Áp dụng cho', 'Chu kỳ reset']}
        rows={[
          ['Tầng 1 — mỗi lần', '50–100 triệu đ tuỳ loại', 'Từng giao dịch riêng lẻ', 'Không reset (áp mỗi lần gọi)'],
          [
            'Tầng 2 — theo tháng',
            '100 triệu đ/tháng',
            'Chuyển tiền + Hoá đơn + Rút tiền (cộng dồn)',
            'Đầu tháng dương lịch',
          ],
          [
            'Xác thực bổ sung',
            '10 triệu đ/lần hoặc 20 triệu đ/ngày',
            'Chuyển tiền + Hoá đơn + Rút tiền + Nạp tiền (cộng dồn)',
            'Nửa đêm (theo ngày dương lịch)',
          ],
        ]}
      />
    </section>
  );
}
