import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { audioDownloadEntriesForItem } from '../src/data/audioManifest.js';
import { ruqyahData } from '../src/data/ruqyahData.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const entries = new Map();

for (const item of ruqyahData) {
  for (const entry of audioDownloadEntriesForItem(item)) entries.set(entry.local, entry.remote);
}

let downloaded = 0;
let alreadyPresent = 0;

for (const [local, remote] of entries) {
  const target = `${publicDir}${local.slice(1)}`;
  try {
    const existing = await stat(target);
    if (existing.size > 0) {
      alreadyPresent += 1;
      continue;
    }
  } catch {
    // The file is not present yet.
  }

  const response = await fetch(remote);
  if (!response.ok) {
    throw new Error(`Could not download ${remote}: ${response.status} ${response.statusText}`);
  }

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  downloaded += 1;
  console.log(`Downloaded ${local}`);
}

console.log(`Audio ready: ${entries.size} files (${downloaded} downloaded, ${alreadyPresent} already present).`);
