import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { getDriveImageUrl, gdriveConfigured } from '@/services/gdrive.service';

interface DrugImageUploadProps {
  /** file ID ปัจจุบันที่บันทึกใน Firestore */
  currentFileId?: string;
  /** ไฟล์ที่ผู้ใช้เลือกแต่ยังไม่ได้ upload (preview เท่านั้น) */
  pendingFile: File | null;
  onFileSelect: (file: File | null) => void;
  /** ถ้า true = ผู้ใช้ต้องการลบรูปเดิม */
  markedForDeletion: boolean;
  onMarkForDeletion: (del: boolean) => void;
  /** กำลัง upload อยู่ (ส่งมาจาก parent ตอน submit) */
  uploading?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_MB = 10;

export function DrugImageUpload({
  currentFileId,
  pendingFile,
  onFileSelect,
  markedForDeletion,
  onMarkForDeletion,
  uploading = false,
}: DrugImageUploadProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState('');

  if (!gdriveConfigured) {
    return (
      <div className="rounded-[16px] border border-dashed border-line bg-subtle p-4 text-center text-xs text-muted">
        ยังไม่ได้ตั้งค่า <code className="font-mono text-ink">VITE_GOOGLE_CLIENT_ID</code> — การอัปโหลดรูปยังไม่พร้อมใช้
      </div>
    );
  }

  function handleFiles(files: FileList | null): void {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setSizeError(`ไฟล์ใหญ่เกิน ${MAX_MB} MB`);
      return;
    }
    setSizeError('');
    onMarkForDeletion(false);
    onFileSelect(file);
  }

  // Preview URL: ถ้ามี pending file ใช้ ObjectURL, ถ้าไม่มีให้ใช้ Drive URL เดิม
  const previewUrl = pendingFile
    ? URL.createObjectURL(pendingFile)
    : currentFileId && !markedForDeletion
      ? getDriveImageUrl(currentFileId)
      : null;

  const hasImage = Boolean(previewUrl);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted">รูปภาพยา</label>

      {hasImage ? (
        /* ---- แสดงรูป preview ---- */
        <div className="relative overflow-hidden rounded-[16px] border border-line bg-subtle">
          <img
            alt="drug preview"
            className="h-48 w-full object-contain p-3"
            src={previewUrl!}
          />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin text-primary" size={28} />
              <span className="ml-2 text-sm font-medium text-primary">กำลังอัปโหลด...</span>
            </div>
          ) : (
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                className="rounded-pill border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted shadow-sm transition hover:border-ink hover:text-ink"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <Upload size={12} className="mr-1 inline" />
                เปลี่ยนรูป
              </button>
              <button
                className="rounded-pill border border-danger/20 bg-white px-2 py-1.5 text-danger shadow-sm transition hover:bg-danger-light"
                onClick={() => {
                  onFileSelect(null);
                  if (currentFileId) onMarkForDeletion(true);
                }}
                title="ลบรูป"
                type="button"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ---- Drop zone ---- */
        <button
          className={`flex w-full flex-col items-center gap-3 rounded-[16px] border-2 border-dashed p-8 text-center transition ${
            dragOver ? 'border-primary bg-primary-light' : 'border-line bg-subtle hover:border-primary/50'
          }`}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <ImagePlus className="text-muted" size={28} />
          <div>
            <p className="text-sm font-medium text-ink">วางรูปที่นี่ หรือกดเพื่อเลือกไฟล์</p>
            <p className="mt-1 text-xs text-muted">PNG, JPG, WebP ขนาดไม่เกิน {MAX_MB} MB</p>
          </div>
        </button>
      )}

      {sizeError ? <p className="text-xs text-danger">{sizeError}</p> : null}

      <input
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
