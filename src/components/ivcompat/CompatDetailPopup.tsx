import type { IVCompatibility } from '@/types';

interface CompatDetailPopupProps {
  detail: IVCompatibility;
  onClose: () => void;
}

export function CompatDetailPopup({ detail, onClose }: CompatDetailPopupProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 p-4">
      <div className="max-w-lg rounded-3xl bg-white p-6 shadow-floating">
        <h3 className="text-3xl font-semibold tracking-[-0.06em] text-ink">{detail.compatible}</h3>
        <div className="mt-4 grid gap-2 text-sm text-muted">
          <p>Solution: {detail.solution}</p>
          <p>Stability: {detail.timeLimitHr ?? '-'} hr</p>
          <p>Temperature: {detail.temperature ?? '-'}</p>
          <p>Reference: {detail.reference ?? '-'}</p>
          <p>Notes: {detail.notes ?? '-'}</p>
        </div>
        <button className="mt-6 rounded-xl bg-ink px-4 py-2 text-sm text-white" onClick={onClose} type="button">
          ปิด
        </button>
      </div>
    </div>
  );
}
