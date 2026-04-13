# TAM-RAA-YAA

<p align="center">
  <img src="./public/favicon.svg" alt="Tam-Ra-Ya logo" width="88" height="88" />
</p>

<p align="center">
  <strong>เว็บแอปตำรายาโรงพยาบาล สำหรับค้นหาข้อมูลยา ตรวจสอบ IV compatibility และจัดการ formulary ผ่าน Firebase</strong>
</p>

<p align="center">
  <a href="https://tam-ra-ya.web.app"><img src="https://img.shields.io/badge/Firebase%20Hosting-Live%20Site-ff8a00?style=for-the-badge&logo=firebase&logoColor=white" alt="Live Site" /></a>
  <img src="https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-6d5cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/TypeScript-6-2563eb?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-f59e0b?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase stack" />
</p>

---

## Overview

TAM-RAA-YAA เป็นแอป React + Vite + TypeScript สำหรับงานตำรายาในโรงพยาบาล โดยมีทั้งฝั่ง public สำหรับค้นหาข้อมูลยา และฝั่ง admin สำหรับเพิ่ม แก้ไข ลบข้อมูลยา พร้อมอัปโหลดรูปขึ้น Firebase Storage

โค้ดชุดนี้ออกแบบให้ทำงานได้แม้ backend บางส่วนไม่พร้อม ผ่านแนวทาง fallback data + local override:

- พยายามอ่านข้อมูลจาก Firestore ก่อน
- ถ้าอ่านไม่ได้ จะ fallback ไปที่ `src/lib/imported-drugs.ts` และ `src/lib/mock-data.ts`
- ถ้า create/update/delete ผ่าน Firestore ไม่สำเร็จ ระบบจะเก็บ override ใน `localStorage` เพื่อให้ UI ใช้งานต่อได้

---

## Highlights

| Module | What it does |
| --- | --- |
| `Drug Formulary` | ค้นหาและเปิดดูรายละเอียดของยา พร้อมรูปยา route สถานะ และข้อมูล injection |
| `Dose Calculator` | คำนวณขนาดยาตาม dose rule และแสดง warning เช่น G6PD deficiency / pregnancy category |
| `IV Compatibility` | เลือกหลายยาเพื่อดูความเข้ากันได้และรายละเอียดของคู่ยา |
| `Admin Panel` | จัดหน้าใหม่ให้เหลือ 2 action หลัก: `เพิ่มรายการยา` และ `แก้ไข/ลบรายการยา` พร้อม modal สำหรับเพิ่ม/แก้ไข |
| `Auth + Demo Mode` | ล็อกอินด้วย Firebase Auth หรือเข้า `Guest mode` เพื่อเดโม UI |

---

## Screens At A Glance

### Public area

- `/formulary` เป็นหน้าแรกของระบบ และ redirect จาก `/`
- sidebar แสดงลิงก์ `Drug Formulary` และ `IV Compatibility`
- `Dose Calculator` มี route ใช้งานจริงที่ `/dose-calculator` แต่ตอนนี้ยังไม่ได้แสดงใน sidebar

### Admin area

- `/admin` ถูกครอบด้วย `ProtectedRoute`
- เมื่อมี user หรือเข้า demo mode จะเห็น `Admin Panel`
- หน้า admin ปัจจุบันใช้ flow แบบ action-first:
  - ปุ่ม `เพิ่มรายการยา` เปิด modal ฟอร์มเพิ่มยา
  - ปุ่ม `แก้ไข/ลบรายการยา` ใช้เปิด/ซ่อนรายการยาเพื่อจัดการต่อ
  - modal ปิดได้ทั้งกดนอกกล่องหรือกดปุ่ม `X`

---

## Current Routes

```text
/                 -> redirect ไป /formulary
/formulary        -> หน้า Drug Formulary
/dose-calculator  -> หน้า Dose Calculator
/iv-compatibility -> หน้า IV Compatibility
/admin            -> หน้า Admin Panel (protected)
/login            -> หน้า Login
```

---

## Tech Stack

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS
- Zustand
- React Hook Form
- Zod
- lucide-react
- SweetAlert2

### Backend / Infra

- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting

### Testing / Tooling

- Vitest
- ESLint
- TypeScript build (`tsc -b`)

---

## Project Structure

```text
src/
  components/   reusable UI + feature components
  hooks/        auth / data hooks
  lib/          firebase config, mock data, labels, utilities
  pages/        route-level pages
  services/     Firestore, Storage, calculator logic
  store/        zustand stores
  styles/       global styles
  types/        TypeScript types

scripts/
  import-drugs.mjs
  set-cors.mjs
  import_drugs_from_xlsx.py
```

ไฟล์สำคัญที่ควรรู้:

