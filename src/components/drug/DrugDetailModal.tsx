import { X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { getStatusColor, getStatusLabel } from '@/lib/drug-status';
import { formatRouteList } from '@/lib/route-label';
import type { Drug } from '@/types';

interface DrugDetailModalProps {
  drug: Drug;
  onClose: () => void;
}

export function DrugDetailModal({ drug, onClose }: DrugDetailModalProps): JSX.Element {
  const statusColor = getStatusColor(drug.status);

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[999] overflow-y-auto p-4 pt-16"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative flex min-h-dvh w-full justify-center">
          <div className="w-full max-w-3xl rounded-[24px] bg-white shadow-floating">
            {/* Drug image */}
            {drug.imageUrl ? (
              <div className="overflow-hidden rounded-t-[24px] bg-subtle">
                <img
                  alt={drug.genericName}
                  className="h-52 w-full object-contain p-4"
                  src={drug.imageUrl}
                />
              </div>
            ) : null}

            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
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
              <button
                className="mt-1 shrink-0 rounded-pill border border-line p-2 text-muted transition hover:border-ink hover:text-ink"
                onClick={onClose}
                type="button"
              >
                <X size={16} />
              </button>
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
                <article className="mt-4 rounded-[16px] border border-line p-4">
                  <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-primary">ข้อมูลการผสมยา (Reconstitution &amp; Solution)</h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {drug.injectionInfo.reconstitutionForm && <div><dt className="font-semibold text-ink">รูปแบบผงยา</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.reconstitutionForm}</dd></div>}
                    {drug.injectionInfo.reconstitutionVolume && <div><dt className="font-semibold text-ink">ปริมาตรสารละลาย</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.reconstitutionVolume}</dd></div>}
                    {drug.injectionInfo.compatibleSolutions && <div><dt className="font-semibold text-ink">ชนิดสารละลายที่เข้ากัน</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.compatibleSolutions}</dd></div>}
                    {drug.injectionInfo.dilutionVolume && <div><dt className="font-semibold text-ink">ปริมาตรสารละลาย (Dilution)</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.dilutionVolume}</dd></div>}
                  </dl>

                  <h3 className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">ความคงตัว (Stability)</h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {drug.injectionInfo.stability2_8C && <div><dt className="font-semibold text-ink">อุณหภูมิ 2-8 °C</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.stability2_8C}</dd></div>}
                    {drug.injectionInfo.stabilityRoom && <div><dt className="font-semibold text-ink">อุณหภูมิห้อง (25 °C)</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.stabilityRoom}</dd></div>}
                    {drug.injectionInfo.stability2_8CAfterMix && <div><dt className="font-semibold text-ink">2-8 °C (หลังผสม)</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.stability2_8CAfterMix}</dd></div>}
                    {drug.injectionInfo.stabilityRoomAfterMix && <div><dt className="font-semibold text-ink">อุณหภูมิห้อง (หลังผสม)</dt><dd className="mt-0.5 text-muted">{drug.injectionInfo.stabilityRoomAfterMix}</dd></div>}
                  </dl>

                  {drug.injectionInfo.injectionReference && (
                    <div className="mt-4 text-sm">
                      <span className="font-semibold text-ink">อ้างอิง: </span>
                      <a
                        className="text-primary underline"
                        href={drug.injectionInfo.injectionReference}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        อ่านเพิ่มเติม ↗
                      </a>
                      <p className="mt-0.5 break-all text-xs text-muted">{drug.injectionInfo.injectionReference}</p>
                    </div>
                  )}
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
