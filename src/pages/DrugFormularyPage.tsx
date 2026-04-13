import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DrugDetailModal } from '@/components/drug/DrugDetailModal';
import { DrugSearchBar } from '@/components/drug/DrugSearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDrugs } from '@/hooks/useDrugs';
import { getStatusColor, getStatusLabel } from '@/lib/drug-status';
import type { Drug } from '@/types';

export function DrugFormularyPage(): JSX.Element {
  const pageSize = 10;
  const { drugs, loading, error, refetch } = useDrugs();
  const [query, setQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [page, setPage] = useState(1);

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
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-4 bg-subtle px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted md:grid">
          <p>Drug</p>
          <p>Details</p>
          <p className="text-right">View</p>
        </div>

        <div className="divide-y divide-line">
          {paginatedDrugs.map((drug) => {
            const statusColor = getStatusColor(drug.status);
            return (
              <button
                className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-subtle/60 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] md:items-center"
                key={drug.id}
                onClick={() => setSelectedDrug(drug)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{drug.therapeuticClass}</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{drug.genericName}</h3>
                  {drug.genericNameTH ? (
                    <p className="mt-0.5 text-sm text-muted">{drug.genericNameTH}</p>
                  ) : null}
                  <p className="mt-1 truncate text-sm text-muted">{drug.tradeName}</p>
                  <div className="mt-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-medium"
                      style={{ color: statusColor, backgroundColor: `${statusColor}18` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                      {getStatusLabel(drug.status)}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 space-y-1 text-sm text-muted">
                  <p>{drug.strength} · {drug.route.join(', ')}</p>
                  <p className="line-clamp-2">{drug.indication || 'ไม่มีรายละเอียดข้อบ่งใช้'}</p>
                </div>

                <div className="md:text-right">
                  <span className="inline-flex rounded-pill border border-line px-4 py-2 text-sm font-medium text-muted">
                    ดูรายละเอียด
                  </span>
                </div>
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
