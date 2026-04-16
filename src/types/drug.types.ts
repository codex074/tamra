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
export type Population = 'adult' | 'pediatric' | 'neonatal' | 'geriatric';
export type RuleType = 'fixed' | 'weight_based' | 'bsa_based' | 'crcl_adjusted' | 'age_based';
export type Frequency = 'once' | 'bid' | 'tid' | 'qid' | 'q4h' | 'q6h' | 'q8h' | 'q12h' | 'q24h' | 'prn' | 'other';

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
  dosingInfo?: string;
  injectionInfo?: InjectionInfo;
  imageUrl?: string;
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
