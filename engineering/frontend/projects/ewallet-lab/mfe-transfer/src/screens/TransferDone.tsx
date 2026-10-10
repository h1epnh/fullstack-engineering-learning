import { transferService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

export function TransferDone({
  toName,
  toPhone,
  selfUserId,
  amount,
  newBalance,
  onDone,
}: {
  toName: string;
  toPhone?: string;
  selfUserId?: string;
  amount: number;
  newBalance: number;
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSavePayee() {
    if (!selfUserId || !toPhone) return;
    setSaving(true);
    setSaveError(null);
    try {
      await transferService.savePayee(selfUserId, {
        payeePhone: toPhone,
        nickname: nickname.trim() || undefined,
        isFavorite: true,
      });
      setSaved(true);
      setShowSaveModal(false);
    } catch (e: any) {
      setSaveError(e.message || 'Không thể lưu vào danh bạ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Chuyển tiền" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="check_circle" size={40} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Chuyển tiền thành công</p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0, textAlign: 'center' }}>
            Đã chuyển <strong>{formatVnd(amount)}</strong> cho <strong>{toName}</strong>
            {toPhone && ` (${toPhone})`}
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
            Số dư mới: <strong>{formatVnd(newBalance)}</strong>
          </p>
        </div>
      </Card>

      {/* Nút lưu danh bạ yêu thích (Issue #32) */}
      {selfUserId && toPhone && (
        <div style={{ marginTop: 12 }}>
          {saved ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#389e0d', fontSize: 13, fontWeight: 600, padding: 8 }}>
              <Icon name="check" size={18} />
              Đã lưu vào danh bạ yêu thích!
            </div>
          ) : (
            <button
              onClick={() => setShowSaveModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '10px',
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 8,
                color: '#d48806',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Icon name="star" size={18} />
              Lưu người nhận yêu thích
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Button onClick={onDone}>Xong</Button>
      </div>

      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 380,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
              Lưu vào danh bạ yêu thích
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--el-muted)' }}>
              Lưu <strong>{toName}</strong> ({toPhone}) để chuyển tiền 1-chạm lần sau.
            </p>
            {saveError && (
              <p style={{ margin: 0, color: '#cf1322', fontSize: 12.5, background: '#fff1f0', padding: 8, borderRadius: 6 }}>
                {saveError}
              </p>
            )}
            <TextField
              id="favNickname"
              label="Đặt biệt danh (tuỳ chọn)"
              placeholder="Ví dụ: Mẹ, Bạn thân, Chủ nhà..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button onClick={() => setShowSaveModal(false)} style={{ background: '#f0f0f0', color: '#333' }}>
                Huỷ
              </Button>
              <Button onClick={handleSavePayee} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
