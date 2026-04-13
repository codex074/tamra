# ตำรายา (Tam-Ra-Ya) — CLAUDE.md

> คู่มือนี้ใช้สั่งงาน Claude Code สำหรับโปรเจค Hospital Drug Formulary
> **อ่านทั้งหมดก่อนเริ่ม task ใด ๆ ทุกครั้ง**

---

## Project Overview

ระบบบัญชียาโรงพยาบาล **ตำรายา (Tam-Ra-Ya)** — web application สำหรับเภสัชกรและบุคลากรทางการแพทย์ ประกอบด้วย:

- **Drug Formulary** — บัญชียาโรงพยาบาล ค้นหา กรอง ดูรายละเอียด พร้อม dose calculator ในหน้า detail
- **IV Compatibility** — ตรวจสอบความเข้ากันได้ของยา IV และ solution (n×n matrix)
- **Admin Panel** — จัดการข้อมูลยา, audit log (protected route)

> ⚠️ **Dose Calculator ไม่มีใน sidebar** — เข้าถึงได้จาก DrugDetailModal เท่านั้น (กดเข้ารายการยาแล้วเลือก calculator)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5.x |
| Database | Firebase Firestore | 10.x |
| Auth | Firebase Authentication | 10.x |
| Hosting | Firebase Hosting | — |
| Styling | Tailwind CSS | 3.x |
| Routing | React Router | 6.x |
| State Management | Zustand | 4.x |
| Form | React Hook Form + Zod | latest |
| Font | Sarabun (Google Fonts) | — |
| Icons | Lucide React | latest |
| Testing | Vitest | latest |

---

## Firebase Configuration

```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey:            "AIzaSyCHTwMQ9RAIm_OqmnPIhp1Oxgz_Dyjgq3A",
  authDomain:        "tam-ra-ya.firebaseapp.com",
  projectId:         "tam-ra-ya",
  storageBucket:     "tam-ra-ya.firebasestorage.app",
  messagingSenderId: "864127985838",
  appId:             "1:864127985838:web:f8e76415444dc7ed54a53f"
};
```

> ⚠️ ห้ามเปลี่ยน firebaseConfig ข้างบนนี้เด็ดขาด

Firestore เปิดใช้ `enableIndexedDbPersistence` (offline cache) และ `experimentalMultiTabIndexedDbPersistence` ทุก service มี mock data fallback เมื่อ Firestore ไม่พร้อม

---

## Firestore Collections & Data Schema

### Collection: `drugs`

```typescript
interface InjectionInfo {
  reconstitutionForm?: string;       // รูปแบบผงยา
  reconstitutionVolume?: string;     // ปริมาตรสารละลาย (reconstitution)
  compatibleSolutions?: string;      // ชนิดสารละลายที่เข้ากัน
  dilutionVolume?: string;           // ปริมาตรสารละลาย (dilution)
  stability2_8C?: string;            // ความคงตัว 2-8°C ก่อนผสม
  stabilityRoom?: string;            // ความคงตัวอุณหภูมิห้อง ก่อนผสม
  stability2_8CAfterMix?: string;    // ความคงตัว 2-8°C หลังผสม
  stabilityRoomAfterMix?: string;    // ความคงตัวอุณหภูมิห้อง หลังผสม
  injectionReference?: string;       // URL อ้างอิง
}

interface Drug {
  id: string;
  genericName: string;           // ชื่อสามัญ INN — required
  genericNameTH?: string;        // ชื่อภาษาไทย (optional)
  tradeName: string;             // ชื่อการค้า
  dosageForm: DosageForm;
  strength: string;
  route: RouteOfAdmin[];
  therapeuticClass: string;
  indication: string;
  contraindication: string;
  sideEffects: string;
  interactions: string;
  pregnancyCategory: PregnancyCategory;
  g6pdSafe: boolean;
  storage: string;
  pricePerUnit: number;          // ยังอยู่ใน type แต่ไม่แสดงใน UI
  status: DrugStatus;            // ดูตาราง DrugStatus ด้านล่าง
  notes: string;
  injectionInfo?: InjectionInfo; // เฉพาะ dosageForm === 'injection'
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

type DosageForm =
  | 'tablet' | 'capsule' | 'injection' | 'solution'
  | 'suspension' | 'cream' | 'ointment' | 'patch'
  | 'inhaler' | 'suppository' | 'drops' | 'other';

type RouteOfAdmin =
  | 'oral' | 'IV' | 'IM' | 'SC' | 'topical'
  | 'inhalation' | 'sublingual' | 'rectal' | 'ophthalmic' | 'other';

type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N/A';
```

