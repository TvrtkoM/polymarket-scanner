import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Ref, useEffect, useRef, useState } from 'react'

/**
 * Wraps a horizontally scrollable element with chevron navigation buttons.
 *
 * Uses a render-prop pattern: `children` receives a `ref` to attach to the
 * scrollable element. The left arrow is hidden when scrolled to the start;
 * the right arrow is invisible (but keeps its space) when scrolled to the end.
 * Arrow visibility updates on scroll and on resize via a `ResizeObserver`.
 *
 * @param children - Render prop that receives a `ref` to forward to the scrollable element.
 */
export function HorizontalScroller<E extends HTMLElement>({
  children,
}: {
  children: (ref: Ref<E | null>) => React.ReactNode
}) {
  const scrollRef = useRef<E | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const updateArrows = () => {
      const el = scrollRef.current
      if (!el) return
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? 60 : -60, behavior: 'smooth' })
  }

  return (
    <div className="relative flex items-center gap-1">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>
      )}

      {children(scrollRef)}

      <button
        onClick={() => scroll('right')}
        className={`shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${canScrollRight ? '' : 'invisible'}`}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight size={14} aria-hidden />
      </button>
    </div>
  )
}
