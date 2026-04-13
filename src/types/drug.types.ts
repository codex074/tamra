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
  | 'drops'
  | 'other';

export type RouteOfAdmin =
  | 'oral'
  | 'IV'
  | 'IM'
  | 'SC'
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
export type Population = 'adult' | 'pediatric' | 'neonatal' | 'geriatric';
export type RuleType = 'fixed' | 'weight_based' | 'bsa_based' | 'crcl_adjusted' | 'age_based';
export type Frequency = 'once' | 'bid' | 'tid' | 'qid' | 'q4h' | 'q6h' | 'q8h' | 'q12h' | 'q24h' | 'prn' | 'other';

export interface InjectionInfo {
  reconstitutionForm?: string;       // รูปแบบผงยา
  reconstitutionVolume?: string;     // ปริมาตรสารละลาย (reconstitution)
  compatibleSolutions?: string;      // ชนิดสารละลายที่เข้ากัน
  dilutionVolume?: string;           // ปริมาตรสารละลาย (dilution)
  stability2_8C?: string;            // ความคงตัว 2-8°C (ก่อนผสม)
  stabilityRoom?: string;            // ความคงตัวอุณหภูมิห้อง (ก่อนผสม)
  stability2_8CAfterMix?: string;    // ความคงตัว 2-8°C (หลังผสม)
  stabilityRoomAfterMix?: string;    // ความคงตัวอุณหภูมิห้อง (หลังผสม)
  injectionReference?: string;       // URL อ้างอิง
}

export interface Drug {
  id: string;
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
  injectionInfo?: InjectionInfo;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface DoseRule {
  id: string;
  drugId: string;
  ruleName: string;
  population: Population;
  ruleType: RuleType;
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
