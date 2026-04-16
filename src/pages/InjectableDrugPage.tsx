import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDrugs } from '@/hooks/useDrugs';
import { formatRouteList } from '@/lib/route-label';
import { normalizeDrugStatus } from '@/lib/drug-status';
import { formatDrugDisplayName, formatLatestDateTime } from '@/lib/utils';
import type { Drug } from '@/types';

/* ──────────────────────────────────────────────────────────────
   Detail modal
────────────────────────────────────────────────────────────── */

interface DetailModalProps {
  drug: Drug;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-muted">{value}</dd>
    </div>
  );
}

function InjectableDetailModal({ drug, onClose }: DetailModalProps): JSX.Element {
  const info = drug.injectionInfo;

  const hasDiluent = info?.diluent || info?.compatibleSolutions;
  const hasStability = !!info?.stability;
  const hasCompatibility =
    info?.solutionCompatibility || info?.additiveCompatibility || info?.syringeCompatibility || info?.ySiteCompatibility;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[999] overflow-y-auto bg-white/10 p-4 pt-16"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="pointer-events-none flex w-full justify-center">
          <div
            className="pointer-events-auto relative w-full max-w-3xl rounded-[24px] bg-white shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 z-10 shrink-0 rounded-pill border border-line bg-white/90 p-2 text-muted shadow-sm backdrop-blur transition hover:border-ink hover:text-ink"
              onClick={onClose}
              type="button"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 pr-20">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Injectable Drug</p>
              <h2 className="mt-1.5 text-2xl font-semibold leading-snug text-ink">{formatDrugDisplayName(drug)}</h2>
              {drug.genericNameTH && <p className="mt-0.5 text-base text-muted">{drug.genericNameTH}</p>}
              <p className="mt-1 text-sm text-muted">{drug.tradeName} · {drug.strength}</p>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 pb-8">

              {/* Route */}
              <Section title="Route">
                <p className="text-sm text-muted">{formatRouteList(drug.route)}</p>
              </Section>

              {/* Diluent */}
              {hasDiluent && (
                <Section title="Diluent">
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    {info?.diluent && (
                      <div className="sm:col-span-2">
                        <InfoRow label="Diluent" value={info.diluent} />
                      </div>
                    )}
                    {info?.compatibleSolutions && <InfoRow label="ชนิดสารละลายที่เข้ากัน" value={info.compatibleSolutions} />}
                  </dl>
                </Section>
              )}

              {/* Administration */}
              {info?.administration && (
                <Section title="Administration">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{info.administration}</p>
                </Section>
              )}

              {/* Stability */}
              {hasStability && (
                <Section title="Stability">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{info!.stability}</p>
                </Section>
              )}

              {/* Compatibility */}
              {hasCompatibility && (
                <Section title="Compatibility">
                  <dl className="grid gap-3 text-sm">
                    {info?.solutionCompatibility && (
                      <InfoRow label="Solution Compatibility" value={info.solutionCompatibility} />
                    )}
                    {info?.additiveCompatibility && (
                      <InfoRow label="Additive Compatibility" value={info.additiveCompatibility} />
                    )}
                    {info?.syringeCompatibility && (
                      <InfoRow label="Drug in Syringe Compatibility" value={info.syringeCompatibility} />
                    )}
                    {info?.ySiteCompatibility && (
                      <InfoRow label="Y-Site Injection Compatibility" value={info.ySiteCompatibility} />
                    )}
                  </dl>
                </Section>
              )}

              {/* Note */}
              {info?.injectableNote && (
                <Section title="Note">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{info.injectableNote}</p>
                </Section>
              )}

              <div className="flex justify-end pt-2">
                <p className="text-xs text-muted">
                  อัปเดตล่าสุด {formatLatestDateTime([drug.updatedAt, drug.createdAt])}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

/* ──────────────────────────────────────────────────────────────
   Drug card
────────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────── */

export function InjectableDrugPage(): JSX.Element {
  const pageSize = 10;
  const { drugs, loading, error, refetch } = useDrugs();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Drug | null>(null);
  const [page, setPage] = useState(1);
  const [brokenImageIds, setBrokenImageIds] = useState<string[]>([]);

  const injectables = useMemo(
    () => drugs.filter((d) => d.dosageForm === 'injection'),
    [drugs],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return injectables;
    return injectables.filter(
      (d) =>
        (d.displayName ?? '').toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q) ||
        (d.genericNameTH ?? '').toLowerCase().includes(q) ||
        d.tradeName.toLowerCase().includes(q),
    );
  }, [injectables, query]);
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
      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Injectable Drug</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">
          ข้อมูลยาฉีด — Reconstitution, Stability &amp; Compatibility
        </h1>
      </section>

      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          className="w-full rounded-[20px] border-0 bg-white py-3 pl-10 pr-12 text-sm shadow-card placeholder:text-muted focus:ring-2 focus:ring-primary"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหายาฉีด..."
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="ล้างคำค้นหายาฉีด"
            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-ink"
            onClick={() => setQuery('')}
            type="button"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {filtered.length === injectables.length
            ? `${injectables.length} รายการ`
            : `${filtered.length} จาก ${injectables.length} รายการ`}
        </p>
        {filtered.length > 0 ? (
          <p>หน้า {page} / {totalPages}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line bg-subtle px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <p>ชื่อยา (Injectable Drug)</p>
          <p>รายละเอียด</p>
        </div>

        <div className="divide-y divide-line">
          {paginatedDrugs.map((drug) => {
            const label = formatDrugDisplayName(drug);

            return (
              <button
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-subtle/60"
                key={drug.id}
                onClick={() => setSelected(drug)}
                type="button"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-subtle">
                  {drug.imageUrl && !brokenImageIds.includes(drug.id) ? (
                    <img
                      alt={drug.genericName}
                      className="h-full w-full object-contain p-1"
                      onError={() => markImageBroken(drug.id)}
                      src={drug.imageUrl}
                    />
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-muted/40">inj</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {normalizeDrugStatus(drug.status) === 'had' ? (
                      <span
                        aria-label="High Alert Drug"
                        className="inline-flex shrink-0 items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700"
                      >
                        HAD
                      </span>
                    ) : null}
                    <p className="min-w-0 truncate text-sm font-medium text-ink">{label}</p>
                  </div>
                  {drug.genericNameTH ? (
                    <p className="min-w-0 truncate text-sm text-muted">{drug.genericNameTH}</p>
                  ) : null}
                </div>

                <ChevronRightIcon className="shrink-0 text-primary" size={20} strokeWidth={1.5} />
              </button>
            );
          })}

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              {query ? `ไม่พบยาฉีดที่ตรงกับ "${query}"` : 'ยังไม่มีข้อมูลยาฉีดในระบบ'}
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

      {selected && <InjectableDetailModal drug={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
