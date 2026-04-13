import type { DoseWarning } from '@/services/dose.calculator';
import type { Drug } from '@/types';

interface SpecialPopulationAlertProps {
  drug: Drug;
  warnings: DoseWarning[];
}

export function SpecialPopulationAlert({ drug, warnings }: SpecialPopulationAlertProps): JSX.Element {
  return (
    <div className="grid gap-3">
      {!drug.g6pdSafe ? (
        <div className="rounded-2xl bg-danger-light p-4 text-sm text-danger">ยานี้ไม่ปลอดภัยใน G6PD deficiency</div>
      ) : null}
      {['D', 'X'].includes(drug.pregnancyCategory) ? (
        <div className="rounded-2xl bg-warning-light p-4 text-sm text-warning">
          Pregnancy category {drug.pregnancyCategory} ต้องทบทวนก่อนใช้งาน
        </div>
      ) : null}
      {warnings.map((warning) => (
        <div
          className={
            warning.type === 'warning'
              ? 'rounded-2xl bg-warning-light p-4 text-sm text-warning'
              : 'rounded-2xl bg-primary-light p-4 text-sm text-primary'
          }
          key={warning.message}
        >
          {warning.message}
        </div>
      ))}
    </div>
  );
}
