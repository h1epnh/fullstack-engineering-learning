import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'primary',
  style,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--el-font-display)',
    fontWeight: 700,
    fontSize: 15,
    borderRadius: 12,
    padding: '13px 18px',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
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
      {...rest}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    />
  );
}
