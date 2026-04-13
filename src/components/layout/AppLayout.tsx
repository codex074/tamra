import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-subtle">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="isolate min-w-0 flex-1 px-4 py-4 md:px-6 lg:px-10 lg:py-6 xl:px-12">
          <TopBar />
          <div className="mt-4 lg:mt-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