### DrugStatus — รหัสสถานะและโค้ดสี

| Key | ป้ายกำกับ | สี |
|-----|-----------|-----|
| `had` | High alert drugs (HAD) | `#0000FF` |
| `uc_free` | จ่ายฟรีเฉพาะสิทธิ UC | `#004080` |
| `staff_order` | Staff สั่งใช้/จ่ายได้ หรือต้องมีใบกำกับ | `#008000` |
| `ned_national` | ยาในบัญชียาหลักแห่งชาติ จ2 | `#008080` |
| `all_rights` | จ่ายได้ทุกสิทธิ | `#1C1C1C` |
| `ocpa` | OCPA / ยาที่มีมูลค่าสูง | `#800080` |
| `ned_only` | NED เฉพาะเบิกได้ (ไม่จ่ายฟรี) | `#FF0000` |
| `restrict_atb` | Restrict drugs (ATB) | `#FF00FF` |
| `self_pay` | ชำระเงินเองทุกสิทธิ | `#FF8000` |
| `self_pay2` | ชำระเงินเองทุกสิทธิ (2) | `#FF8040` |

สี/label อยู่ใน `src/lib/drug-status.ts` — ใช้ `getStatusColor(status)` และ `getStatusLabel(status)` เสมอ อย่า hardcode

---

### Collection: `doseRules`

```typescript
interface DoseRule {
  id: string;
  drugId: string;
  ruleName: string;
  population: Population;        // adult | pediatric | neonatal | geriatric
  ruleType: RuleType;            // fixed | weight_based | bsa_based | crcl_adjusted | age_based
  doseValue?: number;
  dosePerKg?: number;
  dosePerM2?: number;
  doseUnit: string;
  frequency: Frequency;
  minDose?: number;
  maxDose?: number;
  maxDailyDose?: number;
  renalAdjust?: string;
  hepaticAdjust?: string;
  specialNotes?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Collection: `ivCompatibility`

```typescript
interface IVCompatibility {
  id: string;
  drugAId: string;
  drugBId: string;
  solution: IVSolution;          // NSS | D5W | D5NSS | D5S3 | LRS | sterile_water | any
  compatible: CompatResult;      // Y | N | Conditional | Unknown
  concentrationA?: string;
  concentrationB?: string;
  timeLimitHr?: number;
  temperature?: StorageTemp;     // room_temp | refrigerated | protected_light
  notes?: string;
  reference?: string;
  verifiedDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Collection: `auditLogs`

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  collection: string;
  documentId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}
