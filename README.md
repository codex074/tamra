# TAM-RAA-YAA

เว็บแอปสำหรับงานข้อมูลยาในโรงพยาบาล พัฒนาด้วย React + Vite + TypeScript โดยรวมฟีเจอร์หลักไว้ 3 ส่วนคือ

- Drug formulary สำหรับค้นหาข้อมูลยา
- Dose calculator สำหรับคำนวณขนาดยาตามข้อมูลผู้ป่วย
- IV compatibility สำหรับตรวจสอบความเข้ากันได้ของยาฉีด

ระบบใช้ Firebase Authentication และ Firestore เป็น backend หลัก แต่มี mock data สำรองสำหรับบาง flow ในกรณีที่อ่านข้อมูลจาก Firestore ไม่สำเร็จ

## ฟีเจอร์หลัก

### 1. Drug Formulary
- ค้นหายาตามชื่อสามัญ ชื่อการค้า กลุ่มยา และข้อบ่งใช้
- กรองตาม therapeutic class
- เปิดดูรายละเอียดของยาแต่ละรายการได้

### 2. Dose Calculator
- เลือกยาและกรอกข้อมูลผู้ป่วย เช่น น้ำหนัก ส่วนสูง อายุ และ serum creatinine
- รองรับการคำนวณแบบ fixed dose, weight-based, BSA-based และบางกรณี renal adjustment
- มี safety signal สำหรับผู้ป่วย neonatal, renal impairment, G6PD deficiency และ pregnancy category D/X

### 3. IV Compatibility
- เลือกยาได้หลายรายการ
- เลือก diluent/solution เช่น `NSS`, `D5W`, `LRS`
- แสดง compatibility matrix และดูรายละเอียดแต่ละคู่ยาได้

### 4. Admin Panel
- มีฟอร์มเพิ่มข้อมูลยาใหม่
- มีหน้าแสดง audit log แบบตัวอย่าง
- หน้า `/admin` ถูกครอบด้วย `ProtectedRoute`

### 5. Authentication
- ล็อกอินด้วย Firebase Auth
- มี `Guest mode` สำหรับเดโม UI

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Hook Form + Zod
- Tailwind CSS
- Firebase Auth
- Firestore
- Vitest

## โครงสร้างโปรเจกต์

```text
src/
  components/     UI และ feature components
  hooks/          custom hooks สำหรับ auth / drugs / IV compatibility
  lib/            firebase config, utility, mock data
  pages/          route-level pages
  services/       business logic และ data access
  store/          zustand stores
  styles/         global styles
  types/          TypeScript types
```

ไฟล์สำคัญ:

- `src/App.tsx` กำหนด route หลักของระบบ
- `src/lib/firebase.ts` ตั้งค่า Firebase app, Auth, Firestore
- `src/services/*.ts` จัดการการอ่าน/เขียนข้อมูลและ business logic
- `firestore.rules` กำหนดสิทธิ์การเข้าถึง Firestore

## การติดตั้งและรัน

### 1. ติดตั้ง dependency

```bash
npm install
```

### 2. ตั้งค่า environment variables

คัดลอก `.env.example` เป็น `.env.local`

```bash
cp .env.example .env.local
```

ค่าที่ต้องใช้:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

หมายเหตุ:

- ในโค้ดปัจจุบัน `src/lib/firebase.ts` มี fallback Firebase config ฝังอยู่ใน source
- ถึงแม้จะไม่ตั้งค่า `.env.local` แอปยังสามารถพยายามเชื่อมต่อ project Firebase ที่ระบุไว้ใน source ได้

### 3. เริ่ม development server

```bash
npm run dev
```

### 4. เปิดใน browser

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

## ข้อมูล Firestore ที่ระบบใช้งาน

collections ที่พบจากโค้ด:

- `drugs`
- `doseRules`
- `ivCompatibility`
- `users`
- `auditLogs`
- `appConfig`

mock data ถูกใช้เป็น fallback สำหรับ:

- `drugService.getAll()`
- `doseRuleService.getByDrugId()`
- `doseRuleService.getAll()`
- `ivCompatService.checkPair()`

ข้อควรรู้:

- การอ่านข้อมูลมี fallback ไป mock data
- การเขียนข้อมูล เช่น `drugService.create()` ยังเขียนตรงเข้า Firestore และไม่มี fallback

## Route หลัก

- `/formulary`
- `/dose-calculator`
- `/iv-compatibility`
- `/login`
- `/admin`

route `/admin` ต้องผ่าน `ProtectedRoute` ก่อน แต่การตรวจ role ระดับ admin ยังไม่ได้บังคับใน component นี้

## สถานะที่ตรวจสอบล่าสุด

ผลจากการตรวจใน workspace นี้:

- `npm test` ผ่าน
- `npm run build` ผ่าน
- `npm run lint` ผ่าน

หมายเหตุ:

- Vite ยังเตือนว่า production bundle หลักมีขนาดมากกว่า 500 kB หลัง minify จึงอาจควรพิจารณา code splitting เพิ่มในอนาคต

## Known Risks / Notes

### 1. Admin access ยังไม่ถูกบังคับจริง
- `ProtectedRoute` เช็กเพียงว่ามี `user` หรือไม่
- ผู้ใช้ที่ล็อกอินแล้วทุกคน รวมถึง guest demo state สามารถเข้า `/admin` ได้ในระดับ UI

### 2. Firestore rules อนุญาตให้ authenticated user เขียนข้อมูลหลักได้
- ใน `firestore.rules` collection อย่าง `drugs`, `doseRules`, `ivCompatibility` และ `appConfig` ใช้เงื่อนไข `allow write: if isAuthenticated();`
- ถ้าต้องการให้แก้ไขข้อมูลได้เฉพาะ admin ควรเปลี่ยน rules และ UI ให้สอดคล้องกัน

### 3. Audit log ยังเป็นข้อมูลตัวอย่าง
- `AdminPage` ยังใช้ `auditRows` แบบ hard-coded
- service `audit.service.ts` ยังไม่ได้ถูกต่อเข้าหน้า admin จริง

## แนวทางปรับปรุงต่อ

- แยก bundle หรือเพิ่ม code splitting เพื่อลดขนาดไฟล์ production
- เพิ่ม role-based access control สำหรับหน้า admin และ Firestore rules
- เชื่อม audit log จาก Firestore จริง
- เพิ่ม tests สำหรับ hooks และ service layer

## หมายเหตุสำหรับผู้รับช่วงต่อ

ถ้าต้องการเดโม UI อย่างรวดเร็วโดยไม่พึ่ง backend มากนัก:

1. ติดตั้ง dependency
2. รัน `npm run dev`
3. เปิดหน้า formulary / dose calculator / IV compatibility
4. ใช้ `Guest mode` เพื่อทดลอง flow login และเข้า admin page

แต่ถ้าต้องการทดสอบการเขียนข้อมูลจริง จำเป็นต้องตั้งค่า Firebase ให้พร้อม และตรวจสอบ Firestore rules ก่อนใช้งาน
