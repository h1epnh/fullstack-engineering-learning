import type { Session } from '@ewallet-lab/session';
import { Icon, Screen } from '@ewallet-lab/ui';
import { useMemo, useState } from 'react';
import {
  ALL_SERVICE_CATEGORIES,
  ALL_SERVICES_FLAT,
  DEFAULT_PINNED_KEYS,
  type ServiceItem,
  normalizeVietnamese,
} from '../servicesCatalog';

const MAX_PINNED_COUNT = 7;

export default function AllServices({
  session,
  onNavigate,
  onComingSoon,
}: {
  session?: Session;
  onNavigate?: (routeKey: string) => void;
  onComingSoon: (feature: string) => void;
}) {
  const storageKey = 'ewallet_pinned_favorites_' + (session?.id || 'default');

  const [pinnedKeys, setPinnedKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON error
    }
    return DEFAULT_PINNED_KEYS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingPinned, setIsEditingPinned] = useState(false);
  const [pinnedAlert, setPinnedAlert] = useState<string | null>(null);

  const updatePinnedKeys = (newKeys: string[]) => {
    setPinnedKeys(newKeys);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newKeys));
    } catch {
      // ignore
    }
  };

  const handleTogglePin = (key: string) => {
    if (pinnedKeys.includes(key)) {
      updatePinnedKeys(pinnedKeys.filter((k) => k !== key));
      setPinnedAlert(null);
    } else {
      if (pinnedKeys.length >= MAX_PINNED_COUNT) {
        setPinnedAlert(`Đã ghim tối đa ${MAX_PINNED_COUNT} dịch vụ trên Trang chủ`);
        setTimeout(() => setPinnedAlert(null), 3000);
        return;
      }
      updatePinnedKeys([...pinnedKeys, key]);
      setPinnedAlert(null);
    }
  };

  const handleServiceClick = (item: ServiceItem) => {
    if (isEditingPinned) {
      handleTogglePin(item.key);
      return;
    }
    if (item.real && onNavigate) {
      onNavigate(item.routeKey);
    } else {
      onComingSoon(item.key);
    }
  };

  // Instant Search with diacritics removal
  const normalizedQuery = useMemo(() => normalizeVietnamese(searchQuery), [searchQuery]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;
    return ALL_SERVICES_FLAT.filter((s) => {
      const normLabel = normalizeVietnamese(s.label);
      const normCategory = normalizeVietnamese(s.category);
      if (normLabel.includes(normalizedQuery) || normCategory.includes(normalizedQuery)) {
        return true;
      }
      return s.keywords.some((kw) => normalizeVietnamese(kw).includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  const pinnedItems = useMemo(() => {
    return pinnedKeys
      .map((key) => ALL_SERVICES_FLAT.find((s) => s.key === key))
      .filter((s): s is ServiceItem => Boolean(s));
  }, [pinnedKeys]);

  return (
    <Screen title="Tất cả dịch vụ">
      {/* Subheader with Action button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--el-muted)' }}>
          {isEditingPinned ? 'Bấm vào dịch vụ để ghim / bỏ ghim' : 'Khám phá toàn bộ tiện ích'}
        </span>
        <button
          type="button"
          onClick={() => setIsEditingPinned(!isEditingPinned)}
          style={{
            background: isEditingPinned ? 'var(--el-accent)' : 'var(--el-surface)',
            color: isEditingPinned ? '#fff' : 'var(--el-accent-ink)',
            border: '1px solid var(--el-line)',
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isEditingPinned ? 'Xong' : 'Sửa ghim'}
        </button>
      </div>
      {/* Search Bar */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            borderRadius: 12,
            padding: '8px 12px',
            gap: 8,
            boxShadow: 'var(--el-shadow)',
          }}
        >
          <Icon name="search" size={20} style={{ color: 'var(--el-faint)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm dịch vụ, tiện ích (vd: điện, vé xe, vàng...)"
            style={{
              flex: 1,
              border: 0,
              background: 'transparent',
              outline: 'none',
              fontSize: 13.5,
              color: 'var(--el-ink)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: 'var(--el-faint)',
                padding: 0,
                display: 'flex',
              }}
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* Quick query chips */}
        {!searchQuery && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {['Tiền điện', 'Nạp thẻ', 'Data', 'Túi Thần Tài', 'Ví Trả Sau', 'Quỹ nhóm'].map((chip) => (
              <button
                key={chip}
                onClick={() => setSearchQuery(chip)}
                style={{
                  background: 'var(--el-surface)',
                  border: '1px solid var(--el-line)',
                  borderRadius: 16,
                  padding: '4px 10px',
                  fontSize: 11.5,
                  color: 'var(--el-faint)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {pinnedAlert && (
        <div
          style={{
            background: 'var(--el-amber-soft, #fff8e1)',
            color: 'var(--el-amber, #e65100)',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="info" size={16} />
          <span>{pinnedAlert}</span>
        </div>
      )}

      {/* Pinned favorites section */}
      {!searchResults && (
        <div
          style={{
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 18,
            boxShadow: 'var(--el-shadow)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--el-faint)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <span>📌 Dịch vụ đã ghim Trang chủ ({pinnedKeys.length}/{MAX_PINNED_COUNT})</span>
            {isEditingPinned && <span style={{ color: 'var(--el-accent)', fontSize: 11 }}>Bấm dấu - để bỏ ghim</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {pinnedItems.map((item) => (
              <div
                key={item.key}
                style={{
                  position: 'relative',
                  flex: '1 0 21%',
                  minWidth: 64,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => handleServiceClick(item)}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    width: '100%',
                    padding: 4,
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: 'var(--el-accent-soft, #fce4ec)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--el-accent-ink, #c2185b)',
                    }}
                  >
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--el-ink)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
                {isEditingPinned && (
                  <button
                    onClick={() => handleTogglePin(item.key)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 12,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#d32f2f',
                      color: '#fff',
                      border: '2px solid #fff',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    −
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results view */}
      {searchResults !== null ? (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--el-faint)' }}>
            KẾT QUẢ TÌM KIẾM ({searchResults.length})
          </div>
          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--el-faint)' }}>
              <Icon name="search_off" size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Không tìm thấy dịch vụ phù hợp</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Thử tìm bằng từ khoá khác hoặc không dấu</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {searchResults.map((item) => (
                <ServiceTile
                  key={item.key}
                  item={item}
                  isPinned={pinnedKeys.includes(item.key)}
                  isEditingPinned={isEditingPinned}
                  onClick={() => handleServiceClick(item)}
                  onTogglePin={() => handleTogglePin(item.key)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Categorized Services List */
        <div>
          {ALL_SERVICE_CATEGORIES.map((cat, idx) => (
            <div key={cat.name} style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--el-ink)',
                  marginBottom: 10,
                  borderBottom: '1px solid var(--el-line)',
                  paddingBottom: 6,
                }}
              >
                <Icon name={cat.icon} size={18} style={{ color: 'var(--el-accent-ink)' }} />
                <span>
                  {idx + 1}. {cat.name}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {cat.items.map((item) => (
                  <ServiceTile
                    key={item.key}
                    item={item}
                    isPinned={pinnedKeys.includes(item.key)}
                    isEditingPinned={isEditingPinned}
                    onClick={() => handleServiceClick(item)}
                    onTogglePin={() => handleTogglePin(item.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}

function ServiceTile({
  item,
  isPinned,
  isEditingPinned,
  onClick,
  onTogglePin,
}: {
  item: ServiceItem;
  isPinned: boolean;
  isEditingPinned: boolean;
  onClick: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        flex: '1 0 21%',
        minWidth: 68,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <button
        onClick={onClick}
        style={{
          background: 'none',
          border: 0,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: 6,
        }}
      >
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--el-shadow)',
            color: 'var(--el-accent-ink, #c2185b)',
          }}
        >
          <Icon name={item.icon} size={22} />
        </span>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--el-ink)',
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          {item.label}
        </span>
        {!item.real && (
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--el-amber, #e65100)' }}>SẮP RA MẮT</span>
        )}
      </button>

      {isEditingPinned && (
        <button
          onClick={onTogglePin}
          style={{
            position: 'absolute',
            top: 2,
            right: 10,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: isPinned ? '#d32f2f' : '#2e7d32',
            color: '#fff',
            border: '2px solid #fff',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          {isPinned ? '−' : '+'}
        </button>
      )}
    </div>
  );
}
