import { createApp } from 'vue';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';
import router from './router';
import { initPosthogAnalytics } from './analytics/posthog';
import './styles/base.css';

registerSW({ immediate: true });

initPosthogAnalytics(router);

createApp(App).use(router).mount('#app');