- `src/App.tsx` กำหนด routes หลักของแอป
- `src/lib/firebase.ts` ตั้งค่า Firebase app, Firestore local cache, Auth และ Storage
- `src/services/drug.service.ts` รวม logic Firestore + fallback + localStorage override
- `src/components/drug/DrugForm.tsx` ฟอร์มเพิ่ม/แก้ไขข้อมูลยา
- `src/pages/AdminPage.tsx` flow ของหน้า admin ปัจจุบัน
- `src/lib/route-label.ts` แปลง label ของ route เช่น `rectal` -> `Suppo`

---

## Data Flow

### Drug data

- collection หลักคือ `drugs`
- รองรับทั้งข้อมูลจาก Firestore และ fallback dataset
- มีการ normalize สถานะยาเก่า เช่น `self_pay2` ให้กลับเป็น `self_pay`

### Dose rules

- ใช้ collection `doseRules`
- ถ้าอ่านจาก Firestore ไม่ได้ จะ fallback ไป mock data

### IV compatibility

- ใช้ collection `ivCompatibility`
- มี fallback mock เช่นเดียวกัน

### User profile

- Firebase Auth ใช้สำหรับ login
- Firestore collection `users` ใช้เก็บ profile / role
- ถ้าไม่มีเอกสารผู้ใช้ ระบบจะสร้างโปรไฟล์เริ่มต้นให้ตอน login ครั้งแรก

---

## Admin Form Notes

ฟอร์มยาในปัจจุบันรองรับข้อมูลสำคัญ เช่น:

- Generic name / Thai name / Trade name
- Strength / Therapeutic class / Dosage form
- Status ของยา
- Route หลายค่าในรายการเดียว
- ข้อมูลข้อบ่งใช้ ข้อห้ามใช้ side effects interactions
- Pregnancy category / G6PD safety / storage / notes
- ข้อมูล injection เฉพาะกรณียาฉีด
- อัปโหลดรูปยาไป Firebase Storage

Route ปัจจุบันใน UI มีเช่น `oral`, `IV`, `IM`, `SC`, `ID`, `Suppo`, `ophthalmic`

---

## Environment Variables

มีไฟล์ `.env.example` อยู่แล้วพร้อมค่าพื้นฐานของโปรเจกต์:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

หมายเหตุ:

- `src/lib/firebase.ts` มี fallback config ฝังไว้ ทำให้โปรเจกต์ยังต่อ Firebase project เดิมได้แม้ยังไม่ได้สร้าง `.env.local`
- ในเครื่อง local สามารถใช้ `.env.local` เพื่อ override ค่าได้
- มี `VITE_GOOGLE_CLIENT_ID` สำหรับ flow ฝั่ง Google Drive service ที่ยังไม่ได้ใช้เป็น main flow ตอนนี้

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

โดยปกติ dev server จะอยู่ที่:

```text
http://localhost:5173
```

### 3. Build production bundle

```bash
npm run build
```

---

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

สคริปต์เสริมใน repo:

- `scripts/import-drugs.mjs` สำหรับ import ยาขึ้น Firestore
- `scripts/import_drugs_from_xlsx.py` สำหรับ generate dataset จากไฟล์ Excel
- `scripts/set-cors.mjs` สำหรับตั้งค่า CORS ให้ Storage bucket

---

## Firebase Deployment

ค่า Firebase สำหรับโปรเจกต์นี้อยู่ใน:

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`

deploy hosting:

```bash
npm run build
firebase deploy --only hosting
```

live site ปัจจุบัน:

- [https://tam-ra-ya.web.app](https://tam-ra-ya.web.app)

---

## Known Limitations

- `ProtectedRoute` ยังเช็กเพียงว่ามี user หรือไม่ ยังไม่ได้ enforce role admin แบบเต็มรูปแบบ
- sidebar ยังไม่แสดงลิงก์ `Dose Calculator` แม้ route ใช้งานได้จริง
- audit log ในหน้า admin ยังเป็นข้อมูลตัวอย่างแบบ hard-coded
- Google Drive upload service ยังมีอยู่ในโค้ด แต่ flow หลักตอนนี้ใช้งาน Firebase Storage
- build มี warning เรื่อง bundle size จาก dataset และ bundle ปัจจุบันที่ค่อนข้างใหญ่

---

## Recommended Checks Before Shipping

```bash
npm run build
npm run lint
npm run test
```

---

## Repository Goal

โปรเจกต์นี้เหมาะกับการต่อยอดเป็น internal hospital drug information system ที่มีทั้ง:

- public formulary browsing
- medication detail reference
- dose support
- IV compatibility lookup
- admin workflow สำหรับดูแลข้อมูลยา

ถ้าจะขยายต่อ ขั้นถัดไปที่คุ้มที่สุดคือการเพิ่ม role-based access, audit log จริง, และ code-splitting สำหรับ bundle ขนาดใหญ่
