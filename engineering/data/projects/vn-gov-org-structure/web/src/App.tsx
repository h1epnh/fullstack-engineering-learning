import { useMemo, useState } from 'react';
import agencyHeadsRaw from './data/agency_heads.json';
import centralAgenciesRaw from './data/central_agencies.json';
import departmentFrameworkRaw from './data/department_framework.json';
import provincesRaw from './data/provinces.json';
import stateBudgetRaw from './data/state_budget.json';
import { BarRow } from './components/BarRow';
import { PowerMap } from './components/PowerMap';
import { StatTile } from './components/StatTile';
import type {
  AgencyHeadsFile,
  CentralAgenciesFile,
  DepartmentFrameworkFile,
  ProvincesFile,
  StateBudgetFile,
} from './types';

const centralAgencies = centralAgenciesRaw as CentralAgenciesFile;
const agencyHeads = agencyHeadsRaw as AgencyHeadsFile;
const departmentFramework = departmentFrameworkRaw as DepartmentFrameworkFile;
const provinces = provincesRaw as ProvincesFile;
const stateBudget = stateBudgetRaw as StateBudgetFile;

const NAV = [
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'so-do', label: 'Sơ đồ' },
  { id: 'chinh-phu', label: 'Chính phủ trung ương' },
  { id: 'so-nganh', label: 'Sở/ngành cấp tỉnh' },
  { id: 'tinh-thanh', label: '34 tỉnh/thành' },
  { id: 'ngan-sach', label: 'Ngân sách' },
  { id: 'nguon', label: 'Nguồn dữ liệu' },
];

function fmt(n: number): string {
  return n.toLocaleString('vi-VN');
}

