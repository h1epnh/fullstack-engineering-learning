import { ApiError, type FamilyMember, type Transaction, familyWalletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Screen, TextField, TransactionRow, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #12 — "Ví Gia Đình" (ý tưởng từ VNPay — vidientu.vnpay.vn/gioi-thieu-tinh-nang-vi-gia-dinh.html,
 * vnpay.vn/mo-vi-thanh-vien-cho-bo-me-con-cai-ngay-tren-vi-dien-tu-vnpay-x5cufcpbp1a — KHÔNG PHẢI
 * MoMo, khác toàn bộ phần còn lại của lab, xem backend DESIGN.md). Đây là màn hình của "parent":
 * thêm thành viên (đã có tài khoản Ewallet Lab, tra bằng SĐT) + đặt hạn mức chi tiêu/tháng, xem
 * tổng đã chi tháng này/hạn mức, và xem lịch sử giao dịch outbound của từng thành viên.
 *
 * MVP scope (xem backend DESIGN.md's Constraints): member vẫn là 1 user độc lập tự đăng nhập, tự
 * có ví riêng — khác VNPay thật ở chỗ member phải tự đăng ký trước. Enforcement hạn mức thật chạy
 * NGAY TẠI wallet-service's debit path — nếu member vượt hạn mức, các màn hình chuyển tiền/thanh
 * toán/rút tiền hiện có (mfe-transfer/mfe-topup/mfe-bill-payment) sẽ tự thấy lỗi 409 từ đó (dùng
 * chung generic "Số dư không đủ..." fallback hiện có cho mọi loại 409 khác, kể cả hạn mức
 * tháng/pháp luật issue #7 — đây là giới hạn đã biết từ trước, không phải gap riêng của #12).
 */
export default function FamilyWallet({ session, onBack }: { session: Session; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [phone, setPhone] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function refresh() {
    const list = await familyWalletService.listMembers(session.id);
    setMembers(list);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handleAddMember() {
    setError(undefined);
    const value = Number(limit);
    if (!phone.trim()) {
      setError('Nhập số điện thoại thành viên.');
      return;
    }
    if (!value || value <= 0) {
      setError('Nhập hạn mức hợp lệ.');
      return;
    }
    setBusy(true);
    try {
      await familyWalletService.addOrUpdateMember(session.id, phone.trim(), value);
      setPhone('');
      setLimit('');
      await refresh();
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'family-wallet'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleHistory(memberUserId: string) {
    if (historyFor === memberUserId) {
      setHistoryFor(null);
      return;
    }
    setHistoryFor(memberUserId);
    setHistoryLoading(true);
    try {
      const tx = await familyWalletService.memberHistory(session.id, memberUserId);
      setHistory(tx);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <Screen title="Ví Gia Đình" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 14px' }}>
        Đặt hạn mức chi tiêu/tháng cho thành viên gia đình (đã có tài khoản Ewallet Lab). Vượt hạn
        mức sẽ bị chặn chuyển tiền/thanh toán/rút tiền, kể cả khi số dư ví của họ vẫn đủ.
      </p>

      <Card>
        <TextField
          id="family-member-phone"
          label="Số điện thoại thành viên"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          id="family-member-limit"
          label="Hạn mức chi tiêu/tháng (VNĐ)"
          type="number"
          inputMode="numeric"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          error={error}
        />
        <Button onClick={handleAddMember} disabled={busy}>
          {busy ? 'Đang lưu…' : 'Thêm / cập nhật hạn mức'}
        </Button>
      </Card>

      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
        Thành viên
      </h2>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>
      ) : members.length === 0 ? (
        <Card>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: 0 }}>
            Chưa có thành viên nào. Thêm số điện thoại ở trên để bắt đầu.
          </p>
        </Card>
      ) : (
        members.map((m) => {
          const pct = Math.min(100, (m.spentThisMonth / m.monthlyLimit) * 100);
          const over = m.spentThisMonth >= m.monthlyLimit;
          return (
            <Card key={m.memberUserId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.memberName}</div>
                <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{m.memberPhone}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 4 }}>
                Đã chi tháng này: {formatVnd(m.spentThisMonth)} / {formatVnd(m.monthlyLimit)}
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--el-line)', overflow: 'hidden', marginBottom: 10 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: over ? '#d0021b' : 'var(--el-accent)',
                  }}
                />
              </div>
              <Button variant="secondary" onClick={() => toggleHistory(m.memberUserId)}>
                {historyFor === m.memberUserId ? 'Ẩn lịch sử' : 'Xem lịch sử chi tiêu'}
              </Button>
              {historyFor === m.memberUserId && (
                <div style={{ marginTop: 10 }}>
                  {historyLoading ? (
                    <p style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>Đang tải…</p>
                  ) : history.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>Chưa có giao dịch nào.</p>
                  ) : (
                    history.map((tx) => (
                      <TransactionRow key={tx.id} type={tx.type} amount={tx.amount} note={tx.note} createdAt={tx.createdAt} />
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })
      )}

      <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '14px 2px' }}>
        Ý tưởng lấy từ đối thủ VNPay, KHÔNG PHẢI MoMo — MVP của lab này khác VNPay thật ở chỗ thành
        viên vẫn phải tự đăng ký tài khoản Ewallet Lab trước, không có "mở ví hộ" thật.
      </p>
    </Screen>
  );
}
