import { Crumb, FieldsTable, Note, PageLink } from '../components';

export default function Conventions() {
  return (
    <section className="page">
      <Crumb parts={['Overview', 'Conventions']} />
      <h1>Conventions &amp; disclaimer</h1>
      <p className="lede">Đọc mục này trước khi dùng bất kỳ nội dung nào trong docs này làm tham chiếu cho việc khác.</p>

      <Note kind="warn" icon="!">
        <p>
          <strong>Đây là functional clone cho mục đích học tập</strong> — mô phỏng chức năng, không sao chép thương
          hiệu/giao diện của MoMo. Không dùng tên/logo MoMo, không phải sản phẩm thương mại.
        </p>
      </Note>

      <h2>Nguyên tắc xuyên suốt dự án</h2>
      <ul>
        <li>
          <strong>Luôn bám tài liệu kỹ thuật thật</strong> khi có thể — field name, endpoint, công thức chữ ký lấy
          trực tiếp từ <PageLink to="momo-spec">developers.momo.vn</PageLink>, không suy đoán.
        </li>
        <li>
          <strong>Ghi rõ ranh giới</strong> khi không có spec công khai (ví dụ: P2P transfer, bill payment nội bộ
          MoMo không public) — thấy rõ trong mục Roadmap và từng trang service.
        </li>
        <li>
          <strong>Database-per-service</strong> — mỗi service sở hữu schema riêng, không service nào đọc/ghi trực
          tiếp bảng của service khác.
        </li>
      </ul>

      <h2>Ký hiệu dùng trong docs</h2>
      <FieldsTable
        rows={[
          [<code>GET</code>, 'Đọc dữ liệu, không side-effect'],
          [<code>POST</code>, 'Tạo mới hoặc thực hiện hành động'],
          [<code>internal</code>, 'Chỉ dành cho service khác gọi, không phải endpoint cho client/frontend'],
          [<span className="req">*</span>, 'Field bắt buộc'],
        ]}
      />
    </section>
  );
}
