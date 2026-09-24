/**
 * Per MoMo's own guideline: show a progress indicator for slow operations and
 * give the user a way to abort — and never stack more than one loading
 * indicator on a screen at once.
 */
export function ProgressBar({ label, onCancel }: { label: string; onCancel?: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '30px 20px',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid var(--el-line)',
          borderTopColor: 'var(--el-accent)',
          animation: 'el-spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes el-spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 13.5, color: 'var(--el-muted)', textAlign: 'center', margin: 0 }}>
        {label}
      </p>
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--el-faint)',
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Huỷ
        </button>
      )}
    </div>
  );
}
