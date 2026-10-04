import { Button, Icon, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

type Mode = 'even' | 'custom';

/**
 * Issue #11 — "Chia tiền" create screen. MoMo THẬT đã NGỪNG tính năng này từ 31/08/2025 (xem backend
 * DESIGN.md) — vẫn giữ lại làm bài tập domain model (nhóm tạm thời + QR/link + trạng thái thu),
 * không phải bám 1 feature MoMo còn sống. UX trước khi ngừng (nguồn agent-designer): tổng tiền +
 * số người chia (tự chia đều, hoặc nhập tuỳ chỉnh từng người) + lời nhắn → tạo mã.
 *
 * <p>2–20 người/lần là giới hạn TỰ CHỌN cho lab (không phải số MoMo từng công bố — không tìm được
 * nguồn công khai cho giới hạn thật của tính năng đã ngừng này).
 */
export function SplitBillCreate({
  onBack,
  onSubmitEven,
  onSubmitCustom,
}: {
  onBack: () => void;
  onSubmitEven: (label: string, totalAmount: number, peopleCount: number, message: string) => Promise<string | null>;
  onSubmitCustom: (label: string, amounts: number[], message: string) => Promise<string | null>;
}) {
  const [mode, setMode] = useState<Mode>('even');
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [peopleCount, setPeopleCount] = useState<number | ''>(2);
  const [customAmounts, setCustomAmounts] = useState<(number | '')[]>(['', '']);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const perPersonPreview =
    mode === 'even' && totalAmount !== '' && peopleCount !== '' && peopleCount > 0
      ? Math.floor(totalAmount / peopleCount)
      : null;

  const customTotal = customAmounts.reduce((sum: number, a) => sum + (a === '' ? 0 : a), 0);

  const evenValid = totalAmount !== '' && totalAmount > 0 && peopleCount !== '' && peopleCount >= 2 && peopleCount <= 20;
  const customValid = customAmounts.length >= 2 && customAmounts.length <= 20 && customAmounts.every((a) => a !== '' && a > 0);
  const canSubmit = label.trim().length > 0 && (mode === 'even' ? evenValid : customValid);

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(undefined);
    const err =
      mode === 'even'
        ? await onSubmitEven(label.trim(), totalAmount as number, peopleCount as number, message.trim())
        : await onSubmitCustom(label.trim(), customAmounts as number[], message.trim());
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen title="Chia tiền" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 16px' }}>
        Mỗi người trong nhóm sẽ nhận 1 link/QR riêng để trả phần của mình — giống hệt "Link nhận
        tiền", bất kỳ ai có tài khoản Ewallet Lab hợp lệ đều trả được (đơn giản hoá có chủ đích,
        không phải cơ chế bảo mật thực tế).
      </p>

      <TextField
        id="split-label"
        label="Tên khoản chia"
        placeholder="Vd: Tiền ăn tối"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--el-surface-2)', borderRadius: 12, padding: 3 }}>
        {(['even', 'custom'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 9,
              border: 0,
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 700,
              background: mode === m ? 'var(--el-surface)' : 'transparent',
              color: mode === m ? 'var(--el-accent-ink)' : 'var(--el-faint)',
              boxShadow: mode === m ? 'var(--el-shadow)' : 'none',
            }}
          >
            {m === 'even' ? 'Chia đều' : 'Tuỳ chỉnh từng người'}
          </button>
        ))}
      </div>

      {mode === 'even' && (
        <>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '0 0 6px' }}>Tổng số tiền</p>
          <input
            inputMode="numeric"
            value={totalAmount === '' ? '' : totalAmount.toLocaleString('vi-VN')}
            onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, '') === '' ? '' : Number(e.target.value.replace(/\D/g, '')))}
            placeholder="0đ"
            style={inputStyle}
          />
          <TextField
            id="split-people-count"
            label="Số người chia (2–20)"
            type="number"
            min={2}
            max={20}
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value === '' ? '' : Number(e.target.value))}
          />
          {perPersonPreview !== null && (
            <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 16px' }}>
              Mỗi người trả khoảng <strong>{formatVnd(perPersonPreview)}</strong> (làm tròn xuống, phần dư cộng vào phần đầu tiên).
            </p>
          )}
        </>
      )}

      {mode === 'custom' && (
        <>
          {customAmounts.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <input
                inputMode="numeric"
                value={a === '' ? '' : a.toLocaleString('vi-VN')}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  const next = [...customAmounts];
                  next[i] = v === '' ? '' : Number(v);
                  setCustomAmounts(next);
                }}
                placeholder={`Người ${i + 1} — 0đ`}
                style={{ ...inputStyle, fontSize: 16, padding: '12px 14px', marginBottom: 0 }}
              />
              {customAmounts.length > 2 && (
                <button
                  onClick={() => setCustomAmounts(customAmounts.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 0, cursor: 'pointer', flex: 'none' }}
                  aria-label="Xoá người này"
                >
                  <Icon name="close" size={18} style={{ color: 'var(--el-faint)' }} />
                </button>
              )}
            </div>
          ))}
          {customAmounts.length < 20 && (
            <button
              onClick={() => setCustomAmounts([...customAmounts, ''])}
              style={{
                background: 'none',
                border: '1px dashed var(--el-line)',
                borderRadius: 10,
                padding: '10px 0',
                width: '100%',
                color: 'var(--el-muted)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              + Thêm người
            </button>
          )}
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 16px' }}>
            Tổng cộng: <strong>{formatVnd(customTotal)}</strong>
          </p>
        </>
      )}

      <TextField
        id="split-message"
        label="Lời nhắn (không bắt buộc)"
        placeholder="Vd: Ăn ở quán ABC"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <Button onClick={submit} disabled={loading || !canSubmit}>
        {loading ? 'Đang tạo…' : 'Tạo mã chia tiền'}
      </Button>
    </Screen>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 26,
  fontWeight: 700,
  fontFamily: 'var(--el-font-display)',
  padding: '16px 16px',
  borderRadius: 12,
  border: '1.5px solid var(--el-line)',
  background: 'var(--el-surface)',
  color: 'var(--el-ink)',
  marginBottom: 16,
};