```

> ⚠️ `audit.service.ts` ยังเป็น stub — ใช้ `console.info()` ไม่ได้เขียน Firestore จริง

---

## File & Folder Structure

```
tam-ra-ya/
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Router — routes: /login, /formulary, /iv-compatibility, /admin
│   │
│   ├── lib/
│   │   ├── firebase.ts             # Firebase init (app, db, auth) + offline persistence
│   │   ├── drug-status.ts          # DRUG_STATUS_CONFIG, getStatusColor(), getStatusLabel()
│   │   ├── mock-data.ts            # Dev fallback: mockDrugs, mockDoseRules, mockCompat
│   │   └── utils.ts                # cn(), formatPrice(), titleCase()
│   │
│   ├── types/
│   │   ├── drug.types.ts           # Drug, DoseRule, InjectionInfo + all enums
│   │   ├── ivcompat.types.ts
│   │   ├── audit.types.ts
│   │   └── index.ts                # re-export
│   │
│   ├── hooks/
│   │   ├── useDrugs.ts             # { drugs, loading, error, refetch }
│   │   ├── useDoseRules.ts         # { rules, loading } by drugId
│   │   ├── useIVCompat.ts          # { matrix, loading }
│   │   └── useAuth.ts              # { user, ready, login, loginDemo, logout }
│   │
│   ├── services/
│   │   ├── drug.service.ts         # getAll, getById, search, create, update, softDelete
│   │   ├── doseRule.service.ts     # getByDrugId, getAll (read-only)
│   │   ├── ivcompat.service.ts     # checkPair (bidirectional), getMatrix
│   │   ├── audit.service.ts        # stub — console.info only
│   │   ├── dose.calculator.ts      # calcBSA, calcCrCl, calculateDose, inferPopulation
│   │   └── dose.calculator.test.ts # Vitest unit tests
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── ui.store.ts             # sidebar open/close
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx           # Sign in card + Guest mode
│   │   ├── DrugFormularyPage.tsx   # Single search box + pill filter chips + drug grid
│   │   ├── DoseCalculatorPage.tsx  # Drug selector + patient params + result (route: /dose-calculator แต่ไม่อยู่ใน sidebar)
│   │   ├── IVCompatPage.tsx        # Drug multi-select + solution + compat matrix
│   │   └── AdminPage.tsx           # DrugForm + audit log viewer
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Sidebar + TopBar + Outlet
│   │   │   ├── Sidebar.tsx         # Nav: Drug Formulary, IV Compatibility, (Admin if logged in)
│   │   │   ├── TopBar.tsx          # Role badge + login/logout pill button
│   │   │   └── ProtectedRoute.tsx
│   │   ├── drug/
│   │   │   ├── DrugCard.tsx        # Card พร้อม status badge สีตาม DRUG_STATUS_CONFIG
│   │   │   ├── DrugDetailModal.tsx # Modal: ชื่อยาสีตาม status, injection info section, dose rules
│   │   │   ├── DrugSearchBar.tsx   # Input พร้อม Search icon (ช่องเดียว)
│   │   │   ├── DrugFilterPanel.tsx # Pill chips กรองตาม therapeuticClass
│   │   │   └── DrugForm.tsx        # Add drug form (admin): มี status pill buttons สี, injection section conditional
│   │   ├── dose/
│   │   │   ├── PatientParamsForm.tsx
│   │   │   ├── DoseResultCard.tsx
│   │   │   └── SpecialPopulationAlert.tsx
│   │   ├── ivcompat/
│   │   │   ├── DrugSelector.tsx
│   │   │   ├── CompatMatrix.tsx
│   │   │   └── CompatDetailPopup.tsx
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorAlert.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── AppErrorBoundary.tsx
│   │
│   └── styles/
│       └── globals.css             # Sarabun font import + Tailwind directives
│
├── DESIGN.md                       # Meta Store design system reference (ใช้เป็น UI guide)
├── firestore.rules
├── firestore.indexes.json
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Design System

ออกแบบตาม **DESIGN.md** (Meta Store / Dolly design system) อ่าน DESIGN.md ก่อนแก้ UI ทุกครั้ง

### Tailwind Color Tokens (tailwind.config.ts)

```typescript
colors: {
  ink:     '#1C2B33',   // Dark Charcoal — headings
  muted:   '#5D6C7B',   // Slate Gray — body text
  line:    '#DEE3E9',   // Divider
  surface: '#FFFFFF',
  subtle:  '#F1F4F7',   // Soft Gray — secondary surface
  'near-black': '#1C1E21',
  primary: {
    DEFAULT: '#0064E0', // Meta Blue — CTA buttons
    hover:   '#0143B5',
    light:   '#E8F3FF', // badge background
  },
  success: { DEFAULT: '#007D1E', light: '#dcfce7' },
  warning: { DEFAULT: '#b45309', light: '#fef3c7' },
  danger:  { DEFAULT: '#C80A28', light: '#fee2e2' },
}
```

