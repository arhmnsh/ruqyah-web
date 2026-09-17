import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

function collectAudioVersions(directory, prefix = '') {
  const entries = readdirSync(directory, { withFileTypes: true });

  return Object.fromEntries(entries.flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      return Object.entries(collectAudioVersions(absolutePath, relativePath));
    }

    if (!entry.name.endsWith('.mp3')) return [];

    const version = createHash('sha256')
      .update(readFileSync(absolutePath))
      .digest('hex')
      .slice(0, 12);

    return [[relativePath, version]];
  }));
}

const audioVersions = collectAudioVersions(
  fileURLToPath(new URL('./public/audio', import.meta.url)),
);

export default defineConfig({
  define: {
    'globalThis.__AUDIO_VERSIONS__': JSON.stringify(audioVersions),
  },
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon-base.svg'],
      manifest: {
        id: '/',
        name: 'Ruqyah',
        short_name: 'Ruqyah',
        description: 'Morning and evening ruqyah with tappable counters',
        theme_color: '#1a5a4e',
        background_color: '#1a5a4e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
