import { severityVariants } from "@/lib/class-variants";
import { Signal } from "@/lib/markets/types";
import { cn } from "@/lib/utils";
import { Ref } from "react";

function SignalBadge({ signal }: { signal: Signal }) {
  return (
    <span
      title={signal.rule}
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
        severityVariants({ severity: signal.severity })
      )}
    >
      {signal.description}
    </span>
  );
}

export function SignalBadges({
  signals,
  ref,
  className = ""
}: {
  signals: Signal[];
  ref?: Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-hidden", className)} ref={ref}>
      {signals.map((signal, i) => (
        <SignalBadge key={i} signal={signal} />
      ))}
    </div>
  );
}
