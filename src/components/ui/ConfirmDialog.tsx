interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <div className="max-w-md rounded-3xl bg-white p-6 shadow-floating">
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-ink">{title}</h3>
        <p className="mt-3 text-sm text-muted">{description}</p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-lg px-4 py-2 shadow-ring" onClick={onCancel} type="button">
            ยกเลิก
          </button>
          <button className="rounded-lg bg-ink px-4 py-2 text-white" onClick={onConfirm} type="button">
            ดำเนินการต่อ
          </button>
        </div>
      </div>
    </div>
  );
}
