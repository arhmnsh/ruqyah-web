#!/usr/bin/env python3
"""Regenerate src/data/quranText.js from api.alquran.cloud.

Usage: python3 scripts/build-quran-text.py
Fetches each needed surah in the quran-simple and en.sahih editions and slices
the passages used by the app. The bismillah the API prefixes to every first
verse (other than al-Fatihah's own) is stripped.
"""
import json
import urllib.request

PASSAGES = [
    ('fatiha', 1, 1, 7), ('baqarah_1_5', 2, 1, 5), ('kursi', 2, 255, 255), ('baqarah_285_286', 2, 285, 286),
    ('ikhlas', 112, 1, 4), ('falaq', 113, 1, 5), ('nas', 114, 1, 6),
    ('araf', 7, 117, 122), ('yunus', 10, 79, 82), ('taha', 20, 65, 69), ('muminun', 23, 115, 118),
    ('saffat', 37, 1, 10), ('ahqaf', 46, 29, 32), ('rahman', 55, 33, 36), ('hashr', 59, 21, 24),
    ('qalam', 68, 51, 52), ('jinn', 72, 1, 9),
]
cache = {}


def load(surah):
    if surah not in cache:
        url = f'https://api.alquran.cloud/v1/surah/{surah}/editions/quran-simple,en.sahih'
        with urllib.request.urlopen(url, timeout=60) as response:
            data = json.load(response)['data']
        cache[surah] = {
            edition['edition']['identifier']: {
                ayah['numberInSurah']: ayah['text'].replace('﻿', '').strip() for ayah in edition['ayahs']
            }
            for edition in data
        }
    return cache[surah]


# The API prefixes exactly al-Fatihah's first verse to every other surah's first verse.
BISMILLAH = load(1)['quran-simple'][1]

lines = [
    '// Generated from api.alquran.cloud (editions: quran-simple, en.sahih). Do not edit by hand;',
    '// re-run scripts/build-quran-text.py after changing the passage list.',
    'export const passages = {',
]
for key, surah, first, last in PASSAGES:
    text = load(surah)
    lines.append(f'  {key}: {{ surah: {surah}, from: {first}, to: {last}, ayahs: [')
    for n in range(first, last + 1):
        arabic = text['quran-simple'][n]
        if n == 1 and surah != 1:
            assert arabic.startswith(BISMILLAH), (surah, arabic[:40])
            arabic = arabic[len(BISMILLAH):].strip()
        # A rub-el-hizb ornament opening a passage is a mushaf section mark, not part of the verse.
        arabic = arabic.lstrip('\u06de ').strip()
        english = json.dumps(text['en.sahih'][n], ensure_ascii=False)
        lines.append(f'    {{ n: {n}, ar: {json.dumps(arabic, ensure_ascii=False)}, en: {english} }},')
    lines.append('  ] },')
lines.append('};')

with open('src/data/quranText.js', 'w') as output:
    output.write('\n'.join(lines) + '\n')
print('wrote src/data/quranText.js')
