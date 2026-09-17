import { clientsClaim } from 'workbox-core';
import {
  addPlugins,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

self.skipWaiting();
clientsClaim();

// Add RangeRequestsPlugin to precached assets so that all precached audio files
// return HTTP 206 Partial Content when requested with Range headers (required for iOS Safari and scrubbing).
addPlugins([new RangeRequestsPlugin()]);

// Precache the app shell and static assets. Audio is intentionally runtime-cached below so a
// service-worker update never downloads the full audio library just to update the UI.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Audio URLs include a content hash from vite.config.js. CacheFirst therefore reuses unchanged
// recordings and fetches only a recording whose file content changed in a new build.
registerRoute(
  ({ request, url }) => request.destination === 'audio' || url.pathname.endsWith('.mp3'),
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new RangeRequestsPlugin(),
    ],
  }),
);

// Remove legacy unversioned audio entries created before content-hashed URLs were introduced.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open('audio-cache').then(async (cache) => {
      const requests = await cache.keys();
      await Promise.all(requests
        .filter((request) => {
          const url = new URL(request.url);
          return url.pathname.endsWith('.mp3') && !url.search;
        })
        .map((request) => cache.delete(request)));
    }),
  );
});

// SPA navigation route: map all navigation requests (e.g. /ruqyah/1) to index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
