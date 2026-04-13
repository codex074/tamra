import { ChevronLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DrugForm } from '@/components/drug/DrugForm';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useAuth } from '@/hooks/useAuth';
import { useDrugs } from '@/hooks/useDrugs';
import { formatRouteList } from '@/lib/route-label';
import { getStatusColor, getStatusLabel } from '@/lib/drug-status';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/sweet-alert';
import { drugService } from '@/services/drug.service';
import type { Drug } from '@/types';

const auditRows = [
  { action: 'UPDATE', collection: 'drugs', by: 'demo@tamraya.app', time: '2026-04-12 21:10' },
  { action: 'CREATE', collection: 'doseRules', by: 'demo@tamraya.app', time: '2026-04-12 20:42' },
  { action: 'VIEW', collection: 'ivCompatibility', by: 'pharmd@hospital.local', time: '2026-04-12 20:35' },
];

export function AdminPage(): JSX.Element {
  const pageSize = 10;
  const { user } = useAuth();
  const { drugs, loading, error, refetch } = useDrugs();
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageListOpen, setIsManageListOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [brokenImageIds, setBrokenImageIds] = useState<string[]>([]);

  const filteredDrugs = useMemo(
    () =>
      drugs.filter((drug) =>
        [drug.genericName, drug.genericNameTH, drug.tradeName, drug.strength, drug.therapeuticClass]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [drugs, query],
  );

  const totalPages = Math.max(1, Math.ceil(filteredDrugs.length / pageSize));
  const paginatedDrugs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDrugs.slice(start, start + pageSize);
  }, [filteredDrugs, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function markImageBroken(drugId: string): void {
    setBrokenImageIds((current) => (current.includes(drugId) ? current : [...current, drugId]));
  }

  async function refreshAdminData(): Promise<void> {
    await refetch();
  }

  async function handleDelete(drug: Drug): Promise<void> {
    if (user?.isDemo) {
      const message = 'Guest mode ไม่สามารถลบข้อมูลจริงใน Firestore ได้ กรุณาเข้าสู่ระบบด้วยบัญชี Firebase ก่อน';
      setDeleteError(message);
      await showErrorAlert('ลบข้อมูลไม่ได้ใน Guest mode', message);
      return;
    }

    const confirmed = await confirmAction({
      title: `ยืนยันการลบ ${drug.genericName}`,
      text: 'รายการยานี้จะถูกนำออกจากระบบ และจะไม่แสดงใน formulary อีกต่อไป',
      confirmButtonText: 'ลบรายการ',
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeleteError(null);
    try {
      await drugService.remove(drug.id);
      if (editingDrug?.id === drug.id) {
        setEditingDrug(null);
      }
      await refetch();
      await showSuccessAlert('ลบข้อมูลสำเร็จ', `ลบรายการ ${drug.genericName} เรียบร้อยแล้ว`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ลบข้อมูลไม่สำเร็จ';
      setDeleteError(message);
      await showErrorAlert('ลบข้อมูลไม่สำเร็จ', message);
    }
  }

  async function handleCleanupLocalCache(): Promise<void> {
    const confirmed = await confirmAction({
      title: 'ล้างข้อมูลแคชในเครื่อง',
      text: 'ระบบจะลบ local overrides ที่ค้างอยู่ใน browser เครื่องนี้ แล้วโหลดข้อมูลใหม่จาก Firestore อีกครั้ง',
      confirmButtonText: 'ล้างแคช',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      drugService.clearLocalOverrides();
      setCleanupMessage('ล้าง local cache ของรายการยาเรียบร้อยแล้ว');
      setDeleteError(null);
      await refetch();
      await showSuccessAlert('ล้างแคชสำเร็จ', 'ข้อมูลในเครื่องถูกรีเซ็ตแล้ว และระบบได้ดึงข้อมูลล่าสุดกลับมาใหม่');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ล้าง local cache ไม่สำเร็จ';
      setCleanupMessage(null);
      await showErrorAlert('ล้างแคชไม่สำเร็จ', message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-card lg:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Admin Panel</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-medium leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
          Manage formulary content and operational visibility.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          เลือกการทำงานที่ต้องการจาก 2 ปุ่มด้านล่าง เมื่อกดเพิ่มรายการยาจะเปิดฟอร์มแบบ modal และเมื่อกดแก้ไข/ลบรายการยาจะแสดงรายการยาให้จัดการต่อได้
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            className="rounded-[28px] border border-primary/15 bg-primary-light px-6 py-6 text-left transition hover:border-primary/30 hover:bg-primary-light/80"
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Action 01</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">เพิ่มรายการยา</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              เปิดแบบฟอร์มเพิ่มรายการยาใหม่ใน modal โดยไม่ต้องแสดงฟอร์มค้างไว้บนหน้า
            </p>
          </button>

          <button
            className="rounded-[28px] border border-line bg-subtle px-6 py-6 text-left transition hover:border-ink/20 hover:bg-white"
            onClick={() => setIsManageListOpen((current) => !current)}
            type="button"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Action 02</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">แก้ไข/ลบรายการยา</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {isManageListOpen
                ? 'ซ่อนรายการยาที่ใช้สำหรับแก้ไขหรือลบ'
                : 'แสดงรายการยาเพื่อค้นหาและเลือกแก้ไขหรือลบ'}
            </p>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-dashed border-line bg-subtle px-4 py-3">
          <p className="text-sm text-muted">
            ถ้า browser ยังจำข้อมูลเก่าจนรูปหรือรายการยาไม่อัปเดต สามารถล้าง local cache ของเครื่องนี้ได้จากปุ่มด้านขวา
          </p>
          <button
            className="inline-flex items-center rounded-pill border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ink hover:text-ink"
            onClick={() => void handleCleanupLocalCache()}
            type="button"
          >
            Cleanup local cache
          </button>
        </div>
        {cleanupMessage ? <p className="mt-3 text-sm text-success">{cleanupMessage}</p> : null}
      </section>

      {user?.isDemo ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-card">
          คุณกำลังใช้ Guest mode อยู่ จึงดูหน้า Admin ได้เพื่อเดโม UI เท่านั้น การเพิ่ม แก้ไข ลบข้อมูลยา และอัปโหลดรูปจะไม่ถูกบันทึกขึ้น Firebase
        </section>
      ) : null}

      {isManageListOpen ? (
        <section className="rounded-[32px] bg-white p-6 shadow-card lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Admin Tools</p>
              <h2 className="mt-3 text-3xl font-medium leading-tight tracking-normal text-ink">Edit or remove formulary entries</h2>
              <p className="mt-2 text-sm text-muted">
                ค้นหารายการยา เลือกแก้ไขเพื่อโหลดข้อมูลขึ้นฟอร์ม หรือกดลบเพื่อนำรายการออกจากระบบ
              </p>
            </div>
            <div className="w-full max-w-md">
              <input
                className="w-full rounded-2xl border border-line bg-subtle px-4 py-3 text-sm text-ink placeholder:text-muted"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาจากชื่อยา ชื่อการค้า ความแรง หรือกลุ่มยา"
                value={query}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>
              {filteredDrugs.length} จาก {drugs.length} รายการ
            </p>
            {filteredDrugs.length ? (
              <p>
                หน้า {page} / {totalPages}
              </p>
            ) : null}
          </div>

          {loading ? <div className="mt-6"><LoadingSpinner /></div> : null}
          {error ? <div className="mt-6"><ErrorAlert message={error} onRetry={() => void refetch()} /></div> : null}
          {deleteError ? <p className="mt-4 rounded-2xl bg-danger-light px-4 py-3 text-sm text-danger">{deleteError}</p> : null}

          {!loading && !error ? (
            <div className="mt-6">
              <div className="overflow-hidden rounded-[24px] border border-line">
                <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-4 bg-subtle px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted md:grid">
                  <p>Drug</p>
                  <p>Details</p>
                  <p className="text-right">Actions</p>
                </div>
                <div className="divide-y divide-line bg-white">
                  {paginatedDrugs.map((drug) => {
                    const statusColor = getStatusColor(drug.status);

                    return (
                      <article className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto] md:items-center" key={drug.id}>
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-subtle">
                            {drug.imageUrl && !brokenImageIds.includes(drug.id) ? (
                              <img
                                alt={drug.genericName}
                                className="h-full w-full object-contain p-1.5"
                                onError={() => markImageBroken(drug.id)}
                                src={drug.imageUrl}
                              />
                            ) : (
                              <span className="text-xs font-bold uppercase text-muted/40">
                                {drug.dosageForm.slice(0, 3)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{drug.therapeuticClass}</p>
                            <h3 className="mt-2 text-lg font-semibold text-ink">{drug.genericName}</h3>
                            <p className="mt-1 truncate text-sm text-muted">{drug.tradeName}</p>
                            <div className="mt-3">
                              <span
                                className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-medium"
                                style={{ color: statusColor, backgroundColor: `${statusColor}18` }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                                {getStatusLabel(drug.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 space-y-1 text-sm text-muted">
                          <p>{drug.strength} · {formatRouteList(drug.route)}</p>
                          <p className="line-clamp-2">{drug.indication || 'ไม่มีรายละเอียดข้อบ่งใช้'}</p>
                        </div>

                        <div className="flex flex-wrap gap-3 md:justify-end">
                          <button
                            className="inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
                            onClick={() => { setEditingDrug(drug); }}
                            type="button"
                          >
                            <Pencil size={14} />
                            แก้ไข
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-pill border border-danger/20 bg-white px-4 py-2 text-sm font-medium text-danger transition hover:border-danger hover:bg-danger-light"
                            onClick={() => void handleDelete(drug)}
                            type="button"
                          >
                            <Trash2 size={14} />
                            ลบ
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {filteredDrugs.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm text-muted">
                      ไม่พบรายการยาที่ตรงกับคำค้น
                    </p>
                  ) : null}
                </div>
              </div>

              {filteredDrugs.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    แสดง {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredDrugs.length)} จาก {filteredDrugs.length} รายการ
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      <ChevronLeft size={14} />
                      ก่อนหน้า
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
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
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Audit Log</p>
            <h2 className="mt-3 text-3xl font-medium leading-tight tracking-normal text-ink">Latest activity</h2>
          </div>
          <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">Admin only</span>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl shadow-ring">
          <table className="min-w-full">
            <thead className="bg-subtle text-left text-xs uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Collection</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((row) => (
                <tr className="border-t border-line text-sm" key={`${row.action}-${row.time}`}>
                  <td className="px-4 py-3 text-ink">{row.action}</td>
                  <td className="px-4 py-3 text-muted">{row.collection}</td>
                  <td className="px-4 py-3 text-muted">{row.by}</td>
                  <td className="px-4 py-3 text-muted">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingDrug ? (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[999] overflow-y-auto bg-white/10 p-4 pt-10 md:p-6 md:pt-12"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setEditingDrug(null);
              }
            }}
          >
            <div className="pointer-events-none flex w-full justify-center">
              <div
                className="pointer-events-auto relative w-full max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  aria-label="ปิด modal แก้ไขยา"
                  className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/95 text-muted shadow-card transition hover:border-ink hover:text-ink"
                  onClick={() => setEditingDrug(null)}
                  type="button"
                >
                  <X size={18} />
                </button>
                <DrugForm
                  initialDrug={editingDrug}
                  onCancelEdit={() => setEditingDrug(null)}
                  onSuccess={async () => {
                    await refreshAdminData();
                    setEditingDrug(null);
                  }}
                  showHeaderCancelButton={false}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}

      {isCreateModalOpen ? (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[999] overflow-y-auto bg-white/10 p-4 pt-10 md:p-6 md:pt-12"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsCreateModalOpen(false);
              }
            }}
          >
            <div className="pointer-events-none flex w-full justify-center">
              <div
                className="pointer-events-auto relative w-full max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  aria-label="ปิด modal เพิ่มยา"
                  className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/95 text-muted shadow-card transition hover:border-ink hover:text-ink"
                  onClick={() => setIsCreateModalOpen(false)}
                  type="button"
                >
                  <X size={18} />
                </button>
                <DrugForm
                  onSuccess={async () => {
                    await refreshAdminData();
                    setIsCreateModalOpen(false);
                    setIsManageListOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  );
}
