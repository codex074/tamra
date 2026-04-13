import { Pill, Shield, TestTubeDiagonal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const publicLinks = [
  { to: '/formulary', label: 'Drug Formulary', icon: Pill },
  { to: '/iv-compatibility', label: 'IV Compatibility', icon: TestTubeDiagonal },
];

export function Sidebar(): JSX.Element {
  const { user } = useAuth();
  const links = user ? [...publicLinks, { to: '/admin', label: 'Admin Panel', icon: Shield }] : publicLinks;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-line bg-white px-4 py-8 lg:flex">
      {/* Wordmark */}
      <div className="mb-8 px-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Tam-Ra-Ya</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink">ตำรายา</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Hospital formulary · Dose calculator · IV compat
        </p>
      </div>

      {/* Nav */}
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
            to={to}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer badge */}
      <div className="mt-auto px-2">
        <p className="rounded-[12px] bg-subtle px-3 py-2 text-[11px] leading-relaxed text-muted">
          {user ? `Logged in · ${user.role}` : 'Public access enabled'}
        </p>
      </div>
    </aside>
  );
}
