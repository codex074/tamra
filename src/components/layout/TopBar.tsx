import { Menu } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function TopBar(): JSX.Element {
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-card lg:hidden">
      <button
        className="rounded-pill p-2 text-muted transition hover:bg-subtle hover:text-ink"
        onClick={() => setSidebarOpen(true)}
        type="button"
      >
        <Menu size={18} />
      </button>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">Tam-Ra-Ya</p>
      </div>
    </header>
  );
}
