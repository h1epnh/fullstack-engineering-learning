export type Session = {
  id: string;
  phone: string;
  name: string;
};

const STORAGE_KEY = 'ewallet-lab-session';

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // best-effort only — a private/blocked storage context just means the
    // session won't survive a reload, which is acceptable for this lab.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // see saveSession
  }
}
