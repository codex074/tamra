import { cn } from '@/lib/utils';
import type { Drug, IVCompatibility } from '@/types';

interface CompatMatrixProps {
  drugs: Drug[];
  selectedIds: string[];
  matrix: Record<string, IVCompatibility | null>;
  onSelectCell: (detail: IVCompatibility | null) => void;
}

function cellTone(compatible?: string): string {
  switch (compatible) {
    case 'Y':
      return 'bg-success-light text-success';
    case 'N':
      return 'bg-danger-light text-danger';
    case 'Conditional':
      return 'bg-warning-light text-warning';
    default:
      return 'bg-subtle text-muted';
  }
}

export function CompatMatrix({ drugs, selectedIds, matrix, onSelectCell }: CompatMatrixProps): JSX.Element {
  const selectedDrugs = drugs.filter((drug) => selectedIds.includes(drug.id));

  if (selectedDrugs.length < 2) {
    return <div className="rounded-3xl bg-white p-5 text-sm text-muted shadow-card">เลือกยาอย่างน้อย 2 รายการ</div>;
  }

  return (
    <div className="overflow-x-auto rounded-3xl bg-white p-5 shadow-card">
      <table className="min-w-full border-separate border-spacing-2">
        <thead>
          <tr>
            <th />
            {selectedDrugs.map((drug) => (
              <th className="px-3 py-2 text-left text-sm font-medium text-ink" key={drug.id}>
                {drug.genericName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selectedDrugs.map((row) => (
            <tr key={row.id}>
              <th className="px-3 py-2 text-left text-sm font-medium text-ink">{row.genericName}</th>
              {selectedDrugs.map((col) => {
                if (row.id === col.id) {
                  return <td className="rounded-2xl bg-subtle px-3 py-4 text-center text-sm text-muted" key={col.id}>—</td>;
                }
                const key = [row.id, col.id].sort().join('-');
                const detail = matrix[key];
                return (
                  <td key={col.id}>
                    <button
                      className={cn('w-full rounded-2xl px-3 py-4 text-sm font-medium', cellTone(detail?.compatible))}
                      onClick={() => onSelectCell(detail)}
                      type="button"
                    >
                      {detail?.compatible ?? 'Unknown'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
