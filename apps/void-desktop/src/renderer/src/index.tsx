import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import 'void-ui/theme/global.css';
// @ts-ignore
import { Knob, Fader } from 'void-ui';

declare global {
  interface Window {
    voidAPI: {
      ping: () => Promise<string>;
    };
  }
}

const App = () => {
  const [pingResponse, setPingResponse] = useState<string>('');

  useEffect(() => {
    window.voidAPI?.ping().then(setPingResponse);
  }, []);

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>VOID</h1>
      <p style={{ color: 'var(--void-text-secondary)' }}>Dark. Infinite. Spacious.</p>

      <div style={{ marginTop: '20px', display: 'flex', gap: '40px' }}>
        <Knob value={0.7} label="Volume" />
        <Fader value={0.4} />
      </div>

      <div style={{ marginTop: 'auto', color: 'var(--void-text-muted)' }}>
        IPC Status: {pingResponse || 'Waiting...'}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
