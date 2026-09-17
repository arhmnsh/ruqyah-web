import { createApp } from 'vue';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';
import router from './router';
import { initPosthogAnalytics } from './analytics/posthog';
import './styles/base.css';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const checkForUpdates = () => {
      void registration.update().catch(() => {
        // A transient network failure should not interrupt the app.
      });
    };

    checkForUpdates();
    window.addEventListener('focus', checkForUpdates, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdates();
    }, { passive: true });
    window.setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
  },
});

initPosthogAnalytics(router);

createApp(App).use(router).mount('#app');
