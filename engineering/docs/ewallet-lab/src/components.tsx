import { Fragment, type ReactNode } from 'react';
import { useNavigate } from './NavContext';

export function Crumb({ parts }: { parts: string[] }) {
  return (
    <p className="crumb">
      {parts.map((p, i) => (
        <span key={p}>
          {i > 0 && <span className="sep">/</span>}
          {p}
        </span>
      ))}
    </p>
  );
}

/** Internal cross-page link — the JSX equivalent of the old `<a data-target="...">`. */
export function PageLink({ to, children }: { to: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function Note({ kind, icon, children }: { kind?: 'warn' | 'gap'; icon: string; children: ReactNode }) {
  return (
    <div className={`note${kind ? ` ${kind}` : ''}`}>
      <span className="n-icon">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function Ep({
  verb,
  path,
  tag,
  children,
}: {
  verb: 'GET' | 'POST' | 'POST internal';
  path: string;
  tag: string;
  children: ReactNode;
}) {
  const verbClass = verb === 'GET' ? 'get' : verb === 'POST internal' ? 'post internal' : 'post';
  const verbLabel = verb === 'POST internal' ? 'POST' : verb;
  return (
    <>
      <div className="ep">
        <span className={`verb ${verbClass}`}>{verbLabel}</span>
        <span className="ep-path">{path}</span>
        <span className="ep-tag">{tag}</span>
      </div>
      <div className="ep-body">{children}</div>
    </>
  );
}

export function KvGrid({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="kv-grid">
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FieldsTable({
  head,
  rows,
}: {
  head?: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="tbl-wrap">
      <table className="fields">
        {head && (
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FieldName({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="f-name">
      {children}
      {required && <span className="req">*</span>}
    </span>
  );
}

export function FieldType({ children }: { children: ReactNode }) {
  return <span className="f-type">{children}</span>;
}

/** Renders a JSON-ish code block. `k`/`s`/`c` mark key / string-value / comment spans, matching the old CSS. */
export function CodeBlock({ children }: { children: ReactNode }) {
  return <pre className="code">{children}</pre>;
}
export const K = ({ children }: { children: ReactNode }) => <span className="k">{children}</span>;
export const S = ({ children }: { children: ReactNode }) => <span className="s">{children}</span>;
export const Comment = ({ children }: { children: ReactNode }) => <span className="c">{children}</span>;

export function SvcCard({
  to,
  lang,
  name,
  port,
  desc,
}: {
  to: string;
  lang: string;
  name: string;
  port: string;
  desc: string;
}) {
  const navigate = useNavigate();
  return (
    <button className="svc-card" onClick={() => navigate(to)}>
      <span className="svc-lang">{lang}</span>
      <span className="svc-name">{name}</span>
      <span className="svc-port">{port}</span>
      <p className="svc-desc">{desc}</p>
    </button>
  );
}

export type FlowStepData = { n: string; t: string; d: ReactNode; confirm?: boolean };

export function FlowDiagram({ steps }: { steps: FlowStepData[] }) {
  return (
    <div className="arch-diagram">
      <div className="flow">
        {steps.map((s, i) => (
          <Fragment key={s.n}>
            {i > 0 && <div className="flow-arrow">→</div>}
            <div className={`flow-step${s.confirm ? ' confirm' : ''}`}>
              <span className="fs-n">{s.n}</span>
              <span className="fs-t">{s.t}</span>
              <span className="fs-d">{s.d}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function RoadmapList({ children }: { children: ReactNode }) {
  return <div className="roadmap-list">{children}</div>;
}

export function RoadmapItem({
  status,
  title,
  children,
}: {
  status: 'planned' | 'progress' | 'done';
  title: string;
  children: ReactNode;
}) {
  const label = status === 'planned' ? 'Planned' : status === 'progress' ? 'In design' : 'Done';
  return (
    <div className="rm-item">
      <span className={`rm-status ${status}`}>{label}</span>
      <div className="rm-body">
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </div>
  );
}
