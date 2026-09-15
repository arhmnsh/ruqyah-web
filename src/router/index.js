import { createRouter, createWebHistory } from 'vue-router';

import RuqyahListView from '../views/RuqyahListView.vue';
import RuqyahDetailsView from '../views/RuqyahDetailsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'ruqyah-list', component: RuqyahListView },
    { path: '/ruqyah/:id', name: 'ruqyah-details', component: RuqyahDetailsView, props: true },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
