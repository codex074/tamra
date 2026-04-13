import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { drugService } from '@/services/drug.service';
import { useAuth } from '@/hooks/useAuth';
import { DRUG_STATUS_CONFIG } from '@/lib/drug-status';
import type { DosageForm, DrugStatus, RouteOfAdmin, PregnancyCategory } from '@/types';

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
  pricePerUnit: z.number().min(0).optional(),
  status: z.enum(['had', 'uc_free', 'staff_order', 'ned_national', 'all_rights', 'ocpa', 'ned_only', 'restrict_atb', 'self_pay', 'self_pay2']),
  notes: z.string(),
  // Injection-specific
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

const ROUTES: RouteOfAdmin[] = ['oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'sublingual', 'rectal', 'ophthalmic', 'other'];

export function DrugForm(): JSX.Element {
  const { user } = useAuth();
  const [selectedRoutes, setSelectedRoutes] = useState<RouteOfAdmin[]>(['oral']);
  const [selectedStatus, setSelectedStatus] = useState<DrugStatus>('all_rights');
  const [saving, setSaving] = useState(false);
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
    defaultValues: {
      genericName: '',
      genericNameTH: '',
      tradeName: '',
      dosageForm: 'tablet',
      strength: '',
      therapeuticClass: '',
      indication: '',
      contraindication: '',
      sideEffects: '',
      interactions: '',
      pregnancyCategory: 'N/A',
      g6pdSafe: true,
      storage: 'เก็บที่อุณหภูมิห้อง',
      pricePerUnit: 0,
      status: 'all_rights',
      notes: '',
    },
  });

  const dosageForm = watch('dosageForm');

  function toggleRoute(route: RouteOfAdmin): void {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  }

  async function onSubmit(values: DrugFormValues): Promise<void> {
    if (selectedRoutes.length === 0) {
      setSaveError('กรุณาเลือก Route อย่างน้อย 1 รายการ');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await drugService.create({
        ...values,
        dosageForm: values.dosageForm as DosageForm,
        pregnancyCategory: values.pregnancyCategory as PregnancyCategory,
        pricePerUnit: values.pricePerUnit ?? 0,
        status: selectedStatus,
        route: selectedRoutes,
        updatedBy: user?.uid ?? 'unknown',
        injectionInfo: values.dosageForm === 'injection' ? {
          reconstitutionForm: values.reconstitutionForm,
          reconstitutionVolume: values.reconstitutionVolume,
          compatibleSolutions: values.compatibleSolutions,
          dilutionVolume: values.dilutionVolume,
          stability2_8C: values.stability2_8C,
          stabilityRoom: values.stabilityRoom,
          stability2_8CAfterMix: values.stability2_8CAfterMix,
          stabilityRoomAfterMix: values.stabilityRoomAfterMix,
          injectionReference: values.injectionReference,
        } : undefined,
      });
      setSaveSuccess(true);
      reset();
      setSelectedRoutes(['oral']);
      setSelectedStatus('all_rights');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-3xl bg-white p-5 shadow-card" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Admin Panel</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">เพิ่มยาใหม่</h3>
      </div>

      {/* Required fields */}
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

      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">สถานะ</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DRUG_STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedStatus(key as DrugStatus);
              }}
              className="flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition"
              style={
                selectedStatus === key
                  ? { backgroundColor: cfg.color, borderColor: cfg.color, color: '#fff' }
                  : { borderColor: '#DEE3E9', color: cfg.color, backgroundColor: 'white' }
              }
            >
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </button>
          ))}
        </div>
        <input type="hidden" value={selectedStatus} {...register('status')} />
      </div>

      {/* Route of admin */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted">วิธีบริหาร (Route) *</label>
        <div className="flex flex-wrap gap-2">
          {ROUTES.map((route) => (
            <button
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedRoutes.includes(route)
                  ? 'bg-ink text-white'
                  : 'bg-subtle text-muted shadow-ring'
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

      {/* Clinical info */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">ข้อบ่งใช้ (Indication)</label>
        <textarea className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="ข้อบ่งใช้ของยา" rows={2} {...register('indication')} />
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
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="X">X</option>
            <option value="N/A">N/A</option>
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

      {/* Injection-specific section */}
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
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น ~100 mL (ไม่เกิน 5 mg/mL)" {...register('dilutionVolume')} />
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">ความคงตัว (Stability)</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">อุณหภูมิ 2-8 °C (ก่อนผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 24 ชม." {...register('stability2_8C')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">อุณหภูมิห้อง 25 °C (ก่อนผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 12 ชม." {...register('stabilityRoom')} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">2-8 °C (หลังผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 7 วัน" {...register('stability2_8CAfterMix')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">อุณหภูมิห้อง (หลังผสม)</label>
              <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="เช่น 2 ชม." {...register('stabilityRoomAfterMix')} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">อ้างอิง (URL)</label>
            <input className="w-full rounded-2xl border-0 bg-subtle px-4 py-2.5 text-sm" placeholder="https://..." type="url" {...register('injectionReference')} />
          </div>
        </div>
      )}

      {saveError ? <p className="rounded-2xl bg-danger-light px-4 py-2.5 text-sm text-danger">{saveError}</p> : null}
      {saveSuccess ? <p className="rounded-2xl bg-success-light px-4 py-2.5 text-sm text-success">บันทึกข้อมูลสำเร็จ</p> : null}

      <button
        className="rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        disabled={saving}
        type="submit"
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลยา'}
      </button>
    </form>
  );
}
