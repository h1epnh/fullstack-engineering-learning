import { createContext, useContext } from 'react';

/** Lets any page component link to another page (`<PageLink to="momo-spec">`) without prop-drilling a navigate function down from App. */
export const NavContext = createContext<(id: string) => void>(() => {});

export function useNavigate() {
  return useContext(NavContext);
}
