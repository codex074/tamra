import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DrugImageUpload } from '@/components/drug/DrugImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { DRUG_STATUS_CONFIG } from '@/lib/drug-status';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/sweet-alert';
import { deleteDrugImage, uploadDrugImage } from '@/services/storage.service';
import { drugService } from '@/services/drug.service';
import type { DosageForm, Drug, DrugStatus, PregnancyCategory, RouteOfAdmin } from '@/types';

const drugSchema = z.object({
  genericName: z.string().min(1, 'กรุณาระบุชื่อสามัญยา'),
  genericNameTH: z.string().optional(),
  tradeName: z.string(),
  dosageForm: z.enum(['tablet', 'capsule', 'injection', 'solution', 'suspension', 'cream', 'ointment', 'patch', 'inhaler', 'suppository', 'drops', 'other']),
  strength: z.string().min(1, 'กรุณาระบุความแรง'),
  therapeuticClass: z.string().min(1, 'กรุณาระบุกลุ่มยา'),
  indication: z.string(),
  contraindication: z.string(),
  sideEffects: z.string(),
  interactions: z.string(),
  pregnancyCategory: z.enum(['A', 'B', 'C', 'D', 'X', 'N/A']),
  g6pdSafe: z.boolean(),
  storage: z.string(),
  status: z.enum(['had', 'uc_free', 'staff_order', 'ned_national', 'all_rights', 'ocpa', 'ned_only', 'restrict_atb', 'self_pay', 'self_pay2']),
  notes: z.string(),
  reconstitutionForm: z.string().optional(),
  reconstitutionVolume: z.string().optional(),
  compatibleSolutions: z.string().optional(),
  dilutionVolume: z.string().optional(),
  stability2_8C: z.string().optional(),
  stabilityRoom: z.string().optional(),
  stability2_8CAfterMix: z.string().optional(),
  stabilityRoomAfterMix: z.string().optional(),
  injectionReference: z.string().optional(),
});

type DrugFormValues = z.infer<typeof drugSchema>;

interface DrugFormProps {
  initialDrug?: Drug | null;
  onCancelEdit?: () => void;
  onSuccess?: () => void | Promise<void>;
}

