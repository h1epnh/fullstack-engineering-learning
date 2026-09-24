import { useId, useMemo, useState } from 'react';
import centralAgenciesRaw from '../data/central_agencies.json';
import departmentFrameworkRaw from '../data/department_framework.json';
import provincesRaw from '../data/provinces.json';
import { arcPath, iconAngles, polarToCartesian, wedgePath } from '../polar';
import type { CentralAgenciesFile, DepartmentFrameworkFile, ProvincesFile } from '../types';
import { GlyphIcon, type Glyph } from './icons/GlyphIcon';

const centralAgencies = centralAgenciesRaw as CentralAgenciesFile;
const departmentFramework = departmentFrameworkRaw as DepartmentFrameworkFile;
const provinces = provincesRaw as ProvincesFile;

const CX = 300;
const CY = 300;

// 3 top-level sectors, matching the branch-of-government shape CivLab uses. Lập pháp (Quốc hội) và
// Tư pháp (Tòa án) chưa có dữ liệu thật trong dự án này — vẽ như quạt trống có viền đứt, không bịa
// số liệu để lấp chỗ trống. Hành pháp (Chính phủ) là phần duy nhất có dữ liệu thật, chiếm phần lớn
// vòng tròn.
const LAP_PHAP_END = 26;
const TU_PHAP_END = 52;
const HANH_PHAP_START = TU_PHAP_END;
const HANH_PHAP_END = 360;

type RingSpec = {
  key: string;
  label: string;
  radius: number;
  glyph: Glyph;
  color: string;
  items: { id: string; name: string; sub?: string }[];
};

function useRings(): RingSpec[] {
  return useMemo(() => {
    const bo = centralAgencies.items.filter((a) => a.loai === 'bo');
    const coQuan = centralAgencies.items.filter((a) => a.loai === 'co_quan_ngang_bo');
    const batBuoc = departmentFramework.items.filter((d) => d.nhom === 'bat_buoc');
    const dacThu = departmentFramework.items.filter((d) => d.nhom === 'dac_thu');
    const sapNhap = provinces.items.filter((p) => p.sap_nhap);
    const giuNguyen = provinces.items.filter((p) => !p.sap_nhap);

    return [
      {
        key: 'trung-uong',
        label: 'CHÍNH PHỦ TRUNG ƯƠNG',
        radius: 100,
        glyph: 'circle',
        color: '#4fd8b0',
        items: [
          ...bo.map((a) => ({ id: a.id, name: a.ten, sub: 'Bộ' })),
          ...coQuan.map((a) => ({ id: a.id, name: a.ten, sub: 'Cơ quan ngang Bộ' })),
        ],
      },
      {
        key: 'so-nganh',
        label: 'KHUNG SỞ/NGÀNH CẤP TỈNH',
        radius: 155,
        glyph: 'hexagon',
        color: '#e0a35c',
        items: [
          ...batBuoc.map((d) => ({ id: d.id, name: d.ten, sub: 'Bắt buộc' })),
          ...dacThu.map((d) => ({ id: d.id, name: d.ten, sub: 'Đặc thù' })),
        ],
      },
      {
        key: 'tinh-thanh',
        label: '34 TỈNH / THÀNH PHỐ',
        radius: 210,
        glyph: 'triangle',
        color: '#8fb7e8',
        items: [
          ...sapNhap.map((p) => ({ id: p.id, name: p.ten, sub: 'Sáp nhập' })),
          ...giuNguyen.map((p) => ({ id: p.id, name: p.ten, sub: 'Giữ nguyên' })),
        ],
      },
    ];
  }, []);
}

