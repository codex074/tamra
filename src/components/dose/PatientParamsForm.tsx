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
      <select className="rounded-2xl border-0 bg-subtle text-sm" {...register('drugId')}>
        {drugs.map((drug) => (
          <option key={drug.id} value={drug.id}>
            {drug.genericName}
          </option>
        ))}
      </select>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-2xl border-0 bg-subtle" step="0.1" type="number" {...register('weightKg', { valueAsNumber: true })} />
        <input className="rounded-2xl border-0 bg-subtle" placeholder="Height (cm)" step="0.1" type="number" {...register('heightCm', { valueAsNumber: true })} />
        <input className="rounded-2xl border-0 bg-subtle" step="0.1" type="number" {...register('ageYears', { valueAsNumber: true })} />
        <input className="rounded-2xl border-0 bg-subtle" placeholder="SCr (mg/dL)" step="0.1" type="number" {...register('scrMgDl', { valueAsNumber: true })} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" {...register('isFemale')} />
        ผู้ป่วยเพศหญิง
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" {...register('hasG6pdDeficiency')} />
        G6PD deficiency
      </label>
      <button className="rounded-xl bg-ink px-4 py-2 text-sm text-white" type="submit">
        Calculate dose
      </button>
    </form>
  );
}
