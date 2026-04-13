# TAM-RAA-YAA

เว็บแอปตำรายาโรงพยาบาลสำหรับค้นหาข้อมูลยา ตรวจสอบ IV compatibility และคำนวณขนาดยาตามข้อมูลผู้ป่วย พัฒนาด้วย React + Vite + TypeScript โดยใช้ Firebase เป็น backend หลัก และมี fallback data/local override เพื่อให้เดโมและทำงานต่อได้แม้ Firestore บางส่วนไม่พร้อม

## ฟีเจอร์ที่มีอยู่ตอนนี้

- `Drug Formulary` ค้นหาและเปิดดูรายละเอียดของยา พร้อมรูปยา ข้อมูล injection และสถานะยา
- `Dose Calculator` คำนวณขนาดยาจาก dose rule ตามประชากรผู้ป่วย พร้อมสัญญาณเตือนเช่น G6PD deficiency และ pregnancy category
- `IV Compatibility` เลือกหลายยาและ diluent เพื่อดู compatibility matrix และรายละเอียดรายคู่
- `Admin Panel` เพิ่ม แก้ไข ลบข้อมูลยา และอัปโหลดรูปขึ้น Firebase Storage
- `Authentication` ล็อกอินด้วย Firebase Auth หรือเข้า `Guest mode` เพื่อเดโม UI

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Zustand
- React Hook Form + Zod
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Storage
- Vitest

## Routes ปัจจุบัน

- `/formulary`
- `/dose-calculator`
- `/iv-compatibility`
- `/admin`
- `/login`

หมายเหตุ:

- หน้าแรก redirect ไป `/formulary`
- `Dose Calculator` มี route ใช้งานจริง แต่ยังไม่มีลิงก์ใน sidebar
- `/admin` ใช้ `ProtectedRoute` ที่เช็กแค่ว่ามี user หรือไม่ ยังไม่ได้บังคับ role ระดับ admin

## การทำงานของข้อมูล

แหล่งข้อมูลหลักในโค้ดตอนนี้:

- Firestore collections: `drugs`, `doseRules`, `ivCompatibility`, `users`
- Firebase Storage: เก็บรูปยาใน path `drug-images/...`
- Fallback data: `src/lib/mock-data.ts` และ `src/lib/imported-drugs.ts`
- Local override: `drugService` เก็บรายการที่สร้าง/แก้ไข/ลบแบบ fallback ไว้ใน `localStorage`

พฤติกรรมสำคัญ:

- `drugService.getAll()` จะพยายามอ่าน Firestore ก่อน แล้ว fallback ไป imported/mock data
- ถ้า create/update/delete Firestore ไม่สำเร็จ ระบบจะเก็บผลลัพธ์ไว้ใน `localStorage` เพื่อให้ UI ใช้งานต่อได้
- `doseRuleService` และ `ivCompatService` มี mock fallback สำหรับการอ่าน
- `audit.service.ts` ยังเป็น stub และยังไม่ได้เขียน log ลง Firestore จริง

## ติดตั้งและรัน

```bash
npm install
npm run dev
```

dev server โดยปกติจะเปิดที่:

```text
http://localhost:5173
```

## Environment Variables

ไฟล์ `.env.example` มีค่าพื้นฐานของ Firebase พร้อมใช้งาน:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

ใน `src/lib/firebase.ts` ยังมี fallback config ฝังอยู่ ดังนั้นถ้าไม่ได้ override ผ่าน `.env.local` แอปจะยังพยายามเชื่อมกับ Firebase project เดิม

ตัวเลือกเสริม:

```env
VITE_GOOGLE_CLIENT_ID=
```

ตัวแปรนี้ถูกใช้โดย `src/services/gdrive.service.ts` สำหรับอัปโหลดรูปไป Google Drive แต่ flow หลักของหน้า admin ตอนนี้ใช้งาน Firebase Storage

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

สคริปต์ช่วยงานที่มีใน repo:

- `scripts/import-drugs.mjs`
- `scripts/import_drugs_from_xlsx.py`
- `scripts/set-cors.mjs`

## โครงสร้างโปรเจกต์

```text
src/
  components/   UI และ feature components
  hooks/        custom hooks
  lib/          firebase config, mock data, utilities
  pages/        route-level pages
  services/     data access และ business logic
  store/        zustand stores
  styles/       global styles
  types/        TypeScript types
```

ไฟล์สำคัญ:

- `src/App.tsx` กำหนด routes หลัก
- `src/lib/firebase.ts` ตั้งค่า Firebase app, Firestore local cache, Auth และ Storage
- `src/services/drug.service.ts` รวม logic Firestore + fallback + localStorage override
- `src/components/drug/DrugForm.tsx` ฟอร์มจัดการข้อมูลยาและรูปภาพในหน้า admin

## Known Limitations

- `ProtectedRoute` ยังเช็กเพียงสถานะ login ไม่ได้เช็ก role จริง
- Sidebar แสดง `Admin Panel` ให้ผู้ใช้ที่ล็อกอินหรือ guest demo เท่านั้น แต่ไม่ได้แยกสิทธิ์ละเอียด
- Audit log ใน `AdminPage` ยังเป็นข้อมูลตัวอย่างแบบ hard-coded
- Google Drive upload service มีอยู่ในโค้ด แต่ยังไม่ได้ถูกใช้ใน flow หลัก

## การตรวจสอบที่แนะนำหลังแก้โค้ด

```bash
npm run build
npm run lint
npm test
```