export function App() {
  const [active, setActive] = useState('tong-quan');
  const [query, setQuery] = useState('');

  const bo = centralAgencies.items.filter((a) => a.loai === 'bo');
  const coQuan = centralAgencies.items.filter((a) => a.loai === 'co_quan_ngang_bo');
  const batBuoc = departmentFramework.items.filter((d) => d.nhom === 'bat_buoc');
  const dacThu = departmentFramework.items.filter((d) => d.nhom === 'dac_thu');
  const sapNhap = provinces.items.filter((p) => p.sap_nhap);
  const giuNguyen = provinces.items.filter((p) => !p.sap_nhap);
  const budget2026 = stateBudget.items[0];

  const filteredProvinces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return provinces.items;
    return provinces.items.filter(
      (p) =>
        p.ten.toLowerCase().includes(q) ||
        (p.don_vi_cu ?? []).some((d) => d.toLowerCase().includes(q)),
    );
  }, [query]);

  function goTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const allSources = [
    ...centralAgencies.nguon,
    ...agencyHeads.nguon,
    ...departmentFramework.nguon,
    ...provinces.nguon,
    ...budget2026.nguon,
  ];

  return (
    <>
      <header className="site-header">
        <div className="wrap row">
          <div className="brand">
            Cơ cấu <span>Hành chính</span> Việt Nam
          </div>
          <nav className="site-nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={active === n.id ? 'active' : ''}
                onClick={() => goTo(n.id)}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Dữ liệu công khai · Cập nhật 2026</p>
          <h1>Một mô hình dữ liệu cho bộ máy hành chính Việt Nam</h1>
          <p>
            Lấy cảm hứng từ <a href="https://graph.civlab.org/sf">CivLab</a> — tổng hợp cơ cấu tổ
            chức trung ương, khung sở/ngành cấp tỉnh, đơn vị hành chính sau sáp nhập, và ngân sách
            nhà nước, mỗi con số đều có nguồn gốc kiểm chứng được.
          </p>
          <p className="disclaimer">
            Dự án độc lập, không đại diện hay liên kết với bất kỳ cơ quan nhà nước nào. Chỉ mô hình
            hóa cơ cấu tổ chức tĩnh theo văn bản pháp luật công khai — xem phạm vi đầy đủ trong
            README.md.
          </p>

          <div className="stat-grid">
            <StatTile num={String(bo.length)} label="Bộ" />
            <StatTile num={String(coQuan.length)} label="Cơ quan ngang Bộ" />
            <StatTile num={String(batBuoc.length + dacThu.length)} label="Loại sở cấp tỉnh" />
            <StatTile num={String(provinces.items.length)} label="Tỉnh / thành phố" />
            <StatTile num={`${(budget2026.tong_thu.tong / 1000).toFixed(1)}k`} label="Tổng thu NSNN 2026 (nghìn tỷ đ)" />
          </div>
        </div>
      </section>

      <section id="tong-quan" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Tổng quan</h2>
            <span className="meta">Nhiệm kỳ Quốc hội khóa XVI (2026–2031)</span>
          </div>
          <div className="two-col">
            <div>
              <p className="block-intro" style={{ margin: '0 0 12px' }}>
                Cơ cấu Chính phủ trung ương theo loại
              </p>
              <BarRow label="Bộ" count={bo.length} max={bo.length} />
              <BarRow label="Cơ quan ngang Bộ" count={coQuan.length} max={bo.length} />
            </div>
            <div>
              <p className="block-intro" style={{ margin: '0 0 12px' }}>
                Đơn vị hành chính cấp tỉnh
              </p>
              <BarRow label="Sáp nhập" count={sapNhap.length} max={provinces.items.length} />
              <BarRow label="Giữ nguyên" count={giuNguyen.length} max={provinces.items.length} />
            </div>
          </div>
        </div>
      </section>

      <section id="so-do" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Sơ đồ cơ cấu</h2>
            <span className="meta">bố cục lấy cảm hứng từ civlab.org</span>
          </div>
          <p className="block-intro">
            Vòng tròn theo cấp (Chính phủ trung ương → khung sở/ngành → tỉnh/thành). Hai quạt
            "Lập pháp"/"Tư pháp" để trống có chủ đích — dự án chưa thu thập dữ liệu Quốc hội/Tòa án,
            không vẽ số liệu giả để lấp đầy. Di chuột vào từng icon để xem tên.
          </p>
          <PowerMap />
        </div>
      </section>

      <section id="chinh-phu" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Chính phủ trung ương</h2>
            <span className="meta">{centralAgencies.items.length} cơ quan</span>
          </div>
          <p className="block-intro">
            14 Bộ và 3 cơ quan ngang Bộ hợp thành Chính phủ nhiệm kỳ Quốc hội khóa XVI, thông qua
            ngày 2026-04-07 với 488/488 phiếu tán thành. Thủ tướng: <strong>{agencyHeads.thu_tuong}</strong>.
            Người đứng đầu từng cơ quan ghi theo phê chuẩn của Quốc hội — chỉ tên và chức danh,
            không phải hồ sơ cá nhân (xem SOURCES.md).
          </p>
          <div className="card-grid">
            {centralAgencies.items.map((a) => {
              const head = agencyHeads.items.find((h) => h.co_quan_id === a.id);
              return (
                <div className="agency-card" key={a.id}>
                  <div className="name">{a.ten}</div>
                  <span className={`tag ${a.loai === 'bo' ? 'bo' : 'co-quan'}`}>
                    {a.loai === 'bo' ? 'Bộ' : 'Cơ quan ngang Bộ'}
                  </span>
                  {head && (
                    <div style={{ marginTop: 9, fontSize: 12.5, color: 'var(--muted)' }}>
                      {head.chuc_danh}: <strong style={{ color: 'var(--ink)' }}>{head.ten_nguoi_dung_dau}</strong>
                      {head.ghi_chu && <span> ({head.ghi_chu})</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="so-nganh" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Khung sở/ngành cấp tỉnh</h2>
            <span className="meta">Nghị định 150/2025/NĐ-CP</span>
          </div>
          <p className="block-intro">
            Trần tối đa {departmentFramework.so_luong_toi_da.tinh_thanh_thuong} sở mỗi tỉnh, riêng
            Hà Nội và TP.HCM tối đa {departmentFramework.so_luong_toi_da.ha_noi_va_ho_chi_minh} sở.
            Đây là khung quy định áp dụng chung — không phải danh sách sở thực tế của từng tỉnh.
          </p>
          <p className="block-intro" style={{ marginTop: -6, fontWeight: 600 }}>
            {batBuoc.length} sở/cơ quan bắt buộc
          </p>
          <div className="card-grid">
            {batBuoc.map((d) => (
              <div className="agency-card" key={d.id}>
                <div className="name">{d.ten}</div>
                <span className="tag bo">{d.dieu_khoan}</span>
              </div>
            ))}
          </div>
          <p className="block-intro" style={{ marginTop: 26, fontWeight: 600 }}>
            {dacThu.length} sở đặc thù (có điều kiện)
          </p>
          <div className="card-grid">
            {dacThu.map((d) => (
              <div className="agency-card" key={d.id}>
                <div className="name">{d.ten}</div>
                <span className="tag co-quan">{d.dieu_khoan}</span>
                {d.dieu_kien && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    {d.dieu_kien}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tinh-thanh" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>34 tỉnh/thành phố</h2>
            <span className="meta">{provinces.nghi_quyet} · hiệu lực {provinces.hieu_luc_tu}</span>
          </div>
          <p className="block-intro">
            23 đơn vị hình thành sau sáp nhập, 11 đơn vị giữ nguyên địa giới cũ.
          </p>
          <input
            className="search-box"
            placeholder="Tìm tỉnh mới hoặc tỉnh cũ (vd: Hà Giang)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="province-grid">
            {filteredProvinces.map((p) => (
              <div className="province-card" key={p.id}>
                <div className="name">
                  <span className={`dot ${p.sap_nhap ? 'sap-nhap' : 'giu-nguyen'}`} />
                  {p.ten}
                  <span style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 500 }}>
                    {p.loai === 'thanh_pho_tw' ? 'TP.TW' : 'Tỉnh'}
                  </span>
                </div>
                {p.don_vi_cu && <div className="merge">Hợp nhất từ: {p.don_vi_cu.join(', ')}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ngan-sach" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Ngân sách nhà nước {budget2026.nam}</h2>
            <span className="meta">
              {budget2026.nghi_quyet} · thông qua {budget2026.ngay_thong_qua}
            </span>
          </div>
          <p className="block-intro">
            Dự toán (kế hoạch được duyệt) — chưa phải số quyết toán thực chi cuối năm.
          </p>
          <div className="budget-grid">
            <div className="budget-card">
              <h3>Tổng thu</h3>
              <div className="budget-figure">
                {fmt(budget2026.tong_thu.tong)}
                <span className="budget-unit">tỷ đồng</span>
              </div>
              <div className="budget-split">
                <span
                  className="seg tw"
                  style={{ flex: budget2026.tong_thu.trung_uong }}
                  title="Trung ương"
                >
                  TW
                </span>
                <span
                  className="seg dp"
                  style={{ flex: budget2026.tong_thu.dia_phuong }}
                  title="Địa phương"
                >
                  ĐP
                </span>
              </div>
            </div>
            <div className="budget-card">
              <h3>Tổng chi</h3>
              <div className="budget-figure">
                {fmt(budget2026.tong_chi.tong)}
                <span className="budget-unit">tỷ đồng</span>
              </div>
              <div className="budget-split">
                <span
                  className="seg tw"
                  style={{ flex: budget2026.tong_chi.trung_uong }}
                  title="Trung ương"
                >
                  TW
                </span>
                <span
                  className="seg dp"
                  style={{ flex: budget2026.tong_chi.dia_phuong }}
                  title="Địa phương"
                >
                  ĐP
                </span>
              </div>
            </div>
            <div className="budget-card">
              <h3>Bội chi</h3>
              <div className="budget-figure">
                {fmt(budget2026.boi_chi.tong)}
                <span className="budget-unit">tỷ đồng</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10 }}>
                Tương đương {budget2026.boi_chi.phan_tram_gdp}% GDP
              </div>
            </div>
          </div>
          <p className="block-intro" style={{ marginTop: 22 }}>
            Lương cơ sở áp dụng: {fmt(budget2026.luong_co_so_dong_thang)} đồng/tháng.
          </p>
        </div>
      </section>

      <section id="nguon" className="block">
        <div className="wrap">
          <div className="block-head">
            <h2>Nguồn dữ liệu</h2>
          </div>
          <p className="block-intro">
            Mọi số liệu trên trang này đều trỏ về một nguồn đã kiểm chứng — xem đầy đủ trong{' '}
            <code>SOURCES.md</code> của dự án.
          </p>
          <ul className="source-list">
            {allSources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.tieu_de}
                </a>
                <div>Truy cập: {s.ngay_truy_cap}</div>
              </li>
            ))}
          </ul>
          <div className="gap-note">
            Một số khoảng trống chưa xác minh 100% (số hiệu Nghị quyết cơ cấu Chính phủ, đối chiếu
            chéo danh sách sáp nhập tỉnh, nội dung Nghị định 370/2025/NĐ-CP sửa đổi) — xem chi tiết
            trong SOURCES.md, không được ẩn đi ở đây.
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span>Dữ liệu công khai · không chính thức · chỉ mang tính tham khảo</span>
          <span>Lấy cảm hứng từ <a href="https://graph.civlab.org/sf" target="_blank" rel="noreferrer">civlab.org</a></span>
        </div>
      </footer>
    </>
  );
}
