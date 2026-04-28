import { cva, VariantProps } from "class-variance-authority";
import { Severity } from "./types";

export const severityVariants = cva(
  "",
  {
    variants: {
      severity: {
        low: 'bg-sky-100 text-sky-700',
        medium: 'bg-amber-100 text-amber-700',
        high: 'bg-red-100 text-red-700',
      } satisfies Record<Severity, string>
    },
    defaultVariants: {
      severity: "low"
    }
  }
)

export type SeverityVariantProps = VariantProps<typeof severityVariants>