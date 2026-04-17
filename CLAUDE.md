# CLAUDE.md

คู่มือสำหรับ agent หรือผู้รับช่วงต่อโปรเจกต์ `TAM-RA-YA` ให้เข้าใจสภาพโค้ดปัจจุบันก่อนลงมือแก้ไข

## Project Snapshot

ระบบตำรายาโรงพยาบาล (pharmacy formulary) สำหรับเภสัชกรคลินิก มี 4 พื้นที่ใช้งานหลัก:

- `Drug Information` (`/formulary`) — ค้นหาและเปิดดูรายละเอียดยาทั่วไป (รวม Dosing Information แบบข้อมูลอ้างอิง)
- `Injectable Drugs` (`/injectable-drugs`) — ดูข้อมูลยาฉีดเฉพาะ (diluent, compatibility, stability)
- `IV Compatibility` — ถูก merge เป็น component ภายในอื่น (ดู services)
- `Admin Panel` (`/admin`) — CRUD ยา อัปโหลดรูป และ audit log

นอกจากนี้มี `Clinic Landing Page` (`/clinic`) เป็นหน้าแนะนำคลินิก

หมายเหตุ: ระบบ **ไม่มี Dose Calculator** อีกแล้ว — ข้อมูลขนาดยาจะอยู่ในรูป Dosing Information ให้ผู้ใช้เปิดอ่านและคำนวณเองข้างนอก

โค้ดใช้งานจริงอยู่ใน `src/` ส่วน `_starter/` เป็น Vite+React starter template เดิม ไม่ใช่แอปหลัก ไม่ควรแก้

## Current Stack (จาก package.json)

Runtime/Framework:

- React 19.2
- React Router DOM 7.9
- TypeScript 6.0 (strict)
- Vite 8.0

State/Forms/Validation:

- Zustand 5.0 (`auth.store`, `ui.store`)
- React Hook Form 7.65 + `@hookform/resolvers`
- Zod 4.1

UI/UX:

- Tailwind CSS 3.4 + `@tailwindcss/forms`
- Lucide React (icons)
- SweetAlert2 (confirm/error dialogs)

Backend-as-a-Service:

- Firebase 12.4 (Auth + Firestore + Storage)
- `firebase-admin` + `google-auth-library` อยู่ใน devDependencies เผื่อใช้ script ฝั่ง Node

Testing:

- Vitest 4.0 (environment: node)

Linting:

- ESLint 9 + typescript-eslint + react-hooks plugin

