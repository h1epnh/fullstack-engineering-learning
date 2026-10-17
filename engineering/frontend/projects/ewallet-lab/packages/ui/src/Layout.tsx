import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export function Screen({
  title,
  subtitle,
  onBack,
  children,
  withNavGutter = true,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  withNavGutter?: boolean;
}) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100%',
        paddingTop: 'calc(var(--el-safe-top) + 16px)',
        paddingBottom: withNavGutter ? 84 : 24,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid var(--el-line)',
            background: 'var(--el-surface)',
            color: 'var(--el-ink)',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          <Icon name="arrow_back" size={20} />
        </button>
      )}
      {title && (
        <h1
          style={{
            fontFamily: 'var(--el-font-display)',
            fontSize: 21,
            fontWeight: 800,
            margin: '0 0 16px',
          }}
        >
          {title}
        </h1>
      )}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--el-font-display)',
            fontSize: 13,
            color: 'var(--el-muted)',
            margin: title ? '-12px 0 16px' : '0 0 16px',
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export function Card({
  children,
  style,
  padding,
}: {
  children: ReactNode;
  /** Callers pass this (e.g. marginBottom between stacked cards) — it was silently
   * dropped before, because Card only accepted `children` (tsc would fail along with it). */
  style?: CSSProperties;
  /** Overrides the default 16px padding. */
  padding?: string | number;
}) {
  return (
    <div
      style={{
        background: 'var(--el-surface)',
        border: '1px solid var(--el-line)',
        borderRadius: 14,
        padding: padding ?? 16,
        boxShadow: 'var(--el-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  text,
}: {
  icon?: ReactNode | string;
  title?: string;
  description?: string;
  text?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '36px 20px',
        color: 'var(--el-faint)',
      }}
    >
      {typeof icon === 'string' ? <Icon name={icon} size={30} /> : icon}
      {title && (
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, textAlign: 'center' }}>
          {title}
        </p>
      )}
      {(description ?? text) && (
        <p style={{ fontSize: 13, margin: 0, textAlign: 'center' }}>{description ?? text}</p>
      )}
    </div>
  );
}
