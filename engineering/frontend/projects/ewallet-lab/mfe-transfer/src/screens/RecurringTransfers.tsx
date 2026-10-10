import {
  type RecurringTransfer,
  type RecurringTransferLog,
  transferService,
} from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const DOW_LABELS: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  7: 'Chủ Nhật',
};

export function RecurringTransfers({
  selfUserId,
  onBack,
}: {
  selfUserId: string;
  onBack: () => void;
}) {
  const [transfers, setTransfers] = useState<RecurringTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [executionDay, setExecutionDay] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Execution logs modal state
  const [selectedTransfer, setSelectedTransfer] = useState<RecurringTransfer | null>(null);
  const [logs, setLogs] = useState<RecurringTransferLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  async function loadTransfers() {
    setLoading(true);
    setError(null);
    try {
      const data = await transferService.listRecurringTransfers(selfUserId);
      setTransfers(data);
    } catch (e: any) {
      setError(e.message || 'Không thể tải danh sách lịch chuyển tiền');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransfers();
  }, [selfUserId]);

  async function handleStatusChange(transfer: RecurringTransfer, newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') {
    try {
      const updated = await transferService.updateRecurringStatus(transfer.id, newStatus);
      setTransfers((prev) => prev.map((t) => (t.id === transfer.id ? updated : t)));
    } catch (e: any) {
      alert(e.message || 'Không thể cập nhật trạng thái lịch chuyển tiền');
    }
  }

  async function handleViewLogs(transfer: RecurringTransfer) {
    setSelectedTransfer(transfer);
    setLogsLoading(true);
    try {
      const data = await transferService.getRecurringLogs(transfer.id);
      setLogs(data);
    } catch (e: any) {
      alert(e.message || 'Không thể tải lịch sử thực thi');
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleCreate() {
    const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!phone.trim()) {
      setCreateError('Vui lòng nhập số điện thoại người nhận');
      return;
    }
    if (!parsedAmount || parsedAmount < 1000) {
      setCreateError('Số tiền chuyển tối thiểu là 1.000đ');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    try {
      await transferService.createRecurringTransfer({
        senderId: selfUserId,
        recipientPhone: phone.trim(),
        amount: parsedAmount,
        message: message.trim() || undefined,
        frequency,
        executionDay: Number(executionDay),
        startDate,
        endDate: endDate ? endDate : undefined,
      });
      setShowCreateModal(false);
      setPhone('');
      setAmount('');
      setMessage('');
      await loadTransfers();
    } catch (e: any) {
      setCreateError(e.message || 'Không thể tạo lịch chuyển tiền');
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <Screen title="Lịch chuyển tiền định kỳ" withNavGutter={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--el-accent-ink)',
            fontSize: 13,
            fontWeight: 600,
            padding: 0,
          }}
        >
          <Icon name="arrow_back" size={18} />
          Quay lại
        </button>
        <Button
          onClick={() => {
            setShowCreateModal(true);
            setCreateError(null);
          }}
          style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
        >
          <Icon name="add" size={16} style={{ marginRight: 4 }} />
          Lập lịch mới
        </Button>
      </div>

      {error && (
        <Card style={{ background: '#fff1f0', borderColor: '#ffa39e', marginBottom: 12 }}>
          <p style={{ margin: 0, color: '#cf1322', fontSize: 13 }}>{error}</p>
        </Card>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--el-muted)', padding: '20px 0' }}>Đang tải lịch chuyển tiền...</p>
      ) : transfers.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '30px 16px' }}>
          <Icon name="event_repeat" size={40} style={{ color: 'var(--el-faint)', marginBottom: 8 }} />
          <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 4px' }}>Chưa có lịch chuyển tiền nào</p>
          <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: 0 }}>
            Tự động chuyển tiền hàng tuần hoặc hàng tháng cho tiền nhà, học phí, phụng dưỡng gia đình.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transfers.map((item) => {
            const freqLabel =
              item.frequency === 'WEEKLY'
                ? `Hàng tuần (${DOW_LABELS[item.executionDay] || `Thứ ${item.executionDay}`})`
                : `Hàng tháng (Ngày ${item.executionDay})`;

            const statusBadge =
              item.status === 'ACTIVE' ? (
                <span style={{ fontSize: 11, background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  Đang bật
                </span>
              ) : item.status === 'PAUSED' ? (
                <span style={{ fontSize: 11, background: '#fffbe6', color: '#d48806', border: '1px solid #ffe58f', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  Tạm dừng
                </span>
              ) : (
                <span style={{ fontSize: 11, background: '#f5f5f5', color: '#8c8c8c', border: '1px solid #d9d9d9', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  Đã huỷ
                </span>
              );

            return (
              <Card key={item.id} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--el-accent-ink)' }}>
                      {formatVnd(item.amount)}
                    </span>
                    <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '2px 0 0' }}>
                      Đến SĐT: <strong>{item.recipientPhone}</strong>
                    </p>
                  </div>
                  {statusBadge}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12, margin: '8px 0 12px' }}>
                  <div>
                    <span style={{ color: 'var(--el-muted)' }}>Chu kỳ: </span>
                    <strong style={{ color: '#262626' }}>{freqLabel}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--el-muted)' }}>Kế tiếp: </span>
                    <strong style={{ color: '#1677ff' }}>{item.nextExecutionDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--el-muted)' }}>Gần nhất: </span>
                    <span>{item.lastExecutionDate || 'Chưa chạy'}</span>
                  </div>
                  {item.message && (
                    <div>
                      <span style={{ color: 'var(--el-muted)' }}>Lời nhắn: </span>
                      <span>{item.message}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                  <button
                    onClick={() => handleViewLogs(item)}
                    style={{
                      background: 'none',
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                      color: 'var(--el-text)',
                    }}
                  >
                    Lịch sử chạy
                  </button>

                  {item.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange(item, 'PAUSED')}
                      style={{
                        background: '#fffbe6',
                        border: '1px solid #ffe58f',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        color: '#d48806',
                        fontWeight: 600,
                      }}
                    >
                      Tạm dừng
                    </button>
                  )}

                  {item.status === 'PAUSED' && (
                    <button
                      onClick={() => handleStatusChange(item, 'ACTIVE')}
                      style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        color: '#389e0d',
                        fontWeight: 600,
                      }}
                    >
                      Tiếp tục
                    </button>
                  )}

                  {item.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(item, 'CANCELLED')}
                      style={{
                        background: 'none',
                        border: '1px solid #ffccc7',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        cursor: 'pointer',
                        color: '#cf1322',
                      }}
                    >
                      Huỷ lịch
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Lập lịch mới */}
      {showCreateModal && (
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
              maxWidth: 420,
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Lập lịch chuyển tiền định kỳ</h3>

            {createError && (
              <p style={{ margin: 0, color: '#cf1322', fontSize: 12.5, background: '#fff1f0', padding: 8, borderRadius: 6 }}>
                {createError}
              </p>
            )}

            <TextField
              id="schedRecipientPhone"
              label="Số điện thoại người nhận"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <TextField
              id="schedAmount"
              label="Số tiền chuyển (VND)"
              placeholder="50,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <TextField
              id="schedMessage"
              label="Lời nhắn (tuỳ chọn)"
              placeholder="Tiền ăn, tiền trọ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Tần suất chuyển tiền
              </label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="freq"
                    checked={frequency === 'MONTHLY'}
                    onChange={() => {
                      setFrequency('MONTHLY');
                      setExecutionDay(1);
                    }}
                  />
                  Hàng tháng
                </label>
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="freq"
                    checked={frequency === 'WEEKLY'}
                    onChange={() => {
                      setFrequency('WEEKLY');
                      setExecutionDay(1);
                    }}
                  />
                  Hàng tuần
                </label>
              </div>
            </div>

            {frequency === 'WEEKLY' ? (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Ngày trong tuần
                </label>
                <select
                  value={executionDay}
                  onChange={(e) => setExecutionDay(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13 }}
                >
                  <option value={1}>Thứ Hai</option>
                  <option value={2}>Thứ Ba</option>
                  <option value={3}>Thứ Tư</option>
                  <option value={4}>Thứ Năm</option>
                  <option value={5}>Thứ Sáu</option>
                  <option value={6}>Thứ Bảy</option>
                  <option value={7}>Chủ Nhật</option>
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Ngày trong tháng (1 - 28)
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={executionDay}
                  onChange={(e) => setExecutionDay(Math.min(28, Math.max(1, Number(e.target.value))))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 12.5, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ngày kết thúc (tuỳ chọn)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 12.5, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Disclaimer QĐ 2345/QĐ-NHNN */}
            <div
              style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 11.5,
                color: '#ad6800',
                lineHeight: 1.4,
              }}
            >
              <strong>Lưu ý:</strong> Theo QĐ 2345/QĐ-NHNN, giao dịch &gt; 10.000.000đ yêu cầu xác thực sinh trắc học trực tiếp trên máy và sẽ không tự động chuyển ngầm.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button onClick={() => setShowCreateModal(false)} style={{ background: '#f0f0f0', color: '#333' }}>
                Huỷ
              </Button>
              <Button onClick={handleCreate} disabled={createLoading}>
                {createLoading ? 'Đang tạo...' : 'Lập lịch chuyển'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lịch sử chạy */}
      {selectedTransfer && (
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
              maxWidth: 420,
              maxHeight: '80vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                Lịch sử thực thi tự động
              </h3>
              <button
                onClick={() => setSelectedTransfer(null)}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 4 }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {logsLoading ? (
              <p style={{ textAlign: 'center', color: 'var(--el-muted)', margin: '16px 0' }}>Đang tải lịch sử...</p>
            ) : logs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--el-muted)', margin: '16px 0', fontSize: 13 }}>
                Chưa có lượt chạy tự động nào cho lịch này.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {logs.map((logItem) => {
                  const isSuccess = logItem.status === 'SUCCESS';
                  return (
                    <div
                      key={logItem.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: isSuccess ? '#f6ffed' : '#fff1f0',
                        border: `1px solid ${isSuccess ? '#b7eb8f' : '#ffa39e'}`,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <strong>{formatVnd(logItem.amount)}</strong>
                        <span style={{ fontWeight: 700, color: isSuccess ? '#389e0d' : '#cf1322' }}>
                          {isSuccess
                            ? 'Thành công'
                            : logItem.status === 'FAILED_STEP_UP_REQUIRED'
                            ? 'Yêu cầu Step-Up'
                            : logItem.status === 'FAILED_INSUFFICIENT_FUNDS'
                            ? 'Không đủ số dư'
                            : 'Thất bại'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--el-muted)', fontSize: 11 }}>
                        {new Date(logItem.executedAt).toLocaleString('vi-VN')}
                      </div>
                      {logItem.errorMessage && (
                        <div style={{ color: '#cf1322', marginTop: 4, fontSize: 11.5 }}>
                          {logItem.errorMessage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Button onClick={() => setSelectedTransfer(null)} style={{ marginTop: 4 }}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </Screen>
  );
}
