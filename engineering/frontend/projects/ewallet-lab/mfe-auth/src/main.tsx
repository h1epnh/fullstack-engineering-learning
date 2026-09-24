import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Standalone dev harness — one of the concrete payoffs of the microfrontend
 * split: this app can be built/run/tested in isolation (`npm run dev -w
 * mfe-auth`) without the shell or the other remotes, using a stub instead of
 * the real onAuthenticated callback the shell would provide.
 */
createRoot(document.getElementById('root')!).render(
  <App
    onAuthenticated={(session, isNewUser) => {
      // eslint-disable-next-line no-console
      console.log('Standalone dev: would authenticate as', session, { isNewUser });
      alert(
        `(standalone dev) Authenticated as ${session.name} (${isNewUser ? 'new user → onboarding' : 'returning login'}) — the shell would take over here.`,
      );
    }}
  />,
);
