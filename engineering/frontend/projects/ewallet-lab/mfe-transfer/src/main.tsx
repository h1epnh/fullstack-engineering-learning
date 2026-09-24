import type { Session } from '@ewallet-lab/session';
import { createRoot } from 'react-dom/client';
import App from './App';

const mockSession: Session = {
  id: crypto.randomUUID(),
  phone: '0900000000',
  name: 'Standalone Dev User',
};

createRoot(document.getElementById('root')!).render(
  <App
    session={mockSession}
    onDone={() => alert('(standalone dev) shell would navigate back to Home now.')}
    onComingSoon={(f) => alert(`coming soon: ${f}`)}
  />,
);
