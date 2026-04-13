import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DoseResultCard } from '@/components/dose/DoseResultCard';
import { PatientParamsForm } from '@/components/dose/PatientParamsForm';
import { SpecialPopulationAlert } from '@/components/dose/SpecialPopulationAlert';
import { useDrugs } from '@/hooks/useDrugs';
import { doseRuleService } from '@/services/doseRule.service';
import { calculateDose, inferPopulation } from '@/services/dose.calculator';
import type { PatientFormValues } from '@/components/dose/PatientParamsForm';
import type { PatientParams } from '@/services/dose.calculator';
import type { DoseRule, Drug } from '@/types';

export function DoseCalculatorPage(): JSX.Element {
  const { drugs } = useDrugs();
  const [currentDrug, setCurrentDrug] = useState<Drug | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateDose> | null>(null);
  const [requireConfirm, setRequireConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ rule: DoseRule; patient: PatientParams; drug: Drug } | null>(null);

  const drugOptions = useMemo(() => drugs.map((drug) => ({ id: drug.id, genericName: drug.genericName })), [drugs]);

  function commitCalculation(rule: DoseRule, patient: PatientParams, drug: Drug): void {
    setCurrentDrug(drug);
    setResult(calculateDose(rule, patient));
  }

  async function handleSubmit(values: PatientFormValues): Promise<void> {
    const drug = drugs.find((item) => item.id === values.drugId);
    if (!drug) {
      return;
    }
    const rules = await doseRuleService.getByDrugId(values.drugId);
    const population = inferPopulation(values.ageYears);
    const rule = rules.find((item) => item.population === population) ?? rules[0];
    if (!rule) {
      return;
    }
    const patient: PatientParams = {
      weightKg: values.weightKg,
      heightCm: values.heightCm,
      ageYears: values.ageYears,
      scrMgDl: values.scrMgDl,
      isFemale: values.isFemale,
      population,
      hasG6pdDeficiency: values.hasG6pdDeficiency,
    };

    if (!drug.g6pdSafe && values.hasG6pdDeficiency) {
      setCurrentDrug(drug);
      setResult({
        ruleName: rule.ruleName,
        calculatedDose: 0,
        doseUnit: rule.doseUnit,
        frequency: rule.frequency,
        warnings: [{ type: 'error', message: 'ยานี้ไม่ปลอดภัยใน G6PD deficiency — ห้ามใช้' }],
      });
      return;
    }

    if (['D', 'X'].includes(drug.pregnancyCategory)) {
      setPendingPayload({ rule, patient, drug });
      setRequireConfirm(true);
      return;
    }

    commitCalculation(rule, patient, drug);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <PatientParamsForm drugs={drugOptions} onSubmit={handleSubmit} />
      <div className="space-y-4">
        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Dose Calculator</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.09em] text-ink">Patient-specific dosing with built-in safety signals.</h1>
        </section>
        {currentDrug && result ? (
          <>
            <SpecialPopulationAlert drug={currentDrug} warnings={result.warnings} />
            <DoseResultCard result={result} />
          </>
        ) : (
          <div className="rounded-3xl bg-white p-6 text-sm text-muted shadow-card">กรอกข้อมูลผู้ป่วยเพื่อเริ่มคำนวณขนาดยา</div>
        )}
      </div>
      {requireConfirm && pendingPayload ? (
        <ConfirmDialog
          description={`ยา ${pendingPayload.drug.genericName} อยู่ใน pregnancy category ${pendingPayload.drug.pregnancyCategory}`}
          onCancel={() => {
            setRequireConfirm(false);
            setPendingPayload(null);
          }}
          onConfirm={() => {
            commitCalculation(pendingPayload.rule, pendingPayload.patient, pendingPayload.drug);
            setRequireConfirm(false);
            setPendingPayload(null);
          }}
          title="ยืนยันการคำนวณ"
        />
      ) : null}
    </div>
  );
}
