import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * อัปโหลดรูปยาไปยัง Firebase Storage
 * URL ที่ได้จาก getDownloadURL() มี token ฝังอยู่ — ทุกคนเปิดได้โดยไม่ต้อง login
 */
export async function uploadDrugImage(file: File, drugName: string): Promise<string> {
  const ext = file.name.slice(file.name.lastIndexOf('.')) || '.jpg';
  const safeName = drugName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
  const path = `drug-images/${safeName}_${Date.now()}${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
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
