import { useMemo, useState } from 'react';
import { DrugCard } from '@/components/drug/DrugCard';
import { DrugDetailModal } from '@/components/drug/DrugDetailModal';
import { DrugFilterPanel } from '@/components/drug/DrugFilterPanel';
import { DrugSearchBar } from '@/components/drug/DrugSearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDrugs } from '@/hooks/useDrugs';
import type { Drug } from '@/types';

export function DrugFormularyPage(): JSX.Element {
  const { drugs, loading, error, refetch } = useDrugs();
  const [query, setQuery] = useState('');
  const [therapeuticClass, setTherapeuticClass] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  const filtered = useMemo(
    () =>
      drugs.filter((drug) => {
        const matchesQuery =
          query.length === 0 ||
          [drug.genericName, drug.tradeName, drug.therapeuticClass, drug.indication]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesClass = therapeuticClass.length === 0 || drug.therapeuticClass === therapeuticClass;
        return matchesQuery && matchesClass;
      }),
    [drugs, query, therapeuticClass],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Drug Formulary</p>
        <h1 className="mt-1.5 text-4xl font-semibold leading-tight tracking-tight text-ink">
          ค้นหายาในบัญชียาโรงพยาบาล
        </h1>
      </div>

      {/* Single search box */}
      <DrugSearchBar onChange={setQuery} value={query} />

      {/* Filter chips — inline below search */}
      <DrugFilterPanel
        drugs={drugs}
        setTherapeuticClass={setTherapeuticClass}
        therapeuticClass={therapeuticClass}
      />

      {/* Result count */}
      <p className="text-sm text-muted">
        {filtered.length === drugs.length
          ? `${drugs.length} รายการ`
          : `${filtered.length} จาก ${drugs.length} รายการ`}
      </p>

      {/* Drug grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((drug) => (
          <DrugCard drug={drug} key={drug.id} onSelect={setSelectedDrug} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-muted">
            ไม่พบยาที่ตรงกับการค้นหา
          </p>
        )}
      </div>

      {selectedDrug ? <DrugDetailModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} /> : null}
    </div>
  );
}
