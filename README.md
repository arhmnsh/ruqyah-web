# Ruqyah Web (Vue)

Morning and evening ruqyah shar‘iyyah as a tappable checklist, a sibling of [athkar-web](https://github.com/arhmnsh/athkar-web):

- Stacked list of Qur’anic passages and prophetic duas; tap a row to count one recitation
- Progress persisted in `localStorage`, reset after three hours away
- **Short / long form**: the long form adds ten extended passages (al-A‘rāf 117–122, Yūnus 79–82, Ṭā Hā 65–69, al-Mu’minūn 115–118, aṣ-Ṣāffāt 1–10, al-Aḥqāf 29–32, ar-Raḥmān 33–36, al-Ḥashr 21–24, al-Qalam 51–52, al-Jinn 1–9)
- **Reciting for myself / him / her**: the duas that address the person being recited over change wording (أَرْقِي نَفْسِي / أَرْقِيكَ / أَرْقِيكِ, أَعُوذُ / أُعِيذُكَ / أُعِيذُكِ, اشْفِ / اشْفِهِ / اشْفِهَا); personal adhkar stay in the first person
- **Morning / evening**: chosen from the clock, switchable; a few notes and the tahlīl count (100 in the morning, 10 in the evening) follow it
- Settings survive reloads; details page with translation, note, and source
- PWA support (installable, offline shell)

## Content

`src/data/ruqyahData.js` holds the wird. Qur’an text and the Saheeh International translation live in the generated `src/data/quranText.js`; regenerate it with:

```bash
python3 scripts/build-quran-text.py
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output lands in `dist`.

## Analytics (PostHog)

Copy `.env.example` to `.env` and set `VITE_POSTHOG_PUBLIC_KEY`, `VITE_POSTHOG_HOST`, `VITE_ANALYTICS_SITE` (default `ruqyah`) and `VITE_ANALYTICS_DOMAIN` (default `ruqyah.arhmn.sh`).

## Deployment

GitHub Pages deploys `dist` on pushes to `main`. `public/CNAME` maps the site to `ruqyah.arhmn.sh`; add a DNS `CNAME` record for `ruqyah` pointing at `arhmnsh.github.io`.
