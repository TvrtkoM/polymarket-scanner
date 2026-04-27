export function ErrorComponent({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700">{error.message}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 active:bg-red-800"
      >
        Retry
      </button>
    </div>
  );
}
