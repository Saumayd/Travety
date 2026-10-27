import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

window.gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

const origConsoleError = console.error;
const origConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  const joined = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ');

  if (joined.includes('OverQuotaMapError') || joined.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }

  // Gracefully intercept Firebase token-service-api-has-not-been-used or offline retry messages
  if (
    joined.includes('token-service-api-has-not-been-used') ||
    joined.includes('securetoken.googleapis.com') ||
    joined.includes('Could not reach Cloud Firestore backend') ||
    joined.includes('Please check your Firebase configuration')
  ) {
    window.dispatchEvent(new CustomEvent('firebase-token-api-disabled'));
    origConsoleWarn.apply(console, args);
    return;
  }

  origConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
