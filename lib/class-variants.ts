import { cva, VariantProps } from 'class-variance-authority'
import { Severity } from './types'
import { ResolutionStatus } from './markets/types'

/**
 * CVA variant map that applies Tailwind colour classes based on a {@link Severity} level.
 */
export const severityVariants = cva('', {
  variants: {
    severity: {
      low: 'bg-sky-100 text-sky-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700',
    } satisfies Record<Severity, string>,
  },
  defaultVariants: {
    severity: 'low',
  },
})

/** Props accepted by components that use {@link severityVariants}. */
export type SeverityVariantProps = VariantProps<typeof severityVariants>

/**
 * CVA variant map that applies Tailwind colour classes based on a {@link ResolutionStatus}.
 */
export const resolutionStatusVariants = cva('', {
  variants: {
    status: {
      proposed: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
    } satisfies Record<ResolutionStatus, string>,
  },
})

/** Props accepted by components that use {@link resolutionStatusVariants}. */
export type ResolutionStatusVariantProps = VariantProps<typeof resolutionStatusVariants>
