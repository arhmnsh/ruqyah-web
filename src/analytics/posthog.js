import posthog from 'posthog-js';

export function initPosthogAnalytics(router) {
  const publicKey = import.meta.env.VITE_POSTHOG_PUBLIC_KEY;
  if (!publicKey) {
    return;
  }

  const site = import.meta.env.VITE_ANALYTICS_SITE || 'ruqyah';
  const siteDomain = import.meta.env.VITE_ANALYTICS_DOMAIN || 'ruqyah.arhmn.sh';

  posthog.init(publicKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  posthog.register({
    site,
    site_domain: siteDomain,
  });

  const capturePageview = (path) => {
    requestAnimationFrame(() => {
      const currentUrl = new URL(path, window.location.origin).toString();
      posthog.capture('$pageview', {
        $current_url: currentUrl,
        site,
        site_domain: siteDomain,
      });
    });
  };

  capturePageview(router.currentRoute.value.fullPath);
  router.afterEach((to) => {
    capturePageview(to.fullPath);
  });
}
