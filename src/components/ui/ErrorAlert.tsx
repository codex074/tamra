interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-danger-light p-4 text-sm text-danger shadow-ring">
      <p>{message}</p>
      {onRetry ? (
        <button className="mt-3 rounded-md bg-white px-3 py-1.5 text-ink shadow-ring" onClick={onRetry} type="button">
          ลองใหม่
        </button>
      ) : null}
    </div>
  );
}
