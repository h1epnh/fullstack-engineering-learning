import type { BillCategory } from '@ewallet-lab/api-client';
import { Button, Card, EmptyState, Icon, Screen, StatusPill, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { BILL_CATEGORIES } from '../categories';
import { cancelMandate, loadMandates, type AutoBillRegistration } from '../mandates';

export function BillLookupForm({
  userId,
  onLookup,
}: {
  userId?: string;
  onLookup: (category: BillCategory, customerCode: string) => Promise<string | null>;
}) {
  const [tab, setTab] = useState<'lookup' | 'mandates'>('lookup');
  const [category, setCategory] = useState<BillCategory>('ELECTRICITY');
  const [customerCode, setCustomerCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [mandates, setMandates] = useState<AutoBillRegistration[]>([]);
  const [mandatesLoading, setMandatesLoading] = useState(false);

  function refreshMandates() {
    if (!userId) return;
    setMandatesLoading(true);
    loadMandates(userId)
      .then(setMandates)
      .catch(() => setMandates([]))
      .finally(() => setMandatesLoading(false));
  }

  useEffect(() => {
    if (userId) refreshMandates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function submit() {
    if (customerCode.trim().length === 0) return;
    setLoading(true);
    const err = await onLookup(category, customerCode.trim());
    setLoading(false);
    if (err) setError(err);
  }

  async function handleCancelMandate(mandateId: string) {
    try {
      await cancelMandate(mandateId);
    } finally {
      refreshMandates();
    }
  }

  // CANCELLED mandates are kept server-side for audit (AutoBillStatus enum), but hidden here —
  // the user already "cancelled" them from their point of view.
  const visibleMandates = mandates.filter((m) => m.status !== 'CANCELLED');

  return (
    <Screen title="Thanh toán hoá đơn" withNavGutter={false}>
      {/* Tab toggle between manual lookup and auto-debit mandates */}
      <div
        style={{
          display: 'flex',
          background: 'var(--el-surface-2)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setTab('lookup')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'lookup' ? 'var(--el-surface)' : 'none',
            color: tab === 'lookup' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'lookup' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'lookup' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Tra cứu hoá đơn
        </button>
        <button
          onClick={() => {
            setTab('mandates');
            refreshMandates();
          }}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'mandates' ? 'var(--el-surface)' : 'none',
            color: tab === 'mandates' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'mandates' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'mandates' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Uỷ quyền tự động ({visibleMandates.length})
        </button>
      </div>

      {tab === 'lookup' && (
        <>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 14px' }}>
            Đây là biller giả lập cho mục đích học tập — không phải tích hợp thật với nhà cung cấp dịch vụ nào.
          </p>

          <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Chọn loại hoá đơn</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {BILL_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setCategory(c.key);
                  setError(undefined);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 6px',
                  borderRadius: 12,
                  border: `1.5px solid ${category === c.key ? 'var(--el-accent)' : 'var(--el-line)'}`,
                  background: category === c.key ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                  cursor: 'pointer',
                }}
              >
                <Icon name={c.icon} size={20} style={{ color: category === c.key ? 'var(--el-accent-ink)' : 'var(--el-muted)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{c.label}</span>
              </button>
            ))}
          </div>

          <TextField
            id="customerCode"
            label="Mã khách hàng"
            placeholder="VD: PD01001234"
            value={customerCode}
            onChange={(e) => {
              setCustomerCode(e.target.value);
              setError(undefined);
            }}
            error={error}
          />
          <Button onClick={submit} disabled={loading || customerCode.trim().length === 0}>
            {loading ? 'Đang tra cứu…' : 'Tra cứu hoá đơn'}
          </Button>
        </>
      )}

      {tab === 'mandates' && (
        <div>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 12px' }}>
            Danh sách uỷ quyền thanh toán tự động định kỳ (Auto-debit Mandates).
          </p>

          {mandatesLoading ? (
            <Card>
              <EmptyState icon="autorenew" text="Đang tải danh sách uỷ quyền…" />
            </Card>
          ) : visibleMandates.length === 0 ? (
            <Card>
              <EmptyState
                icon="autorenew"
                text="Chưa có uỷ quyền thanh toán tự động nào. Khi thanh toán hoá đơn, bạn có thể bật tuỳ chọn 'Tự động thanh toán kỳ sau' để đăng ký."
              />
            </Card>
          ) : (
            visibleMandates.map((m) => {
              const cat = BILL_CATEGORIES.find((c) => c.key === m.category);
              return (
                <div
                  key={m.id}
                  style={{
                    background: 'var(--el-surface)',
                    border: '1px solid var(--el-line)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    marginBottom: 10,
                    boxShadow: 'var(--el-shadow)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--el-accent-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name={cat?.icon ?? 'receipt_long'} size={18} style={{ color: 'var(--el-accent-ink)' }} />
                      </span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cat?.label ?? m.category}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>{m.customerCode}</div>
                      </div>
                    </div>
                    <StatusPill status={m.status} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      padding: '6px 0',
                      borderTop: '1px solid var(--el-line)',
                      marginTop: 8,
                    }}
                  >
                    <span style={{ color: 'var(--el-muted)' }}>Hạn mức tối đa/kỳ:</span>
                    <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(m.maxAmount)}</strong>
                  </div>

                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button
                      onClick={() => handleCancelMandate(m.id)}
                      style={{
                        background: 'none',
                        border: 0,
                        color: 'var(--el-danger)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                    >
                      Huỷ uỷ quyền
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Screen>
  );
}
