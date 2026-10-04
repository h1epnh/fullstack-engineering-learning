import { useEffect, useRef, useState } from 'react';
import { NavContext } from './NavContext';
import { DEFAULT_PAGE_BY_SPACE, type Space, buildHash, navGroupsFor, parseHash } from './nav';
import { PAGES } from './pages';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'ewallet-lab-docs-theme';

function readInitialState(): { space: Space; page: string } {
  return parseHash(location.hash);
}

export default function App() {
  const [{ space, page }, setLocation] = useState(readInitialState);
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

  /** `toSpace` defaults to the current space, so existing callers (PageLink, sidebar links) that
   * only pass an id keep navigating within the same space — only the segmented-control switch
   * passes an explicit target space. */
  function navigate(id: string, toSpace: Space = space) {
    const hash = buildHash(toSpace, id);
    history.replaceState(null, '', hash);
    setLocation(parseHash(hash));
    setMenuOpen(false);
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  function switchSpace(next: Space) {
    if (next === space) return;
    navigate(DEFAULT_PAGE_BY_SPACE[next], next);
  }

  useEffect(() => {
    function onHashChange() {
      setLocation(parseHash(location.hash));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navGroups = navGroupsFor(space);
  const Page = PAGES[page] ?? PAGES[DEFAULT_PAGE_BY_SPACE[space]];

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
            href={buildHash(space, DEFAULT_PAGE_BY_SPACE[space])}
            onClick={(e) => {
              e.preventDefault();
              navigate(DEFAULT_PAGE_BY_SPACE[space]);
            }}
          >
            <span className="brand-mark">EL</span>
            <span className="brand-name">Ewallet Lab</span>
          </a>

          <div className="space-toggle" role="group" aria-label="Chọn không gian tài liệu">
            <button className={space === 'developer' ? 'active' : ''} onClick={() => switchSpace('developer')}>
              Developer
            </button>
            <button className={space === 'business' ? 'active' : ''} onClick={() => switchSpace('business')}>
              Business
            </button>
          </div>
          <span className="env-pill">Internal study lab</span>

          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  className={`nav-link${item.soon ? ' soon' : ''}${page === item.id ? ' active' : ''}`}
                  href={buildHash(space, item.id)}
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
