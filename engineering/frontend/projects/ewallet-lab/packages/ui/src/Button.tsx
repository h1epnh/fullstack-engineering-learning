import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  style,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: 'sm' | 'small' | 'md';
  loading?: boolean;
}) {
  const compact = size === 'sm' || size === 'small';
  const base: React.CSSProperties = {
    fontFamily: 'var(--el-font-display)',
    fontWeight: 700,
    fontSize: compact ? 13.5 : 15,
    borderRadius: 12,
    padding: compact ? '8px 12px' : '13px 18px',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'transform .08s ease',
    width: '100%',
  };
  const variants: Record<Variant, React.CSSProperties> = {
    primary: { background: 'var(--el-accent)', color: '#fff0f6' },
    secondary: {
      background: 'var(--el-accent-soft)',
      color: 'var(--el-accent-ink)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--el-muted)',
      border: '1px solid var(--el-line)',
    },
  };
  return (
    <button
      type="button"
      style={{ ...base, ...variants[variant], ...style }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    />
  );
}
