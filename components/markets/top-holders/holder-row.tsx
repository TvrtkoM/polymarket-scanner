import { cn, formatNumber } from '@/lib/utils'
import type { Holder } from '@/lib/markets/types'
import Avatar from 'boring-avatars'
import Image from 'next/image'

function formatAddress(address: string, visibleStart = 6, visibleEnd = 4) {
  return `${address.slice(0, visibleStart)}…${address.slice(-visibleEnd)}`
}

function displayName(holder: Holder) {
  if (holder.name.startsWith('0x')) {
    return formatAddress(holder.proxyWallet)
  }
  if (holder.name) return holder.name
  if (holder.pseudonym) return holder.pseudonym
  return `${holder.proxyWallet.slice(0, 6)}…${holder.proxyWallet.slice(-4)}`
}

export function HolderRow({ holder, amountClassName }: { holder: Holder; amountClassName?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="size-8 shrink-0 overflow-hidden rounded-full hidden sm:block">
        {holder.profileImage ? (
          <Image src={holder.profileImage} alt="" width={32} height={32} className="size-8 object-cover" />
        ) : (
          <Avatar size={32} variant="bauhaus" name={holder.proxyWallet} />
        )}
      </div>
      <span className="flex-1 truncate text-sm font-medium">{displayName(holder)}</span>
      <span className={cn('font-mono text-sm tabular-nums', amountClassName)}>{formatNumber(holder.amount)}</span>
    </div>
  )
}

export function HolderRowPlaceholder() {
  return <div className="py-2 h-12" aria-hidden />
}
