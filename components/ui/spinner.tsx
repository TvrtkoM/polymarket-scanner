import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <LoaderCircle className={cn('animate-spin', className)} size={size} />
}