## Scripts

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # vite preview
npm test         # vitest run
```

## Routes (src/App.tsx)

| Path                | Component               | Layout    | Guard            |
| ------------------- | ----------------------- | --------- | ---------------- |
| `/clinic`           | `ClinicLandingPage`     | ไม่มี     | public           |
| `/login`            | `LoginPage`             | ไม่มี     | public           |
| `/` (index)         | → redirect `/formulary` | AppLayout | —                |
| `/formulary`        | `DrugFormularyPage`     | AppLayout | public           |
| `/injectable-drugs` | `InjectableDrugPage`    | AppLayout | public           |
| `/admin`            | `AdminPage`             | AppLayout | `ProtectedRoute` |

ข้อสังเกตสำคัญ:

- ยังไม่มี lazy loading — ทุก page import แบบ static
- `ProtectedRoute` ปัจจุบันเช็กเฉพาะว่ามี `user` (ไม่ enforce role `admin`)
- Sidebar แสดงเมนู Admin Panel เมื่อมี user ไม่ว่าจะ role ไหน
- Sidebar มีลิงก์ Drug Information + Injectable Drug เท่านั้น (public) + Admin Panel (เมื่อ login)

## Source of Truth ในระบบ

### Authentication (`src/hooks/useAuth.ts`, `src/store/auth.store.ts`)

- ใช้ Firebase Auth ผ่าน `onAuthStateChanged`
- เมื่อ login สำเร็จ จะ resolve `UserProfile` จาก collection `users/{uid}`
- ถ้ายังไม่มี document จะสร้างใหม่พร้อม default role `pharmacist`
- ถ้า Firestore fail ยังคง login ได้ด้วย profile พื้นฐาน

รูปแบบ `UserProfile`:

```ts
{
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'pharmacist' | 'viewer'
  isDemo?: boolean
}
```

Guest (Demo) Mode — ปุ่มที่หน้า Login ฉีด demo user เข้า zustand store:

- `uid: 'demo-admin'`
- `email: 'demo@tamraya.app'`
- `role: 'admin'`
- `isDemo: true`

`isDemo: true` ใช้เป็น guard ใน `DrugForm` — เขียน Firestore ไม่ได้ แต่ write localStorage ได้

### Firestore (`src/lib/firebase.ts`)

- เปิด `persistentLocalCache` + `persistentMultipleTabManager()` ไว้แล้ว
- `firebase.ts` มี fallback config ฝังในไฟล์ — แอปรันได้แม้ไม่มี `.env.local`

Collections ที่ใช้งานจริง:

- `drugs`
- `ivCompatibility`
- `users`
- `auditLogs`

หมายเหตุ: collection `doseRules` เคยมีอยู่ใน Firestore จากฟีเจอร์ Dose Calculator เดิม แต่โค้ดไม่ได้อ่านแล้ว — ปล่อย docs ค้างได้ ไม่กระทบการทำงาน

### Services Layer (`src/services/`)

- `drug.service.ts` — CRUD ยา, fallback chain: Firestore → `imported-drugs.ts` → `mock-data.ts`; merge local overrides ตาม `updatedAt` (ล่าสุดชนะ); `stripUndefinedDeep` cleanup ก่อนเขียน Firestore
- `ivcompat.service.ts` — `checkPair(a, b, solution)` (bidirectional), `getMatrix(ids[], solution)`; solution ตรงกันหรือฝั่งหนึ่งเป็น `'any'` ถือว่าแมตช์
- `storage.service.ts` — `uploadDrugImage`, `deleteDrugImage`; แปลงไฟล์เป็น **AVIF (quality 0.8)** ด้วย Canvas ก่อน upload แล้ว fallback **WebP (quality 0.85)** ถ้า browser ไม่รองรับ AVIF encoding
- `audit.service.ts` — `log(action, collection, docId, old?, new?)`, `getLatest(n)`, `trimToLatest()`; เขียน Firestore + localStorage (cap 100) ปัจจุบัน log แค่ `CREATE`, `UPDATE`, `DELETE` (ไม่มี `VIEW`)
- `gdrive.service.ts` — stub ยังไม่ integrate กับ admin flow (เผื่อใช้ import ยาเป็น batch)

### localStorage keys ที่ใช้อยู่

- `tamraya.localDrugs` — ยาที่ edit แบบ offline/demo
- `tamraya.deletedDrugIds` — รายการ id ที่ถูก soft-delete
- `tamraya.auditLogs` — audit entries ล่าสุด (max 100)

### Drug ID Convention

- prefix `excel-*`, `local-*` → เก็บใน localStorage เท่านั้น ไม่ sync Firestore
- id อื่น ๆ → document ใน collection `drugs`

### Firebase Storage

- ยาในรูปเก็บที่ `drug-images/{safeName}_{timestamp}.{avif|webp}`
- download URL มี token ฝังอยู่ (public)

## Pages & Key Components

### Drug Formulary (`src/pages/DrugFormularyPage.tsx`)

- ค้นหา full-text ข้าม `genericName`, `genericNameTH`, `tradeName`, `therapeuticClass`, `indication`
- Pagination (10 per page)
- คลิกยาเปิด `DrugDetailModal` (`src/components/drug/DrugDetailModal.tsx`)
- แสดง HAD badge และ status สีตาม `DRUG_STATUS_CONFIG`
- `DrugDetailModal` แสดงกลุ่ม **Dosing Information** ถ้ายามี field `dosing` (แสดงเฉพาะ sub-field ที่มีค่า)

### Injectable Drug Page (`src/pages/InjectableDrugPage.tsx`)

- Filter เฉพาะยาที่มี `injectionInfo`
- แสดง diluent, compatible solutions, stability, Y-site, additive, syringe compat

### Dosing Information (Drug Form + Modal)

- **ไม่ใช่หน้าแยก** — ฝังอยู่ใน `DrugDetailModal` (view) และ `DrugForm` (edit)
- `dosing` บน `Drug` object เก็บเป็น `DosingInformation` (optional fields ทั้งหมด):
  - `usualAdultDose`, `pediatricDose`, `geriatricDose`
  - `loadingDose`, `maxDose`
  - `renalImpairment`, `hepaticImpairment`, `dialysisAdjustment`
  - `administration`, `reconstitution`, `monitoringParameters`
- ทุกช่องเป็น free-text (textarea) — เภสัชกรก๊อปจาก UpToDate / Lexicomp / เอกสารกำกับมาวางได้เลย
- ระบบ **ไม่คำนวณขนาดยา** ให้ — แสดงข้อมูลเพื่อให้ผู้ใช้คำนวณเองข้างนอก

### IV Compatibility

- Logic อยู่ใน `src/services/ivcompat.service.ts`
- Solutions ที่รองรับ: `NSS`, `D5W`, `D5NSS`, `D5S3`, `LRS`, `sterile_water`, `any`
- Result: `Y | N | Conditional | Unknown`
- มี component `CompatMatrix`, `CompatDetailPopup`, `DrugSelector` ภายใต้ `src/components/ivcompat/`

### Admin (`src/pages/AdminPage.tsx`)

- CRUD ยาผ่าน `DrugForm` (`src/components/drug/DrugForm.tsx`) — Zod + React Hook Form
- อัปโหลดรูปผ่าน `DrugImageUpload` → `storage.service.uploadDrugImage`
- Guest/demo user ถูก block ไม่ให้ save เข้า Firestore
- Audit log table อ่านจาก `auditService.getLatest()` (ไม่ใช่ hardcoded แล้ว)

## Types (`src/types/`)

- `drug.types.ts` — `Drug`, `DosingInformation`, `InjectionInfo`, `DosageForm`, `RouteOfAdmin`, `PregnancyCategory`, `DrugStatus`
- `ivcompat.types.ts` — `IVCompatibility`, `IVSolution`, `CompatResult`, `StorageTemp`
- `audit.types.ts` — `AuditLog`, `AuditAction`, `UserProfile`, `AppConfig`
- `index.ts` — barrel export

## Utility Libraries (`src/lib/`)

- `firebase.ts` — singleton `app`, `db`, `auth`, `storage` + fallback config
- `drug-status.ts` — `DRUG_STATUS_CONFIG`, `normalizeDrugStatus()` (treats `self_pay2` as `self_pay`), `getStatusColor`, `getStatusLabel` — **อย่า hardcode label/สี status ใหม่**
- `route-label.ts` — `formatRouteList()` และ helper สำหรับ RouteOfAdmin
- `sweet-alert.ts` — wrapper: `confirmAction`, `showSuccessAlert`, `showErrorAlert`
- `utils.ts` — `cn`, `formatPrice`, `titleCase`, `formatDateTime`, `formatDrugDisplayName`, `getDisplayDosageForm`
- `mock-data.ts` — ยา 3 รายการ + ivcompat 2 รายการ (ใช้เป็น fallback สุดท้าย)
- `imported-drugs.ts` — รายการยานำเข้า (dynamic import, chunk ใหญ่ ~860 kB)

## Testing

- **ยังไม่มี test file เหลืออยู่** (test เดิมของ dose calculator ถูกลบไปพร้อมฟีเจอร์)
- Run: `npm test` — Vitest จะรายงาน "No test files found" และ exit code 1 เป็นเรื่องปกติชั่วคราว
- เมื่อจะเพิ่มฟีเจอร์ใหม่ที่มี logic คำนวณ/parsing ควรเพิ่ม test คู่ไปด้วย

## Config Files

- `vite.config.ts` — React plugin, alias `@` → `./src`, test env `node`
- `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`
- `tailwind.config.ts` — theme: `primary`, `secondary`, `danger`, `success` + forms plugin
- `firebase.json` — hosting + rules
- `firestore.rules` — public read drugs/compat, admin-only write
- `storage.rules` — public read `drug-images/`, authenticated write
- `.env.example` — Firebase config (มี fallback ใน `firebase.ts` ด้วย)

## Constraints และข้อเท็จจริงที่ควรรู้ก่อนแก้

- `ProtectedRoute` ยังไม่ enforce role `admin` — เช็กแค่ `user` existence
- Sidebar แสดง Admin Panel แก่ทุก user ที่ login
- `gdrive.service.ts` ยังไม่ได้ wire เข้า UI
- `audit.service` log เฉพาะ write (ไม่ log VIEW)
- Firestore URL ของรูปยาใช้ token ฝังแบบ public (ไม่ strip token ก่อนเก็บ)
- ไม่มี service worker / PWA offline sync — offline edit ข้าม session จะหายถ้า clear storage
- `_starter/` ไม่เกี่ยวกับแอปหลัก ห้ามแก้ถ้างานเป็นแอปจริง
- Bundle `imported-drugs` ใหญ่ ~860 kB (warning ตอน build) — ถ้าจะแตะ ควรพิจารณา dynamic import / code-splitting
- Environment variable เสริม: `VITE_GOOGLE_CLIENT_ID` (ใช้กับ gdrive service ที่ยัง stub อยู่) — ไม่มีก็ไม่กระทบ flow หลัก

## Recommended Workflow

1. อ่าน `src/App.tsx` + page ที่เกี่ยวข้องก่อน เพื่อดู route จริงและ data flow
2. ถ้างานกระทบข้อมูลยา → ดู `src/services/drug.service.ts` เป็นหลัก (fallback/local override ซ้อนกันหลายชั้น)
3. ถ้างานกระทบ auth/role → ดู `src/hooks/useAuth.ts` + `src/store/auth.store.ts` + `src/components/layout/ProtectedRoute.tsx`
4. ถ้างานกระทบรูป → ดู `src/services/storage.service.ts` (ต้องเข้าใจ AVIF/WebP flow)
5. ถ้างานกระทบ Dosing Information → แก้ทั้ง `DosingInformation` ใน `src/types/drug.types.ts`, ฟอร์มใน `DrugForm.tsx`, และการแสดงใน `DrugDetailModal.tsx` ให้ sync กัน
6. หลังแก้โค้ด: `npm run lint`, `npm run build` (ตามความเกี่ยวข้อง)

## UI เครื่องใช้บ่อย

- Confirm destructive action → `confirmAction()` จาก `src/lib/sweet-alert.ts`
- Success / error alert → `showSuccessAlert()` / `showErrorAlert()`
- Status color/label → `getStatusColor()` / `getStatusLabel()` จาก `src/lib/drug-status.ts`
- Route of admin display → `formatRouteList()` จาก `src/lib/route-label.ts`
- Format Baht → `formatPrice()` จาก `src/lib/utils.ts`