### Border Radius

| Value | Context |
|-------|---------|
| `rounded-[12px]` | Inputs |
| `rounded-[16px]` | Inner cards / sections |
| `rounded-[20px]` | Drug cards |
| `rounded-[24px]` | Modals, page cards |
| `rounded-pill` (100px) | ปุ่มทุกปุ่ม, chips, badges |

### Key UI Rules

- **ปุ่มทุกปุ่มเป็น pill shape** (`rounded-pill`)
- **Primary CTA** = `bg-primary text-white hover:bg-primary-hover`
- **Secondary CTA** = `border border-line text-muted hover:border-ink hover:text-ink`
- **Status badges** ใช้ hex color จาก `DRUG_STATUS_CONFIG` — ห้าม hardcode
- **ชื่อยาใน modal** เปลี่ยนสีตาม `getStatusColor(drug.status)`
- **Search** = ช่องเดียวใน DrugFormularyPage ไม่มีใน TopBar
- **Font** = Sarabun ทั้งหมด — `font: inherit` บน input/button/select

### IV Compatibility Color Coding

| ค่า | สี |
|-----|-----|
| `Y` | `bg-success-light text-success` |
| `N` | `bg-danger-light text-danger` |
| `Conditional` | `bg-warning-light text-warning` |
| `Unknown` | `bg-gray-100 text-gray-500` |

---

## Dose Calculator — Business Logic

อยู่ใน `src/services/dose.calculator.ts` (pure functions, no side effects)

```typescript
// Formulas
BSA (m²) = √( height(cm) × weight(kg) / 3600 )   [Mosteller]
CrCl (mL/min) = [(140 − age) × weight] / [72 × SCr] × 0.85 (female)  [Cockcroft-Gault]

// Special population (inferPopulation)
age < 28 days  → neonatal
age < 18 years → pediatric
else           → adult

// Alert rules
g6pdSafe == false + hasG6pdDeficiency → ERROR: block calculation
pregnancyCategory in [D, X]          → require ConfirmDialog
CrCl < 30 mL/min + renalAdjust       → WARNING
population == neonatal               → INFO
```

---

## IV Compatibility — Query Pattern

```typescript
// ต้องเช็คทั้ง 2 ทิศทาง (A→B และ B→A) เสมอ
async function checkPair(drugAId, drugBId, solution) {
  const [s1, s2] = await Promise.all([
    getDocs(query(col, where('drugAId','==',drugAId), where('drugBId','==',drugBId))),
    getDocs(query(col, where('drugAId','==',drugBId), where('drugBId','==',drugAId))),
  ]);
  return [...s1.docs, ...s2.docs].find(d => matchesSolution(d, solution)) ?? null;
}
```

---

## DrugForm — Injection Section

เมื่อ `dosageForm === 'injection'` จะแสดง section เพิ่มเติม:
- ข้อมูลการผสมยา (Reconstitution & Solution): รูปแบบผงยา, ปริมาตร reconstitution, ชนิดสารละลายที่เข้ากัน, ปริมาตร dilution
- ความคงตัว (Stability): 2-8°C ก่อน/หลังผสม, อุณหภูมิห้อง ก่อน/หลังผสม
- อ้างอิง URL

ข้อมูลนี้เก็บใน `drug.injectionInfo` (optional field)

---

## Sidebar Navigation

```typescript
// Public (ไม่ต้อง login)
Drug Formulary    → /formulary
IV Compatibility  → /iv-compatibility

// Authenticated users เพิ่ม:
Admin Panel       → /admin
```

> Dose Calculator route (`/dose-calculator`) ยังมีอยู่แต่ **ไม่ link จาก sidebar** — เข้าถึงจาก DrugDetailModal

---

## Authentication

- Firebase Auth Email/Password
- Demo mode: `loginDemo()` → local user object, ไม่ผ่าน Firebase
- Guest/public: เข้าถึง formulary และ IV compat ได้โดยไม่ต้อง login
- Protected: `/admin` ต้อง authenticated

