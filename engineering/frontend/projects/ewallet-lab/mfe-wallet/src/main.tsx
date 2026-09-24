import type { Session } from '@ewallet-lab/session';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AllServices from './screens/AllServices';
import History from './screens/History';
import Home from './screens/Home';
import Notifications from './screens/Notifications';
import ReceiveQr from './screens/ReceiveQr';

const mockSession: Session = {
  id: crypto.randomUUID(),
  phone: '0900000000',
  name: 'Standalone Dev User',
};

function Harness() {
  const [tab, setTab] = useState<'home' | 'history' | 'all-services' | 'notifications' | 'receive'>('home');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, padding: 12, background: '#fffbe6' }}>
        <button onClick={() => setTab('home')}>Home</button>
        <button onClick={() => setTab('history')}>History</button>
        <button onClick={() => setTab('all-services')}>AllServices</button>
        <button onClick={() => setTab('notifications')}>Notifications</button>
        <button onClick={() => setTab('receive')}>ReceiveQr</button>
        <span style={{ fontSize: 12 }}>standalone dev harness — no shell, mock session</span>
      </div>
      {tab === 'home' && (
        <Home
          session={mockSession}
          onTopup={() => alert('shell would navigate to mfe-topup')}
          onTransfer={() => alert('shell would navigate to mfe-transfer')}
          onBillPayment={() => alert('shell would navigate to mfe-bill-payment')}
          onReceive={() => setTab('receive')}
          onMoreServices={() => setTab('all-services')}
          onComingSoon={(f) => alert(`coming soon: ${f}`)}
          onOpenNotifications={() => setTab('notifications')}
        />
      )}
      {tab === 'history' && <History session={mockSession} />}
      {tab === 'all-services' && <AllServices onComingSoon={(f) => alert(`coming soon: ${f}`)} />}
      {tab === 'notifications' && <Notifications session={mockSession} />}
      {tab === 'receive' && <ReceiveQr session={mockSession} onBack={() => setTab('home')} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Harness />);
