import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

async function convertImage(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      canvas.toBlob(
        (avifBlob) => {
          if (avifBlob) {
            resolve({ blob: avifBlob, ext: '.avif', contentType: 'image/avif' });
            return;
          }
          // fallback: WebP (รองรับทุก browser สมัยใหม่)
          canvas.toBlob(
            (webpBlob) => {
              if (webpBlob) resolve({ blob: webpBlob, ext: '.webp', contentType: 'image/webp' });
              else reject(new Error('Image conversion failed'));
            },
            'image/webp',
            0.85,
          );
        },
        'image/avif',
        0.8,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}

/**
 * อัปโหลดรูปยาไปยัง Firebase Storage
 * แปลงเป็น AVIF (quality 0.8) ก่อน upload — fallback เป็น WebP ถ้า browser ไม่รองรับ AVIF encoding
 * URL ที่ได้จาก getDownloadURL() มี token ฝังอยู่ — ทุกคนเปิดได้โดยไม่ต้อง login
 */
export async function uploadDrugImage(file: File, drugName: string): Promise<string> {
  const { blob, ext, contentType } = await convertImage(file);
  const safeName = drugName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
  const path = `drug-images/${safeName}_${Date.now()}${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

/**
 * ลบรูปเก่าออกจาก Firebase Storage
 * รับ URL จาก getDownloadURL() โดยตรง
 */
export async function deleteDrugImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // ไม่ critical — อาจถูกลบไปแล้วหรือ URL ไม่ถูกต้อง
    console.warn('Could not delete old drug image:', url);
  }
}
