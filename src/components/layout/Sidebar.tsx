import { Pill, Shield, TestTubeDiagonal, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

const publicLinks = [
  { to: '/formulary', label: 'Drug Formulary', icon: Pill },
  { to: '/iv-compatibility', label: 'IV Compatibility', icon: TestTubeDiagonal },
];

function SidebarContent({ onClose }: { onClose?: () => void }): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user
    ? [...publicLinks, { to: '/admin', label: 'Admin Panel', icon: Shield }]
    : publicLinks;

  return (
    <aside className="flex h-full w-72 flex-col bg-white px-4 py-8 lg:border-r lg:border-line">
      {/* Wordmark + close button (mobile) */}
      <div className="mb-8 flex items-start justify-between px-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Tam-Ra-Ya</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink">ตำรายา</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Hospital formulary · IV compat
          </p>
        </div>
        {onClose ? (
          <button
            className="mt-1 rounded-pill p-1.5 text-muted transition hover:bg-subtle hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* Nav links */}
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-card'
                  : 'text-muted hover:bg-subtle hover:text-ink',
              )
            }
            onClick={onClose}
            to={to}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + auth action at bottom */}
      <div className="mt-auto space-y-2 px-2">
        <div className="rounded-[14px] bg-subtle px-3 py-3">
          {user?.isDemo ? (
            <span className="inline-flex items-center rounded-pill bg-primary-light px-2.5 py-0.5 text-[11px] font-medium text-primary">
              Demo mode
            </span>
          ) : null}
          {user?.email ? (
            <p className={`truncate text-[11px] text-muted ${user.isDemo ? 'mt-1.5' : ''}`}>{user.email}</p>
          ) : !user ? (
            <span className="inline-flex items-center rounded-pill bg-primary-light px-2.5 py-0.5 text-[11px] font-medium text-primary">
              Public access
            </span>
          ) : null}
        </div>

        {user ? (
          <button
            className="w-full rounded-pill border border-line py-2.5 text-sm font-medium text-muted transition hover:border-ink hover:text-ink"
            onClick={() => void logout()}
            type="button"
          >
            ออกจากระบบ
          </button>
        ) : (
          <button
            className="w-full rounded-pill bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
            onClick={() => { navigate('/login'); onClose?.(); }}
            type="button"
          >
            ล็อกอิน
          </button>
        )}
      </div>
    </aside>
  );
}

export function Sidebar(): JSX.Element {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Desktop — sticky permanent sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <SidebarContent />
      </div>

      {/* Mobile — slide-in drawer with backdrop */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-floating">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
