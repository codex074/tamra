# CLAUDE.md

คู่มือสั้นสำหรับ agent หรือผู้รับช่วงต่อโปรเจกต์ `TAM-RAA-YAA` ให้เข้าใจสภาพโค้ดปัจจุบันก่อนลงมือแก้ไข

## Project Snapshot

ระบบนี้เป็นเว็บตำรายาโรงพยาบาล มี 4 พื้นที่หลักในแอป:

- `Drug Formulary` สำหรับค้นหาและเปิดดูรายละเอียดยา
- `Dose Calculator` สำหรับคำนวณขนาดยาแบบ patient-specific
- `IV Compatibility` สำหรับตรวจสอบความเข้ากันได้ของยาฉีด
- `Admin Panel` สำหรับเพิ่ม แก้ไข ลบยา และอัปโหลดรูป

โค้ดใช้งานจริงอยู่ใน `src/` ส่วน `_starter/` เป็น starter template เดิม ไม่ใช่แอปหลัก

## Current Stack

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

## Current Routes

- `/login`
- `/formulary`
- `/dose-calculator`
- `/iv-compatibility`
- `/admin`

รายละเอียดสำคัญ:

- `/` redirect ไป `/formulary`
- `Dose Calculator` มี route จริง แต่ยังไม่อยู่ใน sidebar
- `/admin` ถูกครอบด้วย `ProtectedRoute` ซึ่งเช็กเฉพาะว่ามี `user`

## Source of Truth ในระบบ

### Authentication

- ใช้ Firebase Auth ผ่าน `src/hooks/useAuth.ts`
- มี `Guest mode` โดย inject demo user ลง zustand store
- ผู้ใช้ Firebase ครั้งแรกจะถูกสร้าง document ใน collection `users`

Demo user ปัจจุบัน:

- `uid: demo-admin`
- `email: demo@tamraya.app`
- `role: admin`
- `isDemo: true`

### Firestore และ fallback

ไฟล์หลัก:

- `src/lib/firebase.ts`
- `src/services/drug.service.ts`
- `src/services/doseRule.service.ts`
- `src/services/ivcompat.service.ts`

พฤติกรรมปัจจุบัน:

- Firestore ใช้ `persistentLocalCache` + `persistentMultipleTabManager`
- `drugService.getAll()` อ่าน Firestore ก่อน ถ้าไม่ได้จะ fallback ไป `imported-drugs` รวมกับ `mockDrugs`
- `doseRuleService` และ `ivCompatService` มี mock fallback เมื่ออ่าน Firestore ไม่สำเร็จ
- create/update/delete ของยา ถ้า Firestore fail จะ fallback ไป `localStorage`

localStorage keys ที่ใช้อยู่:

- `tamraya.localDrugs`
- `tamraya.deletedDrugIds`

### Storage

- flow หลักของรูปยาใช้ Firebase Storage ผ่าน `src/services/storage.service.ts`
- มี Google Drive service อยู่ใน `src/services/gdrive.service.ts` แต่ยังไม่ได้ใช้ใน admin flow ปัจจุบัน

## หน้าและคอมโพเนนต์สำคัญ

### Formulary

- หน้า: `src/pages/DrugFormularyPage.tsx`
- modal รายละเอียด: `src/components/drug/DrugDetailModal.tsx`
- ค้นหาจาก `genericName`, `genericNameTH`, `tradeName`, `therapeuticClass`, `indication`

### Dose Calculator

- หน้า: `src/pages/DoseCalculatorPage.tsx`
- calculator logic: `src/services/dose.calculator.ts`
- ใช้ `doseRuleService.getByDrugId()` แล้วเลือก rule ตาม population ที่ infer จากอายุ
- ถ้า `g6pdSafe === false` และผู้ป่วยมี G6PD deficiency จะ block ด้วย error result
- ถ้า pregnancy category เป็น `D` หรือ `X` จะขึ้น confirm dialog ก่อนคำนวณ

### IV Compatibility

- หน้า: `src/pages/IVCompatPage.tsx`
- matrix logic: `src/services/ivcompat.service.ts`
- solution ที่รองรับใน UI ตอนนี้คือ `NSS`, `D5W`, `D5NSS`, `D5S3`, `LRS`, `sterile_water`, `any`

### Admin

- หน้า: `src/pages/AdminPage.tsx`
- ฟอร์มหลัก: `src/components/drug/DrugForm.tsx`
- รองรับเพิ่ม แก้ไข ลบ และอัปโหลดรูปรยา
- audit table ในหน้านี้ยังเป็น hard-coded rows

## Data Notes

collection ที่เห็นจากโค้ดปัจจุบัน:

- `drugs`
- `doseRules`
- `ivCompatibility`
- `users`

มีไฟล์ type และ utility ที่เกี่ยวข้อง:

- `src/types/drug.types.ts`
- `src/types/ivcompat.types.ts`
- `src/types/audit.types.ts`
- `src/lib/drug-status.ts`

ข้อควรจำ:

- สีและ label ของ drug status ต้องอิงจาก `DRUG_STATUS_CONFIG` และ helper ใน `src/lib/drug-status.ts`
- อย่า hardcode status label ใหม่ถ้าไม่จำเป็น

## Constraints และข้อเท็จจริงที่ควรรู้ก่อนแก้

- `audit.service.ts` ยังเป็น stub ใช้ `console.info()` เท่านั้น
- `ProtectedRoute` ยังไม่ enforce admin role
- Sidebar แสดง `Admin Panel` เมื่อมี user ไม่ว่าจะเป็น pharmacist ปกติหรือ demo admin
- `_starter/` ไม่ควรถูกแก้ถ้างานเกี่ยวกับแอปจริง

## Commands

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

## Recommended Workflow

1. อ่าน `src/App.tsx` และหน้าที่เกี่ยวข้องก่อน เพื่อดู route จริง
2. ถ้างานกระทบข้อมูลยา ให้เช็ก `src/services/drug.service.ts` ก่อนเสมอ เพราะมี fallback/local override ซ้อนอยู่
3. ถ้างานกระทบ auth หรือสิทธิ์ ให้ดู `src/hooks/useAuth.ts`, `src/store/auth.store.ts`, และ `src/components/layout/ProtectedRoute.tsx`
4. หลังแก้โค้ด ให้รัน `npm run build`, `npm run lint`, และ `npm test` อย่างน้อยตามความเหมาะสม

## Environment Notes

`.env.example` มี Firebase config พื้นฐานครบอยู่แล้ว และ `src/lib/firebase.ts` มี fallback config ฝังไว้ด้วย

ตัวแปรเสริมที่อาจเกี่ยวข้อง:

- `VITE_GOOGLE_CLIENT_ID` สำหรับ Google Drive upload service

ถ้าไม่มีตัวแปรนี้ แอปส่วนหลักยังทำงานได้ เพราะ admin flow ใช้ Firebase Storage เป็นค่าเริ่มต้น
