import { formatDrugDisplayName } from '@/lib/utils';
import type { Drug } from '@/types';

interface DrugSelectorProps {
  drugs: Drug[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function DrugSelector({ drugs, selectedIds, onToggle }: DrugSelectorProps): JSX.Element {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-ink">Select IV drugs</h3>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {drugs.map((drug) => (
          <label className="flex items-center gap-3 rounded-2xl bg-subtle px-4 py-3 text-sm" key={drug.id}>
            <input checked={selectedIds.includes(drug.id)} onChange={() => onToggle(drug.id)} type="checkbox" />
            <span>{formatDrugDisplayName(drug)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
