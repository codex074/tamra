import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';

export function TopBar(): JSX.Element {
  const { user, logout } = useAuth();
  const { setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between rounded-[20px] bg-white px-5 py-3.5 shadow-card">
      <button
        className="rounded-pill p-2 text-muted transition hover:bg-subtle lg:hidden"
        onClick={() => setSidebarOpen(true)}
        type="button"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        <span className="rounded-pill bg-primary-light px-3 py-1 text-xs font-medium text-primary">
          {user ? (user.isDemo ? 'Demo mode' : user.role) : 'Public access'}
        </span>

        {user ? (
          <button
            className="rounded-pill border border-line px-4 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
            onClick={() => void logout()}
            type="button"
          >
            ออกจากระบบ
          </button>
        ) : (
          <button
            className="rounded-pill bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-hover"
            onClick={() => navigate('/login')}
            type="button"
          >
            ล็อกอิน
          </button>
        )}
      </div>
    </header>
  );
}