---

## Development Phases — Current Status

### Phase 1 — Bootstrap ✅
- Vite + React + TypeScript setup
- Firebase initialized + offline cache
- Tailwind + Sarabun font
- Type definitions (drug.types.ts, ivcompat.types.ts, audit.types.ts)
- LoginPage + ProtectedRoute
- `.env.local` + firebase config

### Phase 2 — Drug Formulary ✅
- `drug.service.ts` (getAll, getById, search, create, update, softDelete)
- `useDrugs` hook
- DrugFormularyPage — single search + pill filter chips
- DrugDetailModal — full details + status color + injection info + dose rules
- DrugForm — add drug with status color picker, injection section conditional
- DrugCard — status badge with hex color

### Phase 3 — Dose Calculator ✅
- `dose.calculator.ts` pure functions + unit tests
- DoseCalculatorPage + PatientParamsForm + DoseResultCard
- SpecialPopulationAlert (G6PD, pregnancy, renal, neonatal)
- ConfirmDialog for pregnancy D/X

### Phase 4 — IV Compatibility ✅
- `ivcompat.service.ts` bidirectional pair check
- IVCompatPage — multi-select + solution dropdown
- CompatMatrix — n×n color-coded table
- CompatDetailPopup

### Phase 5 — Admin & Polish 🔄
- [x] AdminPage + DrugForm (CRUD UI)
- [x] Audit log viewer (UI เสร็จ, data ยังเป็น mock)
- [x] Responsive mobile layout
- [x] Error boundaries + Loading spinners
- [ ] **TODO**: audit.service.ts — เขียนไป Firestore จริง (ปัจจุบันเป็น stub)
- [ ] **TODO**: User management UI (role assignment)
- [ ] **TODO**: Deploy Firestore security rules + indexes
- [ ] **TODO**: `firebase deploy` → production hosting

---

## Coding Conventions

### TypeScript
- ห้ามใช้ `any` — ใช้ `unknown` แล้ว narrow
- ทุก function ระบุ return type
- `interface` สำหรับ object shapes, `type` สำหรับ unions
- Zod schema สำหรับทุก form

### React
- Functional components + explicit Props type
- Loading + Error states ทุก async operation
- ใช้ `useMemo` สำหรับ filtered/computed lists

### Error Messages
- แสดงผู้ใช้ → ภาษาไทย
- Console / dev → ภาษาอังกฤษ

### Status & Colors
- ใช้ `getStatusColor(status)` และ `getStatusLabel(status)` จาก `src/lib/drug-status.ts` เสมอ
- ห้าม hardcode hex color ของ status ใน component

### Forms (DrugForm)
- ฟิลด์ที่แสดงใน form: genericName, genericNameTH, tradeName, strength, therapeuticClass, dosageForm, status (pill picker), route, indication, contraindication, sideEffects, interactions, pregnancyCategory, g6pdSafe
- ฟิลด์ที่ **ไม่** แสดงใน form UI: pricePerUnit (ยังอยู่ใน type), storage, notes
- เมื่อ `dosageForm === 'injection'` → แสดง InjectionInfo section เพิ่ม

---

## Notes & Constraints

- **Full-text search** — client-side filter เท่านั้น (Firestore ไม่รองรับ native)
- **IV compat query** — ต้องเช็ค 2 ทิศทาง (A→B และ B→A) เสมอ
- **Mock fallback** — ทุก service มี try/catch → fallback mockData เมื่อ Firestore ไม่พร้อม
- **Offline cache** — `enableIndexedDbPersistence(db)` เปิดใช้แล้ว
- **Authentication** — Firebase Auth Email/Password + Demo mode (local)
- **Hosting** — `npm run build` → output `dist/`, deploy ด้วย `firebase deploy --only hosting`
- **Design reference** — อ่าน `DESIGN.md` ก่อนแก้ UI ทุกครั้ง
