export type DosageForm =
  | 'tablet'
  | 'capsule'
  | 'injection'
  | 'solution'
  | 'suspension'
  | 'cream'
  | 'ointment'
  | 'patch'
  | 'inhaler'
  | 'suppository'
  | 'eye_drops'
  | 'ear_drops'
  | 'drops'
  | 'other';

export type RouteOfAdmin =
  | 'oral'
  | 'IV'
  | 'IM'
  | 'SC'
  | 'ID'
  | 'topical'
  | 'inhalation'
  | 'sublingual'
  | 'rectal'
  | 'ophthalmic'
  | 'other';

export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N/A';
export type DrugStatus =
  | 'had'
  | 'uc_free'
  | 'staff_order'
  | 'ned_national'
  | 'all_rights'
  | 'ocpa'
  | 'ned_only'
  | 'restrict_atb'
  | 'self_pay'
  | 'self_pay2';

export interface DosingInformation {
  usualAdultDose?: string;        // ขนาดยาผู้ใหญ่ตามข้อบ่งใช้
  pediatricDose?: string;         // ขนาดยาเด็ก (mg/kg, ช่วงอายุ ฯลฯ)
  geriatricDose?: string;         // คำแนะนำสำหรับผู้สูงอายุ
  renalImpairment?: string;       // การปรับขนาดตาม CrCl / stage CKD
  hepaticImpairment?: string;     // การปรับขนาดตาม Child-Pugh / liver function
  dialysisAdjustment?: string;    // HD / PD / CRRT
  loadingDose?: string;           // loading dose (ถ้ามี)
  maxDose?: string;               // max per dose / per day
  administration?: string;        // วิธีบริหาร เช่น IV push / infusion rate
  reconstitution?: string;        // วิธีผสมสำหรับยาฉีดผง
  monitoringParameters?: string;  // parameters ที่ต้องติดตาม
}

export interface InjectionInfo {
  diluent?: string;                  // Diluent / สารละลายที่ใช้เจือจาง
  compatibleSolutions?: string;      // ชนิดสารละลายที่เข้ากัน
  administration?: string;           // วิธีการบริหารยา / Administration
  stability?: string;                // ความคงตัว (Stability)
  solutionCompatibility?: string;    // Solution Compatibility
  additiveCompatibility?: string;    // Additive Compatibility
  syringeCompatibility?: string;     // Drug in Syringe Compatibility
  ySiteCompatibility?: string;       // Y-Site Injection Compatibility
  injectableNote?: string;           // หมายเหตุสำหรับยา injectable
}

export interface Drug {
  id: string;
  displayName?: string;
  genericName: string;
  genericNameTH?: string;
  tradeName: string;
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
  pricePerUnit: number;
  status: DrugStatus;
  notes: string;
  dosing?: DosingInformation;
  injectionInfo?: InjectionInfo;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}
