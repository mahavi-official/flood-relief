import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const container = document.getElementById('root') as HTMLElement;

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// A built page already contains its HTML, so this hydrates rather than renders:
// the text is readable long before this script finishes downloading. The dev
// server has no prerender step, so there it falls back to a plain render.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Offline support is a bonus; the site works fine without it.
      });
  });
}
