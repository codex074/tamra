import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-subtle">
      <div className="mx-auto flex max-w-[1440px]">
        <Sidebar />
        <main className="flex-1 px-4 py-4 md:px-6 lg:px-8 lg:py-6">
          <TopBar />
          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
