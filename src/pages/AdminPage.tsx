import { DrugForm } from '@/components/drug/DrugForm';

const auditRows = [
  { action: 'UPDATE', collection: 'drugs', by: 'demo@tamraya.app', time: '2026-04-12 21:10' },
  { action: 'CREATE', collection: 'doseRules', by: 'demo@tamraya.app', time: '2026-04-12 20:42' },
  { action: 'VIEW', collection: 'ivCompatibility', by: 'pharmd@hospital.local', time: '2026-04-12 20:35' },
];

export function AdminPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-card lg:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Admin Panel</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.09em] text-ink sm:text-5xl lg:text-6xl">
          Manage formulary content and operational visibility.
        </h1>
      </section>

      <DrugForm />

      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Audit Log</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-ink">Latest activity</h2>
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
    </div>
  );
}
