import { Pill, Shield, Syringe, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

const publicLinks = [
  { to: '/formulary', label: 'Drug Information', icon: Pill },
  { to: '/injectable-drugs', label: 'Injectable Drug', icon: Syringe },
];

function SidebarContent({ onClose }: { onClose?: () => void }): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user
    ? [...publicLinks, { to: '/admin', label: 'Admin Panel', icon: Shield }]
    : publicLinks;

  return (
    <aside className="flex h-full w-72 flex-col bg-teal-900 px-4 py-8">
      {/* Wordmark + close button (mobile) */}
      <div className="mb-8 flex items-start justify-between px-2">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <img
              alt="Uttaradit Hospital logo"
              className="h-12 w-12 rounded-2xl object-contain"
              src="/hoslogo.png"
            />
            <p className="text-lg font-semibold uppercase leading-none tracking-[0.14em] text-white">Tam-Ra-Ya</p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-teal-400">
            Pharmacy Dept · Uttaradit Hospital
          </p>
        </div>
        {onClose ? (
          <button
            aria-label="Close menu"
            className="mt-1 cursor-pointer rounded-xl p-1.5 text-teal-400 transition hover:bg-teal-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* Nav links */}
      <nav aria-label="Main navigation" className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              cn(
                'flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-teal-300 hover:bg-teal-800 hover:text-white',
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
        <div className="rounded-[14px] bg-teal-800 px-3 py-3">
          {user?.isDemo ? (
            <span className="inline-flex items-center rounded-full bg-cyan-600/20 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
              Demo mode
            </span>
          ) : null}
          {user?.email ? (
            <p className={`truncate text-[11px] text-teal-300 ${user.isDemo ? 'mt-1.5' : ''}`}>{user.email}</p>
          ) : !user ? (
            <span className="inline-flex items-center rounded-full bg-cyan-600/20 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
              Public access
            </span>
          ) : null}
        </div>

        {user ? (
          <button
            className="w-full cursor-pointer rounded-xl border border-teal-700 py-2.5 text-sm font-medium text-teal-300 transition hover:border-teal-500 hover:bg-teal-800 hover:text-white"
            onClick={() => void logout()}
            type="button"
          >
            ออกจากระบบ
          </button>
        ) : (
          <button
            className="w-full cursor-pointer rounded-xl bg-cyan-600 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
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
            className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm"
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
