import { useEffect, useRef, useState } from 'react';
import { NavContext } from './NavContext';
import { DEFAULT_PAGE, NAV_GROUPS, isKnownPage } from './nav';
import { PAGES } from './pages';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'ewallet-lab-docs-theme';

function readInitialPage(): string {
  const fromHash = location.hash.slice(1);
  return isKnownPage(fromHash) ? fromHash : DEFAULT_PAGE;
}

export default function App() {
  const [page, setPage] = useState(readInitialPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved) setTheme(saved);
    } catch {
      // ignore — private/blocked storage, just keep the default theme
    }
  }, []);

  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // best-effort only
    }
  }, [theme]);

  function navigate(id: string) {
    if (!isKnownPage(id)) return;
    history.replaceState(null, '', `#${id}`);
    setPage(id);
    setMenuOpen(false);
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    function onHashChange() {
      setPage(readInitialPage());
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const Page = PAGES[page] ?? PAGES[DEFAULT_PAGE];

  return (
    <NavContext.Provider value={navigate}>
      <div className="topbar">
        <button onClick={() => setMenuOpen(true)} aria-label="Open navigation">
          ☰ Menu
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14 }}>Ewallet Lab Docs</span>
      </div>
      <div className={`scrim${menuOpen ? ' show' : ''}`} onClick={() => setMenuOpen(false)} />

      <div className="shell">
        <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
          <a
            className="brand"
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              navigate(DEFAULT_PAGE);
            }}
          >
            <span className="brand-mark">EL</span>
            <span className="brand-name">Ewallet Lab</span>
          </a>
          <p className="brand-sub">Developer Docs</p>
          <span className="env-pill">Internal study lab</span>

          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  className={`nav-link${item.soon ? ' soon' : ''}${page === item.id ? ' active' : ''}`}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.id);
                  }}
                >
                  <span className="nav-dot" />
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              ))}
            </div>
          ))}

          <div className="theme-toggle" role="group" aria-label="Theme">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button key={t} className={theme === t ? 'active' : ''} onClick={() => setTheme(t)}>
                {t === 'system' ? 'System' : t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </aside>

        <main id="main" ref={mainRef}>
          <Page />
        </main>
      </div>
    </NavContext.Provider>
  );
}
