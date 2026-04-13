import { describe, expect, it } from 'vitest';
import { calculateDose, calcBSA, calcCrCl, inferPopulation } from './dose.calculator';
import type { DoseRule } from '@/types';

const baseRule: DoseRule = {
  id: 'rule',
  drugId: 'drug',
  ruleName: 'Test Rule',
  population: 'adult',
  ruleType: 'fixed',
  doseValue: 500,
  doseUnit: 'mg',
  frequency: 'q12h',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('dose.calculator', () => {
  it('calculates BSA with Mosteller formula', () => {
    expect(calcBSA(70, 170)).toBeCloseTo(1.82, 2);
  });

  it('calculates CrCl with female adjustment', () => {
    expect(calcCrCl(50, 60, 1.2, true)).toBeCloseTo(53.13, 2);
  });

  it('infers neonatal population', () => {
    expect(inferPopulation(0.01)).toBe('neonatal');
  });

  it('handles fixed rule dosing', () => {
    const result = calculateDose(baseRule, { weightKg: 60, ageYears: 40, population: 'adult' });
    expect(result.calculatedDose).toBe(500);
  });

  it('handles weight based dosing with max dose cap', () => {
    const result = calculateDose(
      { ...baseRule, ruleType: 'weight_based', dosePerKg: 20, maxDose: 900 },
      { weightKg: 50, ageYears: 8, population: 'pediatric' },
    );
    expect(result.calculatedDose).toBe(900);
  });

  it('handles BSA based dosing', () => {
    const result = calculateDose(
      { ...baseRule, ruleType: 'bsa_based', dosePerM2: 100 },
      { weightKg: 70, heightCm: 170, ageYears: 45, population: 'adult' },
    );
    expect(result.calculatedDose).toBeCloseTo(181.81, 2);
  });

  it('adds renal warning when CrCl is low', () => {
    const result = calculateDose(
      { ...baseRule, renalAdjust: 'Reduce interval' },
      { weightKg: 45, ageYears: 80, scrMgDl: 2.5, population: 'geriatric' },
    );
    expect(result.warnings[0]?.message).toContain('CrCl');
  });

  it('adds neonatal info warning', () => {
    const result = calculateDose(baseRule, { weightKg: 3.2, ageYears: 0.02, population: 'neonatal' });
    expect(result.warnings[0]?.type).toBe('info');
  });
});
