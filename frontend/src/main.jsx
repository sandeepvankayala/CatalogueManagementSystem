import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registers the service worker for offline support + installability.
// Skipped automatically inside the Capacitor native app (file:// origin has
// no benefit from it there) and in plain http dev servers that don't support it.
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal: the app still works fully without the service worker.
    });
  });
}
