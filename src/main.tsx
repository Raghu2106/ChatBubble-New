import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-fetch dynamic ads keys and set on global window object
(window as any).__AD_CONFIG__ = {};
fetch('/api/config')
  .then(res => res.json())
  .then(config => {
    (window as any).__AD_CONFIG__ = config;
    // Dispatch custom event to notify any mounting AdUnits
    window.dispatchEvent(new CustomEvent('ad-config-loaded', { detail: config }));
  })
  .catch(err => console.error('Failed to load dynamic ad keys:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
