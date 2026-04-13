import { getStatusColor, getStatusLabel } from '@/lib/drug-status';
import type { Drug } from '@/types';

interface DrugCardProps {
  drug: Drug;
  onSelect: (drug: Drug) => void;
}

export function DrugCard({ drug, onSelect }: DrugCardProps): JSX.Element {
  const statusColor = getStatusColor(drug.status);

  return (
    <button
      className="group w-full rounded-[20px] bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-floating"
      onClick={() => onSelect(drug)}
      type="button"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          {drug.therapeuticClass}
        </p>
        <span
          className="shrink-0 flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-medium"
          style={{ color: statusColor, backgroundColor: `${statusColor}18` }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
          {getStatusLabel(drug.status)}
        </span>
      </div>

      {/* Drug name */}
      <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-ink">
        {drug.genericName}
      </h3>
      <p className="mt-0.5 text-sm text-muted">{drug.tradeName}</p>

      {/* Details */}
      <div className="mt-4 space-y-1 text-sm text-muted">
        <p>{drug.strength} · {drug.route.join(', ')}</p>
        <p className="line-clamp-2 leading-relaxed">{drug.indication}</p>
      </div>
    </button>
  );
}
