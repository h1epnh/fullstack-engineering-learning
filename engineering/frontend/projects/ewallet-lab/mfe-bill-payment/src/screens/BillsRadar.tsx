import {
  autoBillService,
  type UpcomingBillItem,
  type UpcomingBillsRadarResponse,
} from '@ewallet-lab/api-client';
import { Button, Card, EmptyState, Icon, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function BillsRadar({ userId }: { userId: string }) {
  const [radar, setRadar] = useState<UpcomingBillsRadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function loadRadar() {
    setLoading(true);
    autoBillService
      .getUpcomingRadar(userId, 30)
      .then((data) => {
        setRadar(data);
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu radar hoá đơn:', err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRadar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleApproveSpike(itemId: string) {
    setActionLoading(itemId);
    setNotification(null);
    try {
      await autoBillService.approveSpike(itemId);
      setNotification({
        type: 'success',
        text: 'Đã duyệt thanh toán thành công hoá đơn tăng đột biến. Uỷ nhiệm tự động đã trở lại trạng thái hoạt động.',
      });
      loadRadar();
    } catch (e: unknown) {
      setNotification({
        type: 'error',
        text: e instanceof Error ? e.message : 'Lỗi khi duyệt thanh toán hoá đơn tăng đột biến.',
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSkipCycle(itemId: string) {
    setActionLoading(itemId);
    setNotification(null);
    try {
      await autoBillService.skipCycle(itemId);
      setNotification({
        type: 'success',
        text: 'Đã bỏ qua kỳ thanh toán này. Lịch uỷ nhiệm các tháng sau vẫn được giữ nguyên.',
      });
      loadRadar();
    } catch (e: unknown) {
      setNotification({
        type: 'error',
        text: e instanceof Error ? e.message : 'Lỗi khi bỏ qua kỳ thanh toán.',
      });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading && !radar) {
    return (
      <Card>
        <EmptyState icon="radar" text="Đang tính toán dự báo dòng tiền 30 ngày tới…" />
      </Card>
    );
  }

  return (
    <div>
      {/* Thông báo thao tác */}
      {notification && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: notification.type === 'success' ? 'var(--el-success-soft, #e6f9ed)' : 'var(--el-danger-soft, #fde8e8)',
            color: notification.type === 'success' ? 'var(--el-success, #00875a)' : 'var(--el-danger, #de350b)',
            border: `1px solid ${notification.type === 'success' ? 'var(--el-success, #00875a)' : 'var(--el-danger, #de350b)'}`,
          }}
        >
          <Icon name={notification.type === 'success' ? 'check_circle' : 'error'} size={18} />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Hộp tóm tắt dòng tiền 7 và 30 ngày */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            borderRadius: 12,
            padding: '12px 14px',
            boxShadow: 'var(--el-shadow)',
          }}
        >
          <div style={{ fontSize: 11.5, color: 'var(--el-muted)', fontWeight: 600, marginBottom: 4 }}>
            CẦN CHUẨN BỊ 7 NGÀY TỚI
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--el-ink)' }}>
            {formatVnd(radar?.totalDueNext7Days ?? 0)}
          </div>
        </div>

        <div
          style={{
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            borderRadius: 12,
            padding: '12px 14px',
            boxShadow: 'var(--el-shadow)',
          }}
        >
          <div style={{ fontSize: 11.5, color: 'var(--el-muted)', fontWeight: 600, marginBottom: 4 }}>
            DỰ BÁO CẢ 30 NGÀY TỚI
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--el-ink)' }}>
            {formatVnd(radar?.totalDueNext30Days ?? 0)}
          </div>
        </div>
      </div>

      {/* Cảnh báo thiếu hụt số dư ví cho 7 ngày tới */}
      {radar && radar.shortfallNext7Days > 0 && (
        <div
          style={{
            background: '#fff8ea',
            border: '1.5px solid #f59e0b',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <Icon name="warning" size={22} style={{ color: '#d97706', marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#b45309', marginBottom: 2 }}>
              Ví đang thiếu {formatVnd(radar.shortfallNext7Days)} cho các hoá đơn tuần tới!
            </div>
            <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.4 }}>
              Số dư hiện tại là <strong>{formatVnd(radar.currentWalletBalance)}</strong>. Bạn nên nạp thêm tiền để tránh các lệnh thanh toán tự động bị từ chối do thiếu tiền.
            </div>
          </div>
        </div>
      )}

      {/* Tiêu đề danh sách timeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)' }}>
          Lịch chi trả dự kiến ({radar?.items.length ?? 0})
        </span>
        <button
          onClick={loadRadar}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--el-accent)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name="refresh" size={14} /> Làm mới
        </button>
      </div>

      {/* Danh sách các khoản đến hạn */}
      {(!radar || radar.items.length === 0) ? (
        <Card>
          <EmptyState
            icon="radar"
            text="Không có hoá đơn định kỳ hoặc gói dịch vụ số nào đến hạn trong 30 ngày tới."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {radar.items.map((item: UpcomingBillItem) => {
            const isHeld = item.status === 'HELD_FOR_SPIKE_REVIEW';
            const dueLabel =
              item.daysUntilDue === 0
                ? 'Hôm nay'
                : item.daysUntilDue === 1
                ? 'Ngày mai'
                : `Sau ${item.daysUntilDue} ngày (${item.dueDate})`;

            return (
              <div
                key={item.id}
                style={{
                  background: isHeld ? '#fff5f5' : 'var(--el-surface)',
                  border: `1.5px solid ${isHeld ? 'var(--el-danger, #e53e3e)' : 'var(--el-line)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  boxShadow: 'var(--el-shadow)',
                }}
              >
                {/* Dòng 1: Icon + Tên + Badge biến động */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)' }}>{item.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--el-muted)', marginTop: 2 }}>
                      Mã: <strong>{item.customerCode}</strong> • Đến hạn: <strong style={{ color: item.daysUntilDue <= 3 ? 'var(--el-accent)' : 'inherit' }}>{dueLabel}</strong>
                    </div>
                  </div>

                  {/* Badge biến động giá */}
                  {item.isSpikeDetected || isHeld ? (
                    <span
                      style={{
                        background: '#fed7d7',
                        color: '#c53030',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 20,
                        border: '1px solid #feb2b2',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⚠️ Tăng đột biến {item.changePercent ? `+${item.changePercent}%` : ''}
                    </span>
                  ) : item.changePercent !== undefined && item.changePercent !== null ? (
                    item.changePercent === 0 ? (
                      <span
                        style={{
                          background: 'var(--el-surface-2)',
                          color: 'var(--el-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 20,
                        }}
                      >
                        Không đổi
                      </span>
                    ) : item.changePercent < 0 ? (
                      <span
                        style={{
                          background: '#c6f6d5',
                          color: '#22543d',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                        }}
                      >
                        Giảm {Math.abs(item.changePercent)}%
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#feebc8',
                          color: '#7b341e',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                        }}
                      >
                        +{item.changePercent}%
                      </span>
                    )
                  ) : null}
                </div>

                {/* Dòng 2: Số tiền kỳ này và kỳ trước */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '8px 0',
                    borderTop: '1px solid var(--el-line)',
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>
                    {item.previousMonthAmount ? (
                      <span>Kỳ trước: {formatVnd(item.previousMonthAmount)}</span>
                    ) : (
                      <span>Lần đầu thanh toán</span>
                    )}
                  </span>
                  <div>
                    <span style={{ fontSize: 11.5, color: 'var(--el-muted)', marginRight: 6 }}>Dự kiến:</span>
                    <strong style={{ fontSize: 15, color: 'var(--el-ink)' }}>{formatVnd(item.expectedAmount)}</strong>
                  </div>
                </div>

                {/* Hộp hành động khi phát hiện Spike (HELD_FOR_SPIKE_REVIEW) */}
                {isHeld && (
                  <div
                    style={{
                      background: '#fff',
                      border: '1px dashed var(--el-danger, #e53e3e)',
                      borderRadius: 10,
                      padding: 12,
                      marginTop: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#c53030', marginBottom: 10, lineHeight: 1.4 }}>
                      <Icon name="shield" size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {item.heldReason || 'Hệ thống đã tạm dừng trừ tiền tự động để bạn kiểm tra số tiền tăng bất thường.'}
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSkipCycle(item.id)}
                        disabled={actionLoading === item.id}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        Bỏ qua kỳ này
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleApproveSpike(item.id)}
                        disabled={actionLoading === item.id}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        {actionLoading === item.id ? 'Đang duyệt…' : 'Xác nhận thanh toán ngay'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
