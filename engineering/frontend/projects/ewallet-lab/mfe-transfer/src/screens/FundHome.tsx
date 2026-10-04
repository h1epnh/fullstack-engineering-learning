import { ApiError, type Fund, fundService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/** Same reasoning as mfe-transfer's `describeSplitError` (issue #11) — fund-service's
 * 403/404/409 messages are already precise/sourced (see FundMutationExecutor), more useful shown
 * verbatim here than collapsed into `describeApiError`'s generic per-status-code bins. */
function describeFundError(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return 'Không kết nối được tới máy chủ. Kiểm tra lại các service đã chạy chưa rồi thử lại.';
}

/**
 * Issue #14 — "Quỹ nhóm" (`fund-service`, operator's architecture decision on the issue: a
 * stand-alone service, see backend DESIGN.md). List of funds the current user belongs to (as
 * creator or member) + a form to create a new one. Tapping a fund opens `FundDetail.tsx`.
 */
export function FundHome({
  selfUserId,
  onOpenFund,
  onBack,
}: {
  selfUserId: string;
  onOpenFund: (fundId: string) => void;
  onBack: () => void;
}) {
  const [funds, setFunds] = useState<Fund[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  function reload() {
    fundService.listForMember(selfUserId).then(setFunds).catch(() => setFunds([]));
  }

  useEffect(reload, [selfUserId]);

  async function handleCreate() {
    setError(undefined);
    if (!name.trim()) {
      setError('Nhập tên quỹ.');
      return;
    }
    setBusy(true);
    try {
      const fund = await fundService.create(selfUserId, name.trim(), purpose.trim() || undefined);
      setName('');
      setPurpose('');
      setCreating(false);
      reload();
      onOpenFund(fund.id);
    } catch (e) {
      setError(describeFundError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Quỹ nhóm" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 14px' }}>
        Nhiều người cùng góp tiền vào 1 quỹ chung (du lịch, sinh hoạt, tiết kiệm…). MVP của lab này:
        chỉ người tạo quỹ mới được rút tiền/giải thể quỹ, chưa có lãi suất trên số dư quỹ.
      </p>

      {creating ? (
        <Card>
          <TextField
            id="fund-name"
            label="Tên quỹ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Du lịch Đà Lạt 2026"
          />
          <TextField
            id="fund-purpose"
            label="Mục đích (không bắt buộc)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            error={error}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={() => setCreating(false)} disabled={busy}>
              Huỷ
            </Button>
            <Button onClick={handleCreate} disabled={busy}>
              {busy ? 'Đang tạo…' : 'Tạo quỹ'}
            </Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)} style={{ marginBottom: 16 }}>
          + Tạo quỹ mới
        </Button>
      )}

      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
        Quỹ của tôi
      </h2>

      {funds === null ? (
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>
      ) : funds.length === 0 ? (
        <Card>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: 0 }}>
            Chưa tham gia quỹ nhóm nào. Tạo quỹ mới ở trên để bắt đầu.
          </p>
        </Card>
      ) : (
        funds.map((f) => (
          <button
            key={f.id}
            onClick={() => onOpenFund(f.id)}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, marginBottom: 10, cursor: 'pointer' }}
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="groups" size={16} style={{ color: 'var(--el-accent-ink)' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>{f.name}</span>
                    {f.status === 'DISSOLVED' && (
                      <span style={{ fontSize: 10.5, color: 'var(--el-faint)', border: '1px solid var(--el-line)', borderRadius: 999, padding: '1px 7px' }}>
                        Đã giải thể
                      </span>
                    )}
                  </div>
                  {f.purpose && <div style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 2 }}>{f.purpose}</div>}
                </div>
                <div style={{ fontFamily: 'var(--el-font-display)', fontWeight: 700, fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>
                  {formatVnd(f.balance)}
                </div>
              </div>
            </Card>
          </button>
        ))
      )}

      <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '14px 2px' }}>
        Nguồn UX: fetch trực tiếp momo.vn/quy-nhom — "Chỉ thành viên đã duyệt mới xem/truy cập được
        thông tin vận hành quỹ". Số dư quỹ không sinh lãi trong MVP này.
      </p>
    </Screen>
  );
}