const ROUTES: RouteOfAdmin[] = ['oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'sublingual', 'rectal', 'ophthalmic', 'other'];

function getDefaultValues(drug?: Drug | null): DrugFormValues {
  return {
    genericName: drug?.genericName ?? '',
    genericNameTH: drug?.genericNameTH ?? '',
    tradeName: drug?.tradeName ?? '',
    dosageForm: drug?.dosageForm ?? 'tablet',
    strength: drug?.strength ?? '',
    therapeuticClass: drug?.therapeuticClass ?? '',
    indication: drug?.indication ?? '',
    contraindication: drug?.contraindication ?? '',
    sideEffects: drug?.sideEffects ?? '',
    interactions: drug?.interactions ?? '',
    pregnancyCategory: drug?.pregnancyCategory ?? 'N/A',
    g6pdSafe: drug?.g6pdSafe ?? true,
    storage: drug?.storage ?? 'เก็บที่อุณหภูมิห้อง',
    status: drug?.status ?? 'all_rights',
    notes: drug?.notes ?? '',
    reconstitutionForm: drug?.injectionInfo?.reconstitutionForm ?? '',
    reconstitutionVolume: drug?.injectionInfo?.reconstitutionVolume ?? '',
    compatibleSolutions: drug?.injectionInfo?.compatibleSolutions ?? '',
    dilutionVolume: drug?.injectionInfo?.dilutionVolume ?? '',
    stability2_8C: drug?.injectionInfo?.stability2_8C ?? '',
    stabilityRoom: drug?.injectionInfo?.stabilityRoom ?? '',
    stability2_8CAfterMix: drug?.injectionInfo?.stability2_8CAfterMix ?? '',
    stabilityRoomAfterMix: drug?.injectionInfo?.stabilityRoomAfterMix ?? '',
    injectionReference: drug?.injectionInfo?.injectionReference ?? '',
  };
}

export function DrugForm({ initialDrug = null, onCancelEdit, onSuccess }: DrugFormProps): JSX.Element {
  const { user } = useAuth();
  const isEditing = Boolean(initialDrug);

  const [selectedRoutes, setSelectedRoutes] = useState<RouteOfAdmin[]>(initialDrug?.route ?? ['oral']);
  const [selectedStatus, setSelectedStatus] = useState<DrugStatus>(initialDrug?.status ?? 'all_rights');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imageMarkedForDeletion, setImageMarkedForDeletion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DrugFormValues>({
    resolver: zodResolver(drugSchema),
    defaultValues: getDefaultValues(initialDrug),
  });

  useEffect(() => {
    reset(getDefaultValues(initialDrug));
    setSelectedRoutes(initialDrug?.route ?? ['oral']);
    setSelectedStatus(initialDrug?.status ?? 'all_rights');
    setPendingImageFile(null);
    setImageMarkedForDeletion(false);
    setSaveError(null);
    setSaveSuccess(false);
  }, [initialDrug, reset]);

  const dosageForm = watch('dosageForm');

  function toggleRoute(route: RouteOfAdmin): void {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  }

  function clearForm(): void {
    reset(getDefaultValues(null));
    setSelectedRoutes(['oral']);
    setSelectedStatus('all_rights');
    setPendingImageFile(null);
    setImageMarkedForDeletion(false);
    setSaveError(null);
    setSaveSuccess(false);
  }

  async function onSubmit(values: DrugFormValues): Promise<void> {
    if (selectedRoutes.length === 0) {
      setSaveError('กรุณาเลือก Route อย่างน้อย 1 รายการ');
      return;
    }

    const confirmed = await confirmAction({
      title: isEditing ? 'ยืนยันการบันทึกการแก้ไข' : 'ยืนยันการเพิ่มรายการยา',
      text: isEditing
        ? 'ระบบจะอัปเดตข้อมูลยาตามค่าที่คุณแก้ไข'
        : 'ระบบจะสร้างรายการยาใหม่จากข้อมูลที่กรอกไว้',
      confirmButtonText: isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการยา',
    });
    if (!confirmed) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // --- จัดการรูปภาพ ---
    let imageUrl = initialDrug?.imageUrl ?? '';

    try {
      if (pendingImageFile) {
        setUploading(true);
        if (initialDrug?.imageUrl) {
          await deleteDrugImage(initialDrug.imageUrl);
        }
        imageUrl = await uploadDrugImage(pendingImageFile, values.genericName);
        setUploading(false);
      } else if (imageMarkedForDeletion && initialDrug?.imageUrl) {
        await deleteDrugImage(initialDrug.imageUrl);
        imageUrl = '';
      }
    } catch (err) {
      setUploading(false);
      const msg = err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ';
      setSaveError(msg);
      setSaving(false);
      return;
    }

    // --- บันทึก Firestore ---
    const payload = {
      ...values,
      dosageForm: values.dosageForm as DosageForm,
      pregnancyCategory: values.pregnancyCategory as PregnancyCategory,
      pricePerUnit: 0,
      status: selectedStatus,
      route: selectedRoutes,
      updatedBy: user?.uid ?? 'unknown',
      imageUrl,
      injectionInfo: values.dosageForm === 'injection'
        ? {
            reconstitutionForm: values.reconstitutionForm,
            reconstitutionVolume: values.reconstitutionVolume,
            compatibleSolutions: values.compatibleSolutions,
            dilutionVolume: values.dilutionVolume,
            stability2_8C: values.stability2_8C,
            stabilityRoom: values.stabilityRoom,
            stability2_8CAfterMix: values.stability2_8CAfterMix,
            stabilityRoomAfterMix: values.stabilityRoomAfterMix,
            injectionReference: values.injectionReference,
          }
        : undefined,
    };

    try {
      if (initialDrug) {
        await drugService.update(initialDrug.id, payload);
      } else {
        await drugService.create(payload);
      }
      setSaveSuccess(true);
      if (!initialDrug) clearForm();
      await onSuccess?.();
      await showSuccessAlert(
        isEditing ? 'บันทึกการแก้ไขสำเร็จ' : 'เพิ่มรายการยาสำเร็จ',
        isEditing ? 'ข้อมูลยาถูกอัปเดตเรียบร้อยแล้ว' : 'รายการยาใหม่ถูกบันทึกเรียบร้อยแล้ว',
      );
      window.setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ กรุณาลองใหม่';
      setSaveError(message);
      await showErrorAlert('ทำรายการไม่สำเร็จ', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-3xl bg-white p-5 shadow-card lg:p-6" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Admin Panel</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">
            {isEditing ? 'แก้ไขข้อมูลยา' : 'เพิ่มยาใหม่'}
          </h3>
        </div>
        {isEditing ? (
          <button
            className="rounded-pill border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-ink hover:text-ink"
            onClick={() => { clearForm(); onCancelEdit?.(); }}
            type="button"
          >
            ยกเลิกการแก้ไข
          </button>
        ) : null}
      </div>

      {/* รูปภาพยา */}
      <DrugImageUpload
        currentUrl={initialDrug?.imageUrl}
        markedForDeletion={imageMarkedForDeletion}
        onFileSelect={setPendingImageFile}
        onMarkForDeletion={setImageMarkedForDeletion}
        pendingFile={pendingImageFile}
        uploading={uploading}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">ชื่อสามัญ (Generic name) *</label>
          <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น Paracetamol" {...register('genericName')} />
          {errors.genericName ? <p className="mt-1 text-xs text-danger">{errors.genericName.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">ชื่อภาษาไทย</label>
          <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น พาราเซตามอล" {...register('genericNameTH')} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">ชื่อการค้า (Trade name)</label>
        <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น Tylenol" {...register('tradeName')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">ความแรง (Strength) *</label>
          <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 500 mg" {...register('strength')} />
          {errors.strength ? <p className="mt-1 text-xs text-danger">{errors.strength.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">กลุ่มยา (Therapeutic class) *</label>
          <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น Analgesic" {...register('therapeuticClass')} />
          {errors.therapeuticClass ? <p className="mt-1 text-xs text-danger">{errors.therapeuticClass.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">รูปแบบยา</label>
        <select className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('dosageForm')}>
          <option value="tablet">Tablet</option>
          <option value="capsule">Capsule</option>
          <option value="injection">Injection</option>
          <option value="solution">Solution</option>
          <option value="suspension">Suspension</option>
          <option value="cream">Cream</option>
          <option value="ointment">Ointment</option>
          <option value="patch">Patch</option>
          <option value="inhaler">Inhaler</option>
          <option value="suppository">Suppository</option>
          <option value="drops">Drops</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-muted">สถานะ</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DRUG_STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedStatus(key as DrugStatus)}
              className="flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition"
              style={
                selectedStatus === key
                  ? { backgroundColor: cfg.color, borderColor: cfg.color, color: '#fff' }
                  : { borderColor: '#DEE3E9', color: cfg.color, backgroundColor: 'white' }
              }
            >
              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </button>
          ))}
        </div>
        <input type="hidden" value={selectedStatus} {...register('status')} />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-muted">วิธีบริหาร (Route) *</label>
        <div className="flex flex-wrap gap-2">
          {ROUTES.map((route) => (
            <button
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedRoutes.includes(route) ? 'bg-ink text-white' : 'bg-subtle text-muted shadow-ring'
              }`}
              key={route}
              onClick={() => toggleRoute(route)}
              type="button"
            >
              {route}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">ข้อบ่งใช้ (Indication)</label>
        <textarea className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" rows={2} {...register('indication')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">ข้อห้ามใช้ (Contraindication)</label>
          <textarea className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" rows={2} {...register('contraindication')} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">อาการข้างเคียง (Side effects)</label>
          <textarea className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" rows={2} {...register('sideEffects')} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">ปฏิกิริยายา (Interactions)</label>
        <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="ยาที่มีปฏิกิริยา" {...register('interactions')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Pregnancy category</label>
          <select className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('pregnancyCategory')}>
            {(['A', 'B', 'C', 'D', 'X', 'N/A'] as const).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">G6PD safe</label>
          <select className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('g6pdSafe', { setValueAs: (v) => v === 'true' })}>
            <option value="true">ปลอดภัย</option>
            <option value="false">ไม่ปลอดภัย</option>
          </select>
        </div>
      </div>

      {dosageForm === 'injection' && (
        <div className="grid gap-4 rounded-[16px] border border-line p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">ข้อมูลการผสมยา (Reconstitution &amp; Solution)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">รูปแบบผงยา</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น Lyophilized powder" {...register('reconstitutionForm')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">ปริมาตรสารละลาย (Reconstitution)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 10 mL SW" {...register('reconstitutionVolume')} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">ชนิดสารละลายที่เข้ากัน</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น NSS, D5W, LRS" {...register('compatibleSolutions')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">ปริมาตรสารละลาย (Dilution)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น ~100 mL" {...register('dilutionVolume')} />
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">ความคงตัว (Stability)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">2-8 °C (ก่อนผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('stability2_8C')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">อุณหภูมิห้อง (ก่อนผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('stabilityRoom')} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">2-8 °C (หลังผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('stability2_8CAfterMix')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">อุณหภูมิห้อง (หลังผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" {...register('stabilityRoomAfterMix')} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">อ้างอิง (URL)</label>
            <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="https://..." type="url" {...register('injectionReference')} />
          </div>
        </div>
      )}

      {saveError ? <p className="rounded-2xl bg-danger-light px-4 py-2.5 text-sm text-danger">{saveError}</p> : null}
      {saveSuccess ? (
        <p className="rounded-2xl bg-success-light px-4 py-2.5 text-sm text-success">
          {isEditing ? 'อัปเดตข้อมูลยาเรียบร้อย' : 'บันทึกข้อมูลสำเร็จ'}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-pill bg-ink px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {uploading ? 'กำลังอัปโหลดรูป...' : saving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลยา'}
        </button>
        {!isEditing ? (
          <button
            className="rounded-pill border border-line px-6 py-2.5 text-sm font-medium text-muted transition hover:border-ink hover:text-ink"
            onClick={clearForm}
            type="button"
          >
            ล้างฟอร์ม
          </button>
        ) : null}
      </div>
    </form>
  );
}
