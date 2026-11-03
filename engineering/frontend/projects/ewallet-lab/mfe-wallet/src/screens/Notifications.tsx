import type { Session } from '@ewallet-lab/session';
import { Card, EmptyState, Icon, ProgressBar, Screen } from '@ewallet-lab/ui';
import { useEffect, useMemo, useState } from 'react';
import {
  type NotificationCategory,
  type NotificationItem,
  loadAllNotifications,
  loadReadIds,
  markAllRead,
  markRead,
} from '../notifications';

type TabKey = 'ALL' | NotificationCategory;

const TABS: { key: TabKey; label: string; icon?: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'ACTION_REQUIRED', label: 'Cần xử lý' },
  { key: 'BALANCE_ALERT', label: 'Biến động' },
  { key: 'REMINDER_BILL', label: 'Nhắc lịch & Hoá đơn' },
];

/**
 * Exposed as `./Notifications` (see vite.config.ts). Reached from Home's bell icon.
 * Implements Section 35 of frontend DESIGN.md: Financial Notification Center & Actionable Inbox.
 */
export default function Notifications({
  session,
  onNavigate,
  onBack,
}: {
  session: Session;
  onNavigate?: (routeKey: string, payload?: unknown) => void;
  onBack?: () => void;
}) {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

  useEffect(() => {
    loadAllNotifications(session.id).then((feed) => {
      setItems(feed);
      setReadIds(loadReadIds(session.id));
    });
  }, [session.id]);

  function handleItemClick(item: NotificationItem) {
    markRead(session.id, item.id);
    setReadIds((prev) => new Set(prev).add(item.id));
  }

  function handleActionClick(e: React.MouseEvent, item: NotificationItem) {
    e.stopPropagation();
    handleItemClick(item);
    if (item.action && onNavigate) {
      onNavigate(item.action.routeKey, item.action.payload);
    }
  }

  function handleMarkAllAsRead() {
    if (!items || items.length === 0) return;
    const allIds = items.map((i) => i.id);
    markAllRead(session.id, allIds);
    setReadIds(new Set(allIds));
  }

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (activeTab === 'ALL') return items;
    return items.filter((item) => item.category === activeTab);
  }, [items, activeTab]);

  const counts = useMemo(() => {
    if (!items) return { ALL: 0, ACTION_REQUIRED: 0, BALANCE_ALERT: 0, REMINDER_BILL: 0 };
    return {
      ALL: items.filter((i) => !readIds.has(i.id)).length,
      ACTION_REQUIRED: items.filter((i) => i.category === 'ACTION_REQUIRED' && !readIds.has(i.id)).length,
      BALANCE_ALERT: items.filter((i) => i.category === 'BALANCE_ALERT' && !readIds.has(i.id)).length,
      REMINDER_BILL: items.filter((i) => i.category === 'REMINDER_BILL' && !readIds.has(i.id)).length,
    };
  }, [items, readIds]);

  return (
    <Screen title="Thông báo" onBack={onBack} withNavGutter={false}>
      {/* Header bar with Mark all as read */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          marginTop: -6,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--el-muted)' }}>
          {items ? `${items.length} thông báo` : 'Đang đồng bộ…'}
        </span>
        {items && items.length > 0 && counts.ALL > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--el-accent)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* 4 Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 14,
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const unread = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                border: '1px solid',
                borderColor: isActive ? 'var(--el-accent)' : 'var(--el-line)',
                background: isActive ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                color: isActive ? 'var(--el-accent-ink)' : 'var(--el-ink)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flex: 'none',
              }}
            >
              <span>{tab.label}</span>
              {unread > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: tab.key === 'ACTION_REQUIRED' ? 'var(--el-danger)' : 'var(--el-accent)',
                    color: '#fff',
                    borderRadius: 10,
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    lineHeight: 1.2,
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {items === null ? (
        <ProgressBar label="Đang tải thông báo…" />
      ) : filteredItems.length === 0 ? (
        <Card>
          <EmptyState
            icon="notifications_off"
            text={
              activeTab === 'ACTION_REQUIRED'
                ? 'Không có thông báo nào cần xử lý ngay.'
                : activeTab === 'BALANCE_ALERT'
                  ? 'Chưa có biến động số dư nào.'
                  : activeTab === 'REMINDER_BILL'
                    ? 'Không có lịch nhắc hẹn hay hoá đơn đến hạn.'
                    : 'Chưa có thông báo nào.'
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredItems.map((item) => {
            const unread = !readIds.has(item.id);
            const isActionReq = item.category === 'ACTION_REQUIRED';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  background: isActionReq && unread ? 'var(--el-surface)' : 'var(--el-surface)',
                  border: isActionReq && unread ? '1.5px solid #faad14' : '1px solid var(--el-line)',
                  borderRadius: 12,
                  padding: 14,
                  cursor: 'pointer',
                  boxShadow: isActionReq && unread ? '0 2px 8px rgba(250, 173, 20, 0.15)' : 'none',
                  position: 'relative',
                }}
              >
                {/* Top line: Badge & Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: isActionReq ? '#fffbe6' : 'var(--el-accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none',
                      }}
                    >
                      <Icon
                        name={item.icon}
                        size={16}
                        style={{ color: isActionReq ? '#d46b08' : 'var(--el-accent-ink)' }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: unread ? 700 : 600,
                        color: 'var(--el-ink)',
                      }}
                    >
                      {item.title}
                    </span>
                    {unread && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: isActionReq ? '#ff4d4f' : 'var(--el-accent)',
                          flex: 'none',
                        }}
                      />
                    )}
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isActionReq ? '#fff1f0' : 'var(--el-line-subtle)',
                        color: isActionReq ? '#cf1322' : 'var(--el-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Body description */}
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--el-muted)',
                    lineHeight: 1.4,
                    marginBottom: 8,
                    paddingLeft: 34,
                  }}
                >
                  {item.body}
                </div>

                {/* Bottom line: Time & 1-Tap CTA */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 34,
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--el-faint)' }}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </span>

                  {item.action && (
                    <button
                      onClick={(e) => handleActionClick(e, item)}
                      style={{
                        background: isActionReq ? '#faad14' : 'var(--el-accent)',
                        color: isActionReq ? '#000' : '#fff',
                        border: 0,
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      {item.action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
