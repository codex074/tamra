import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useDrugs } from '@/hooks/useDrugs';
import { formatRouteList } from '@/lib/route-label';
import { formatDateTime } from '@/lib/utils';
import { auditService } from '@/services/audit.service';
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

  useEffect(() => {
    void auditService.log('VIEW', 'drugs', drug.id, undefined, {
      genericName: drug.genericName,
      tradeName: drug.tradeName,
    });
  }, [drug.genericName, drug.id, drug.tradeName]);

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
              <h2 className="mt-1.5 text-2xl font-semibold leading-snug text-ink">{drug.genericName}</h2>
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
                <p className="text-xs text-muted">อัปเดตล่าสุด {formatDateTime(drug.updatedAt)}</p>
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

function DrugCard({ drug, onClick }: { drug: Drug; onClick: () => void }): JSX.Element {
  return (
    <button
      className="flex w-full flex-col gap-1 rounded-[20px] bg-white p-5 text-left shadow-card transition hover:shadow-floating focus-visible:outline-2 focus-visible:outline-primary"
      onClick={onClick}
      type="button"
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
        {formatRouteList(drug.route)}
      </p>
      <h3 className="font-semibold leading-snug text-ink">{drug.genericName}</h3>
      {drug.genericNameTH && <p className="text-sm text-muted">{drug.genericNameTH}</p>}
      <p className="mt-1 text-xs text-muted">{drug.tradeName} · {drug.strength}</p>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────── */

export function InjectableDrugPage(): JSX.Element {
  const { drugs, loading, error } = useDrugs();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Drug | null>(null);

  const injectables = useMemo(
    () => drugs.filter((d) => d.dosageForm === 'injection'),
    [drugs],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return injectables;
    return injectables.filter(
      (d) =>
        d.genericName.toLowerCase().includes(q) ||
        (d.genericNameTH ?? '').toLowerCase().includes(q) ||
        d.tradeName.toLowerCase().includes(q),
    );
  }, [injectables, query]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Injectable Drug</p>
        <h1 className="mt-4 text-5xl font-medium leading-tight tracking-normal text-ink">
          ข้อมูลยาฉีด — Reconstitution, Stability &amp; Compatibility
        </h1>
      </section>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          className="w-full rounded-[20px] border-0 bg-white py-3 pl-10 pr-4 text-sm shadow-card placeholder:text-muted focus:ring-2 focus:ring-primary"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหายาฉีด..."
          type="search"
          value={query}
        />
      </div>

      {/* State: loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* State: error */}
      {error && !loading && (
        <div className="rounded-[20px] bg-danger-light px-5 py-4 text-sm text-danger">{error}</div>
      )}

      {/* State: empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-[20px] bg-white px-5 py-12 text-center shadow-card">
          <p className="text-sm text-muted">
            {query ? `ไม่พบยาฉีดที่ตรงกับ "${query}"` : 'ยังไม่มีข้อมูลยาฉีดในระบบ'}
          </p>
        </div>
      )}

      {/* Drug grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((drug) => (
            <DrugCard key={drug.id} drug={drug} onClick={() => setSelected(drug)} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && <InjectableDetailModal drug={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
