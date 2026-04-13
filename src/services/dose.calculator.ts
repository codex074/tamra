import type { DoseRule, Population } from '@/types';

export interface PatientParams {
  weightKg: number;
  heightCm?: number;
  ageYears: number;
  ageMonths?: number;
  scrMgDl?: number;
  isFemale?: boolean;
  population: Population;
  hasG6pdDeficiency?: boolean;
}

export interface DoseWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export interface DoseResult {
  ruleName: string;
  calculatedDose: number;
  doseUnit: string;
  frequency: string;
  maxDailyDose?: number;
  bsaM2?: number;
  crclMlMin?: number;
  renalAdjust?: string;
  specialNotes?: string;
  reference?: string;
  warnings: DoseWarning[];
}

export function calcBSA(weightKg: number, heightCm: number): number {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function calcCrCl(ageYears: number, weightKg: number, scrMgDl: number, isFemale = false): number {
  const crcl = ((140 - ageYears) * weightKg) / (72 * scrMgDl);
  return isFemale ? crcl * 0.85 : crcl;
}

export function inferPopulation(ageYears: number): Population {
  if (ageYears < 28 / 365) {
    return 'neonatal';
  }
  if (ageYears < 18) {
    return 'pediatric';
  }
  if (ageYears >= 65) {
    return 'geriatric';
  }
  return 'adult';
}

export function calculateDose(rule: DoseRule, patient: PatientParams): DoseResult {
  const warnings: DoseWarning[] = [];
  const bsa = patient.heightCm ? calcBSA(patient.weightKg, patient.heightCm) : undefined;
  const crcl =
    typeof patient.scrMgDl === 'number'
      ? calcCrCl(patient.ageYears, patient.weightKg, patient.scrMgDl, patient.isFemale)
      : undefined;

  let dose = 0;
  switch (rule.ruleType) {
    case 'fixed':
    case 'crcl_adjusted':
    case 'age_based':
      dose = rule.doseValue ?? 0;
      break;
    case 'weight_based':
      dose = (rule.dosePerKg ?? 0) * patient.weightKg;
      break;
    case 'bsa_based':
      dose = (rule.dosePerM2 ?? 0) * (bsa ?? 1.73);
      break;
    default:
      dose = rule.doseValue ?? 0;
      break;
  }

  if (rule.minDose) {
    dose = Math.max(dose, rule.minDose);
  }
  if (rule.maxDose) {
    dose = Math.min(dose, rule.maxDose);
  }
  if (patient.population === 'neonatal') {
    warnings.push({ type: 'info', message: 'ผู้ป่วยกลุ่ม neonatal ต้องทวนสอบ dilution และ monitoring อย่างใกล้ชิด' });
  }
  if (typeof crcl === 'number' && crcl < 30 && rule.renalAdjust) {
    warnings.push({ type: 'warning', message: `CrCl ${Math.round(crcl)} mL/min — ${rule.renalAdjust}` });
  }

  return {
    ruleName: rule.ruleName,
    calculatedDose: Math.round(dose * 100) / 100,
    doseUnit: rule.doseUnit,
    frequency: rule.frequency,
    maxDailyDose: rule.maxDailyDose,
    bsaM2: bsa ? Math.round(bsa * 100) / 100 : undefined,
    crclMlMin: typeof crcl === 'number' ? Math.round(crcl) : undefined,
    renalAdjust: rule.renalAdjust,
    specialNotes: rule.specialNotes,
    reference: rule.reference,
    warnings,
  };
}
