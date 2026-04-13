import { useState } from 'react';
import { CompatDetailPopup } from '@/components/ivcompat/CompatDetailPopup';
import { CompatMatrix } from '@/components/ivcompat/CompatMatrix';
import { DrugSelector } from '@/components/ivcompat/DrugSelector';
import { useDrugs } from '@/hooks/useDrugs';
import { useIVCompat } from '@/hooks/useIVCompat';
import type { IVCompatibility, IVSolution } from '@/types';

export function IVCompatPage(): JSX.Element {
  const { drugs } = useDrugs();
  const [solution, setSolution] = useState<IVSolution>('NSS');
  const [selectedIds, setSelectedIds] = useState<string[]>(['drug-1', 'drug-2']);
  const [detail, setDetail] = useState<IVCompatibility | null>(null);
  const { matrix } = useIVCompat(selectedIds, solution);

  function toggleDrug(id: string): void {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">IV Compatibility</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.09em] text-ink">Check infusion compatibility before the line gets crowded.</h1>
      </section>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <DrugSelector drugs={drugs} onToggle={toggleDrug} selectedIds={selectedIds} />
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <label className="text-sm font-medium text-ink" htmlFor="solution">
              Diluent / solution
            </label>
            <select
              className="mt-3 w-full rounded-2xl border-0 bg-subtle text-sm"
              id="solution"
              onChange={(event) => setSolution(event.target.value as IVSolution)}
              value={solution}
            >
              {['NSS', 'D5W', 'D5NSS', 'D5S3', 'LRS', 'sterile_water', 'any'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <CompatMatrix drugs={drugs} matrix={matrix} onSelectCell={setDetail} selectedIds={selectedIds} />
      </div>
      {detail ? <CompatDetailPopup detail={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}
