import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { getStatusColor, getStatusLabel } from '@/lib/drug-status';
import { formatRouteList } from '@/lib/route-label';
import { formatDateTime } from '@/lib/utils';
import { auditService } from '@/services/audit.service';
import type { Drug } from '@/types';

interface DrugDetailModalProps {
  drug: Drug;
  onClose: () => void;
}

export function DrugDetailModal({ drug, onClose }: DrugDetailModalProps): JSX.Element {
  const statusColor = getStatusColor(drug.status);
  const [imageBroken, setImageBroken] = useState(false);

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
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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

            {/* Drug image */}
            {drug.imageUrl && !imageBroken ? (
              <div className="overflow-hidden rounded-t-[24px] bg-subtle">
                <img
                  alt={drug.genericName}
                  className="h-52 w-full object-contain p-4"
                  onError={() => setImageBroken(true)}
                  src={drug.imageUrl}
                />
              </div>
            ) : null}

            {/* Header */}
            <div className="p-6 pb-0 pr-20">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                  {drug.therapeuticClass}
                </p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight" style={{ color: statusColor }}>
                  {drug.genericName}
                </h2>
                <p className="mt-0.5 text-sm" style={{ color: statusColor }}>{drug.genericNameTH}</p>
                <p className="mt-1 text-base text-muted">{drug.tradeName}</p>
                <span
                  className="mt-2 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ color: statusColor, backgroundColor: `${statusColor}18` }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                  {getStatusLabel(drug.status)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[16px] bg-subtle p-4">
                  <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Clinical</h3>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div><dt className="font-semibold text-ink">Strength</dt><dd className="mt-0.5 text-muted">{drug.strength}</dd></div>
                    <div><dt className="font-semibold text-ink">Route</dt><dd className="mt-0.5 text-muted">{formatRouteList(drug.route)}</dd></div>
                    <div><dt className="font-semibold text-ink">Indication</dt><dd className="mt-0.5 text-muted">{drug.indication}</dd></div>
                    <div><dt className="font-semibold text-ink">Contraindication</dt><dd className="mt-0.5 text-muted">{drug.contraindication}</dd></div>
                    <div><dt className="font-semibold text-ink">Interactions</dt><dd className="mt-0.5 text-muted">{drug.interactions}</dd></div>
                  </dl>
                </article>
                <article className="rounded-[16px] bg-subtle p-4">
                  <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Safety & Logistics</h3>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div><dt className="font-semibold text-ink">Pregnancy</dt><dd className="mt-0.5 text-muted">{drug.pregnancyCategory}</dd></div>
                    <div>
                      <dt className="font-semibold text-ink">G6PD</dt>
                      <dd className={`mt-0.5 font-medium ${drug.g6pdSafe ? 'text-success' : 'text-danger'}`}>
                        {drug.g6pdSafe ? 'Safe' : 'Unsafe'}
                      </dd>
                    </div>
                    <div><dt className="font-semibold text-ink">Storage</dt><dd className="mt-0.5 text-muted">{drug.storage}</dd></div>
                    {drug.notes && <div><dt className="font-semibold text-ink">Notes</dt><dd className="mt-0.5 text-muted">{drug.notes}</dd></div>}
                  </dl>
                </article>
              </div>

              {/* Dosing information */}
              {drug.dosingInfo ? (
                <article className="mt-4 rounded-[16px] border border-line p-4">
                  <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">ข้อมูลการใช้ยา</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{drug.dosingInfo}</p>
                </article>
              ) : null}

              {/* Injection info */}
              {drug.dosageForm === 'injection' && drug.injectionInfo && (
                <article className="mt-4 rounded-[16px] border border-line p-4 space-y-4">
                  {(drug.injectionInfo.diluent || drug.injectionInfo.compatibleSolutions) && (
                    <>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Diluent</h3>
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        {drug.injectionInfo.diluent && <div className="sm:col-span-2"><dt className="font-semibold text-ink">Diluent</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.diluent}</dd></div>}
                        {drug.injectionInfo.compatibleSolutions && <div className="sm:col-span-2"><dt className="font-semibold text-ink">ชนิดสารละลายที่เข้ากัน</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.compatibleSolutions}</dd></div>}
                      </dl>
                    </>
                  )}

                  {drug.injectionInfo.administration && (
                    <>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Administration</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{drug.injectionInfo.administration}</p>
                    </>
                  )}

                  {drug.injectionInfo.stability && (
                    <>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Stability</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{drug.injectionInfo.stability}</p>
                    </>
                  )}

                  {(drug.injectionInfo.solutionCompatibility || drug.injectionInfo.additiveCompatibility || drug.injectionInfo.syringeCompatibility || drug.injectionInfo.ySiteCompatibility) && (
                    <>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Compatibility</h3>
                      <dl className="grid gap-3 text-sm">
                        {drug.injectionInfo.solutionCompatibility && <div><dt className="font-semibold text-ink">Solution Compatibility</dt><dd className="mt-0.5 whitespace-pre-wrap text-muted">{drug.injectionInfo.solutionCompatibility}</dd></div>}
                        {drug.injectionInfo.additiveCompatibility && <div><dt className="font-semibold text-ink">Additive Compatibility</dt><dd className="mt-0.5 whitespace-pre-wrap text-muted">{drug.injectionInfo.additiveCompatibility}</dd></div>}
                        {drug.injectionInfo.syringeCompatibility && <div><dt className="font-semibold text-ink">Drug in Syringe Compatibility</dt><dd className="mt-0.5 whitespace-pre-wrap text-muted">{drug.injectionInfo.syringeCompatibility}</dd></div>}
                        {drug.injectionInfo.ySiteCompatibility && <div><dt className="font-semibold text-ink">Y-Site Injection Compatibility</dt><dd className="mt-0.5 whitespace-pre-wrap text-muted">{drug.injectionInfo.ySiteCompatibility}</dd></div>}
                      </dl>
                    </>
                  )}

                  {drug.injectionInfo.injectableNote && (
                    <>
                      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Note</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{drug.injectionInfo.injectableNote}</p>
                    </>
                  )}
                </article>
              )}

              <div className="mt-5 flex justify-end">
                <p className="text-xs text-muted">อัปเดตล่าสุด {formatDateTime(drug.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
