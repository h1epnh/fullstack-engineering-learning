import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Screen({
  title,
  children,
  withNavGutter = true,
}: {
  title?: string;
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
      {children}
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--el-surface)',
        border: '1px solid var(--el-line)',
        borderRadius: 14,
        padding: 16,
        boxShadow: 'var(--el-shadow)',
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
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
      <Icon name={icon} size={30} />
      <p style={{ fontSize: 13, margin: 0, textAlign: 'center' }}>{text}</p>
    </div>
  );
}
