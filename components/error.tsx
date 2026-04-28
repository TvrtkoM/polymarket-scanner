import { severityVariants } from "@/lib/class-variants";
import { isRetryable } from "@/lib/errors";
import { cn } from "@/lib/utils";

export function ErrorComponent({
  error,
  onRetry
}: {
  error: Error;
  onRetry: () => void;
}) {
  const canRetry = isRetryable(error);
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-red-200 p-6 text-center",
        severityVariants({ severity: "high" })
      )}
    >
      <p>{error.message}</p>
      {canRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 active:bg-red-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}
