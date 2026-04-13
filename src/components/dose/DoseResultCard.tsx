import type { DoseResult } from '@/services/dose.calculator';

interface DoseResultCardProps {
  result: DoseResult;
}

export function DoseResultCard({ result }: DoseResultCardProps): JSX.Element {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{result.ruleName}</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-semibold tracking-[-0.08em] text-ink">{result.calculatedDose}</span>
        <span className="pb-2 text-sm text-muted">{result.doseUnit}</span>
      </div>
      <p className="mt-2 text-sm text-muted">Frequency: {result.frequency}</p>
      <div className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-2">
        <p>BSA: {result.bsaM2 ?? '-'}</p>
        <p>CrCl: {result.crclMlMin ?? '-'} mL/min</p>
        <p>Max daily dose: {result.maxDailyDose ?? '-'}</p>
        <p>Reference: {result.reference ?? '-'}</p>
      </div>
      {result.specialNotes ? <p className="mt-4 rounded-2xl bg-subtle p-3 text-sm text-muted">{result.specialNotes}</p> : null}
    </article>
  );
}
