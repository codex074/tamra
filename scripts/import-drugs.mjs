/**
 * import-drugs.mjs
 * Import 985 drugs from data.local/drugs.json → Firestore
 *
 * Usage:
 *   node scripts/import-drugs.mjs <path-to-service-account.json>
 *
 * ขอ Service Account Key ได้ที่:
 *   Firebase Console → Project Settings → Service accounts → Generate new private key
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRUGS_JSON = join(__dirname, '../data.local/drugs.json');

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error('❌  Usage: node scripts/import-drugs.mjs <service-account.json>');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const drugs = JSON.parse(readFileSync(DRUGS_JSON, 'utf-8'));
const BATCH_SIZE = 400;

async function importDrugs() {
  console.log(`📦  Importing ${drugs.length} drugs in batches of ${BATCH_SIZE}...`);
  let total = 0;

  for (let i = 0; i < drugs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = drugs.slice(i, i + BATCH_SIZE);

    for (const drug of chunk) {
      const ref = db.collection('drugs').doc();
      batch.set(ref, drug);
    }

    await batch.commit();
    total += chunk.length;
    console.log(`  ✅  ${total}/${drugs.length} records committed`);
  }

  console.log(`\n🎉  Done! ${total} drugs imported to Firestore.`);
}

importDrugs().catch((err) => {
  console.error('❌  Import failed:', err.message);
  process.exit(1);
});