function PlaceholderWedge({
  startAngle,
  endAngle,
  label,
}: {
  startAngle: number;
  endAngle: number;
  label: string;
}) {
  const labelPathId = useId();
  const labelR = 225;
  return (
    <g opacity={0.55}>
      <path
        d={wedgePath(CX, CY, 70, 225, startAngle, endAngle)}
        fill="none"
        stroke="#3a4440"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <path id={labelPathId} d={arcPath(CX, CY, labelR, startAngle, endAngle)} fill="none" />
      <text fontSize={9.5} fill="#6d766f" letterSpacing="0.08em" fontFamily="var(--font-mono)">
        <textPath href={`#${labelPathId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>
    </g>
  );
}

export function PowerMap() {
  const rings = useRings();
  const [hover, setHover] = useState<{ name: string; sub?: string; x: number; y: number } | null>(
    null,
  );
  const total =
    centralAgencies.items.length + departmentFramework.items.length + provinces.items.length;

  return (
    <div
      style={{
        background: '#0b0f0d',
        borderRadius: 16,
        padding: '28px 20px',
        position: 'relative',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.14em',
            color: '#4fd8b0',
            textTransform: 'uppercase',
          }}
        >
          Sơ đồ cơ cấu · Hành pháp Việt Nam
        </div>
        <div style={{ fontSize: 12, color: '#8a938d', marginTop: 4 }}>
          {total} cơ quan/đơn vị đã thu thập được nguồn xác minh — xem mục Nguồn dữ liệu
        </div>
      </div>

      <svg viewBox="0 0 600 600" style={{ width: '100%', height: 'auto', maxWidth: 620 }}>
        <PlaceholderWedge startAngle={0} endAngle={LAP_PHAP_END} label="LẬP PHÁP · CHƯA THU THẬP" />
        <PlaceholderWedge
          startAngle={LAP_PHAP_END}
          endAngle={TU_PHAP_END}
          label="TƯ PHÁP · CHƯA THU THẬP"
        />

        {/* Hành pháp sector background */}
        <path
          d={wedgePath(CX, CY, 70, 225, HANH_PHAP_START, HANH_PHAP_END)}
          fill="rgba(79, 216, 176, 0.05)"
          stroke="rgba(79, 216, 176, 0.25)"
          strokeWidth={1}
        />

        {rings.map((ring) => {
          const angles = iconAngles(HANH_PHAP_START + 6, HANH_PHAP_END - 6, ring.items.length);
          const labelPathId = `ring-${ring.key}`;
          return (
            <g key={ring.key}>
              <circle
                cx={CX}
                cy={CY}
                r={ring.radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <path
                id={labelPathId}
                d={arcPath(CX, CY, ring.radius - 10, HANH_PHAP_START + 2, HANH_PHAP_START + 70)}
                fill="none"
              />
              <text fontSize={8.5} fill="#5b6560" letterSpacing="0.08em" fontFamily="var(--font-mono)">
                <textPath href={`#${labelPathId}`} startOffset="0%">
                  {ring.label}
                </textPath>
              </text>
              {ring.items.map((item, i) => {
                const { x, y } = polarToCartesian(CX, CY, ring.radius, angles[i]);
                return (
                  <g
                    key={item.id}
                    onMouseEnter={() => setHover({ name: item.name, sub: item.sub, x, y })}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={x} cy={y} r={10} fill="transparent" />
                    <GlyphIcon glyph={ring.glyph} color={ring.color} x={x} y={y} size={8} />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Center badge — scalloped seal shape, neutral factual label (no political framing) */}
        <ScallopedSeal cx={CX} cy={CY} r={60} />
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={26}
          fontWeight={600}
          fill="#edf1ee"
        >
          {total}
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={8.5}
          fill="#8a938d"
          letterSpacing="0.04em"
        >
          CƠ QUAN / ĐƠN VỊ
        </text>
      </svg>

      {hover && (
        <div
          style={{
            position: 'absolute',
            left: `${(hover.x / 600) * 100}%`,
            top: `${(hover.y / 600) * 100}%`,
            transform: 'translate(-50%, -140%)',
            background: '#1c211d',
            border: '1px solid #2b322c',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            color: '#edf1ee',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          }}
        >
          <strong>{hover.name}</strong>
          {hover.sub && <span style={{ color: '#8a938d' }}> · {hover.sub}</span>}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 18,
          fontSize: 11.5,
          color: '#8a938d',
        }}
      >
        <LegendItem glyph="circle" color="#4fd8b0" label="Bộ / Cơ quan ngang Bộ" />
        <LegendItem glyph="hexagon" color="#e0a35c" label="Khung sở/ngành cấp tỉnh" />
        <LegendItem glyph="triangle" color="#8fb7e8" label="Tỉnh / thành phố" />
      </div>
    </div>
  );
}

function LegendItem({ glyph, color, label }: { glyph: Glyph; color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width={12} height={12}>
        <GlyphIcon glyph={glyph} color={color} x={6} y={6} size={8} />
      </svg>
      {label}
    </span>
  );
}

function ScallopedSeal({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const teeth = 24;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (360 / (teeth * 2)) * i;
    const radius = i % 2 === 0 ? r : r * 0.93;
    const p = polarToCartesian(cx, cy, radius, angle);
    pts.push(`${p.x},${p.y}`);
  }
  return <polygon points={pts.join(' ')} fill="#161c18" stroke="#2b322c" strokeWidth={1.5} />;
}
