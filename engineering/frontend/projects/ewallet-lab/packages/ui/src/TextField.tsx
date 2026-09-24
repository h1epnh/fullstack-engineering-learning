import type { InputHTMLAttributes } from 'react';

/**
 * Per MoMo's own dev-portal UX guideline ("General UX Principles"): report the
 * error reason precisely and mark the invalid field, don't just flag red.
 * https://developers.momo.vn/v3/docs/app-center/design-guideline/general-ux-principles/
 */
export function TextField({
  label,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--el-muted)',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        style={{
          fontSize: 16,
          padding: '12px 14px',
          borderRadius: 10,
          border: `1px solid ${error ? 'var(--el-danger)' : 'var(--el-line)'}`,
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          outline: 'none',
        }}
      />
      {error && (
        <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
