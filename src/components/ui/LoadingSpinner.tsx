export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-ink" />
    </div>
  );
}
