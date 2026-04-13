/**
 * Google Drive service — อัปโหลดรูปยาไปยัง Google Drive
 *
 * ต้องตั้งค่า VITE_GOOGLE_CLIENT_ID ใน .env.local
 * วิธีขอ Client ID:
 *  1. ไปที่ https://console.cloud.google.com/
 *  2. APIs & Services → Credentials → Create → OAuth 2.0 Client ID
 *  3. Application type: Web application
 *  4. Authorized JS origins: http://localhost:5173 (dev) + production domain
 *  5. Copy Client ID ไปใส่ .env.local เป็น VITE_GOOGLE_CLIENT_ID=xxx
 */

const FOLDER_ID = '1yYu-DVY_0UnpKWmsG62bWe57laiW4axu';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

let cachedToken: string | null = null;
let tokenExpiry = 0;

function requestFreshToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services ยังไม่โหลดเสร็จ'));
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response: { access_token?: string; error?: string; expires_in?: number }) => {
        if (response.error ?? !response.access_token) {
          reject(new Error(response.error ?? 'OAuth failed'));
          return;
        }
        cachedToken = response.access_token!;
        tokenExpiry = Date.now() + ((response.expires_in ?? 3600) - 60) * 1000;
        resolve(cachedToken);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  return requestFreshToken();
}

/** อัปโหลดไฟล์รูปไปยัง Google Drive folder และ return file ID */
export async function uploadDrugImage(file: File, drugName: string): Promise<string> {
  if (!CLIENT_ID) {
    throw new Error('ยังไม่ได้ตั้งค่า VITE_GOOGLE_CLIENT_ID ใน .env.local');
  }

  const token = await getToken();
  const ext = file.name.slice(file.name.lastIndexOf('.'));
  const filename = `${drugName.replace(/\s+/g, '_')}_${Date.now()}${ext}`;

  const metadata = { name: filename, parents: [FOLDER_ID] };
  const body = new FormData();
  body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  body.append('file', file);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body },
  );

  if (!uploadRes.ok) {
    const detail = await uploadRes.text();
    throw new Error(`อัปโหลดไม่สำเร็จ: ${detail}`);
  }

  const { id } = (await uploadRes.json()) as { id: string };

  // ตั้งให้ไฟล์เป็น public readable
  await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  return id;
}

/** ลบไฟล์ออกจาก Drive เมื่อเปลี่ยนรูป */
export async function deleteDriveFile(fileId: string): Promise<void> {
  if (!CLIENT_ID) return;
  try {
    const token = await getToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ไม่ critical ถ้าลบไม่ได้
    console.warn('Could not delete old Drive file:', fileId);
  }
}

/** สร้าง URL สำหรับแสดงรูปจาก Google Drive file ID
 *  ใช้ uc?export=view เพื่อให้ public access เห็นได้โดยไม่ต้อง login */
export function getDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export const gdriveConfigured = Boolean(CLIENT_ID);
