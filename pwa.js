/* Progressive Web App bootstrap — SW registration with update reload. */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  const BUILD = 'nvc-v62-no-kennel-label';
  const RELOAD_KEY = 'nvc_sw_reloaded_' + BUILD;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=' + BUILD, { scope: './' })
      .then((reg) => {
        try { reg.update(); } catch (_) { /* ignore */ }

        const askReload = () => {
          if (sessionStorage.getItem(RELOAD_KEY) === '1') return;
          sessionStorage.setItem(RELOAD_KEY, '1');
          window.location.reload();
        };

        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              askReload();
            }
          });
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          askReload();
        });
      })
      .catch((err) => {
        console.warn('[PWA] service worker registration failed', err);
      });
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'RELOAD') {
      window.location.reload();
    }
  });
})();
