import { useForm } from 'react-hook-form';

export interface PatientFormValues {
  drugId: string;
  weightKg: number;
  heightCm?: number;
  ageYears: number;
  scrMgDl?: number;
  isFemale: boolean;
  hasG6pdDeficiency: boolean;
}

interface PatientParamsFormProps {
  drugs: Array<{ id: string; genericName: string }>;
  onSubmit: (values: PatientFormValues) => void;
}

const inputCls = 'rounded-2xl border-0 bg-subtle px-3 py-2 text-sm w-full';
const labelCls = 'grid gap-1 text-xs text-muted';

export function PatientParamsForm({ drugs, onSubmit }: PatientParamsFormProps): JSX.Element {
  const { register, handleSubmit } = useForm<PatientFormValues>({
    defaultValues: {
      drugId: drugs[0]?.id ?? '',
      weightKg: 70,
      ageYears: 35,
      isFemale: false,
      hasG6pdDeficiency: false,
    },
  });

  return (
    <form className="grid gap-4 rounded-3xl bg-white p-5 shadow-card" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-ink">Patient Parameters</h3>

      <label className={labelCls}>
        ยา
        <select className={inputCls} {...register('drugId')}>
          {drugs.map((drug) => (
            <option key={drug.id} value={drug.id}>
              {drug.genericName}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelCls}>
          น้ำหนัก (kg)
          <input className={inputCls} min={0} step={0.1} type="number" {...register('weightKg', { valueAsNumber: true })} />
        </label>
        <label className={labelCls}>
          ส่วนสูง (cm) — optional
          <input className={inputCls} min={0} placeholder="—" step={0.1} type="number" {...register('heightCm', { valueAsNumber: true })} />
        </label>
        <label className={labelCls}>
          อายุ (ปี)
          <input className={inputCls} min={0} step={0.1} type="number" {...register('ageYears', { valueAsNumber: true })} />
        </label>
        <label className={labelCls}>
          SCr (mg/dL) — optional
          <input className={inputCls} min={0} placeholder="—" step={0.01} type="number" {...register('scrMgDl', { valueAsNumber: true })} />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" {...register('isFemale')} />
          ผู้ป่วยเพศหญิง
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" {...register('hasG6pdDeficiency')} />
          G6PD deficiency
        </label>
      </div>

      <button className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-80" type="submit">
        คำนวณขนาดยา
      </button>
    </form>
  );
}
