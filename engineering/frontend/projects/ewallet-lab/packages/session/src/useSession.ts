import { useCallback, useState } from 'react';
import { type Session, clearSession, loadSession, saveSession } from './session';

/**
 * Deliberately NOT a shared React Context across the Module Federation
 * boundary: two independently-built remotes each get their own compiled copy
 * of this package, so a Context object created in one bundle is not `===` a
 * Context consumed in another even when React itself is deduped via
 * `shared: { react: { singleton: true } }`. Instead the shell is the single
 * owner of this hook and passes `session` + the callbacks below as plain
 * props into whichever remote it mounts — see DESIGN.md "Cross-app state".
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const login = useCallback((next: Session) => {
    saveSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return { session, login, logout };
}
