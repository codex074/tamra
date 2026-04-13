import { cn } from '@/lib/utils';
import type { Drug } from '@/types';

interface DrugFilterPanelProps {
  drugs: Drug[];
  therapeuticClass: string;
  setTherapeuticClass: (value: string) => void;
}

export function DrugFilterPanel({
  drugs,
  therapeuticClass,
  setTherapeuticClass,
}: DrugFilterPanelProps): JSX.Element {
  const classes = Array.from(new Set(drugs.map((drug) => drug.therapeuticClass))).sort();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={cn(
          'rounded-pill px-4 py-1.5 text-sm font-medium transition',
          therapeuticClass === ''
            ? 'bg-primary text-white shadow-card'
            : 'border border-line bg-white text-muted hover:border-ink hover:text-ink',
        )}
        onClick={() => setTherapeuticClass('')}
        type="button"
      >
        ทั้งหมด
      </button>
      {classes.map((item) => (
        <button
          className={cn(
            'rounded-pill px-4 py-1.5 text-sm font-medium transition',
            therapeuticClass === item
              ? 'bg-primary text-white shadow-card'
              : 'border border-line bg-white text-muted hover:border-ink hover:text-ink',
          )}
          key={item}
          onClick={() => setTherapeuticClass(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
