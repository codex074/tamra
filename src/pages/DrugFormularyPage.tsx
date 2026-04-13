import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DrugDetailModal } from '@/components/drug/DrugDetailModal';
import { DrugSearchBar } from '@/components/drug/DrugSearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDrugs } from '@/hooks/useDrugs';
import type { Drug } from '@/types';

export function DrugFormularyPage(): JSX.Element {
  const pageSize = 10;
  const { drugs, loading, error, refetch } = useDrugs();
  const [query, setQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [page, setPage] = useState(1);
  const [brokenImageIds, setBrokenImageIds] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      drugs.filter((drug) =>
        query.length === 0 ||
        [drug.genericName, drug.genericNameTH, drug.tradeName, drug.therapeuticClass, drug.indication]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [drugs, query],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedDrugs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function markImageBroken(drugId: string): void {
    setBrokenImageIds((current) => (current.includes(drugId) ? current : [...current, drugId]));
  }

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

      {/* Search box */}
      <DrugSearchBar onChange={setQuery} value={query} />

      {/* Result count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {filtered.length === drugs.length
            ? `${drugs.length} รายการ`
            : `${filtered.length} จาก ${drugs.length} รายการ`}
        </p>
        {filtered.length > 0 ? (
          <p>หน้า {page} / {totalPages}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line bg-subtle px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <p>ชื่อยา (Drug Name)</p>
          <p>รายละเอียด</p>
        </div>

        <div className="divide-y divide-line">
          {paginatedDrugs.map((drug) => {
            const label = [
              drug.genericName,
              drug.strength,
              drug.dosageForm !== 'other' ? drug.dosageForm : null,
              drug.tradeName ? `(${drug.tradeName})` : null,
            ].filter(Boolean).join(' ');

            return (
              <button
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-subtle/60"
                key={drug.id}
                onClick={() => setSelectedDrug(drug)}
                type="button"
              >
                {/* Thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-subtle">
                  {drug.imageUrl && !brokenImageIds.includes(drug.id) ? (
                    <img
                      alt={drug.genericName}
                      className="h-full w-full object-contain p-1"
                      onError={() => markImageBroken(drug.id)}
                      src={drug.imageUrl}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-muted/40 uppercase">{drug.dosageForm.slice(0, 3)}</span>
                  )}
                </div>

                {/* Name */}
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{label}</p>

                {/* Arrow */}
                <ChevronRightIcon className="shrink-0 text-primary" size={20} strokeWidth={1.5} />
              </button>
            );
          })}

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              ไม่พบยาที่ตรงกับการค้นหา
            </p>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            แสดง {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} จาก {filtered.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 font-medium transition hover:border-ink hover:text-ink disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ChevronLeft size={14} />
              ก่อนหน้า
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 font-medium transition hover:border-ink hover:text-ink disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              ถัดไป
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {selectedDrug ? <DrugDetailModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} /> : null}
    </div>
  );
}
