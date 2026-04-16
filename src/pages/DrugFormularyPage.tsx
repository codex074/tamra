import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DrugDetailModal } from '@/components/drug/DrugDetailModal';
import { DrugSearchBar } from '@/components/drug/DrugSearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDrugs } from '@/hooks/useDrugs';
import { getStatusColor, normalizeDrugStatus } from '@/lib/drug-status';
import { formatDrugDisplayName, getDisplayDosageForm } from '@/lib/utils';
import type { DosageForm, Drug } from '@/types';

function getDosageFormLabel(dosageForm: DosageForm): string {
  switch (dosageForm) {
    case 'tablet':
      return 'Tablets';
    case 'capsule':
      return 'Capsules';
    case 'injection':
      return 'Injection';
    case 'solution':
      return 'Solution';
    case 'suspension':
      return 'Suspension';
    case 'cream':
      return 'Cream';
    case 'ointment':
      return 'Ointment';
    case 'patch':
      return 'Patch';
    case 'inhaler':
      return 'Inhaler';
    case 'suppository':
      return 'Suppository';
    case 'eye_drops':
      return 'Eye Drops';
    case 'ear_drops':
      return 'Ear Drops';
    case 'drops':
      return 'Drops';
    default:
      return 'Other';
  }
}

function getDosageFormTagClass(dosageForm: DosageForm): string {
  switch (dosageForm) {
    case 'tablet':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'capsule':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    case 'injection':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'solution':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    case 'suspension':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'cream':
    case 'ointment':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'patch':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'inhaler':
      return 'border-teal-200 bg-teal-50 text-teal-700';
    case 'suppository':
      return 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700';
    case 'eye_drops':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'ear_drops':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'drops':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function buildCompactPageItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

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
        [drug.displayName, drug.genericName, drug.genericNameTH, drug.tradeName, drug.therapeuticClass, drug.indication]
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
      {/* Page hero */}
      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Drug Information</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">
          ตำรายา — ค้นหาและเปิดดูรายละเอียดยา
        </h1>
      </section>

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
            const statusColor = getStatusColor(drug.status);
            const label = formatDrugDisplayName(drug);
            const displayDosageForm = getDisplayDosageForm(drug) as DosageForm;
            const dosageFormLabel = getDosageFormLabel(displayDosageForm);
            const dosageFormTagClass = getDosageFormTagClass(displayDosageForm);

            return (
              <button
                className="grid w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-subtle/60 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)_auto]"
                key={drug.id}
                onClick={() => setSelectedDrug(drug)}
                type="button"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-subtle">
                    {drug.imageUrl && !brokenImageIds.includes(drug.id) ? (
                      <img
                        alt={drug.genericName}
                        className="h-full w-full object-contain p-1.5"
                        onError={() => markImageBroken(drug.id)}
                        src={drug.imageUrl}
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-muted/40 uppercase">{drug.dosageForm.slice(0, 3)}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      {normalizeDrugStatus(drug.status) === 'had' && (
                        <span
                          aria-label="High Alert Drug"
                          className="inline-flex shrink-0 items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700"
                        >
                          HAD
                        </span>
                      )}
                      <p className="min-w-0 truncate text-lg font-semibold text-ink" style={{ color: statusColor }}>{label}</p>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">{drug.strength}</p>
                  </div>
                </div>

                <div className="min-w-0 space-y-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${dosageFormTagClass}`}>
                    {dosageFormLabel}
                  </span>
                  <p className="line-clamp-2 text-sm text-muted">
                    {drug.tradeName || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>

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
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 font-medium transition hover:border-ink hover:text-ink disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ChevronLeft size={14} />
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-1">
              {buildCompactPageItems(page, totalPages).map((item, index) => (
                item === 'ellipsis' ? (
                  <span className="px-2 py-2 text-sm font-medium text-muted" key={`ellipsis-${index}`}>
                    ...
                  </span>
                ) : (
                  <button
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition ${
                      item === page
                        ? 'bg-primary text-white'
                        : 'text-muted hover:bg-subtle hover:text-ink'
                    }`}
                    key={item}
                    onClick={() => setPage(item)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              ))}
            </div>
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
