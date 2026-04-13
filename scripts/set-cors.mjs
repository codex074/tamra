/**
 * set-cors.mjs — ตั้ง CORS ให้ Firebase Storage ผ่าน Google Cloud Storage API
 * Usage: node scripts/set-cors.mjs <service-account.json>
 */

import { readFileSync } from 'fs';
import { GoogleAuth } from 'google-auth-library';

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error('Usage: node scripts/set-cors.mjs <service-account.json>');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
const bucket = `${serviceAccount.project_id}.firebasestorage.app`;

const corsConfig = [
  {
    origin: [
      'https://tamraya.vercel.app',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
    maxAgeSeconds: 3600,
  },
];

async function setCors() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}?fields=cors`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cors: corsConfig }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log('✅  CORS set successfully:');
  console.log(JSON.stringify(data.cors, null, 2));
}

setCors().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
