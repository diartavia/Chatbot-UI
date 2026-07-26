/* eslint-disable */
/* tslint:disable */

/*
 * MSW Service Worker.
 * This is a simplified local worker file so the frontend can run with VITE_USE_MOCKS=true.
 * For a production app, regenerate this file with `npx msw init public/`.
 */

const MAX_RETRIES = 10;

let active = false;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (message && message.type === 'MSW_INITIALIZE') {
    active = true;
    event.ports[0]?.postMessage({ type: 'MSW_INITIALIZED' });
  }
});

self.addEventListener('fetch', () => {
  if (!active) {
    return;
  }
});