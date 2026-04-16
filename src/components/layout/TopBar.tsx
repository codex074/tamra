import { Menu } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function TopBar(): JSX.Element {
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="flex items-center gap-3 rounded-[20px] bg-teal-900 px-4 py-3 shadow-card lg:hidden">
      <button
        aria-label="Open navigation menu"
        className="cursor-pointer rounded-xl p-2 text-teal-400 transition hover:bg-teal-800 hover:text-white"
        onClick={() => setSidebarOpen(true)}
        type="button"
      >
        <Menu size={18} />
      </button>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white">Tam-Ra-Ya</p>
      </div>
    </header>
  );
}
