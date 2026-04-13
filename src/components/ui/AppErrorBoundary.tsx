import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error): void {
    console.error('app.runtime_error', error);
  }

  public render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6">
          <div className="max-w-xl rounded-[28px] bg-white p-6 shadow-floating">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-danger">Runtime Error</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-ink">แอปเริ่มทำงานไม่สำเร็จ</h1>
            <p className="mt-3 text-sm text-muted">
              เปิด DevTools Console แล้วส่งข้อความ error นี้มาได้เลย:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-subtle p-4 text-xs text-ink">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
