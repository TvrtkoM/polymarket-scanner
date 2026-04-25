import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

export function HorizontalScroller({
  children
}: {
  children: (ref: React.RefObject<HTMLElement | null>) => React.ReactNode;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 60 : -60, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center gap-1">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>
      )}

      {children(scrollRef)}

      <button
        onClick={() => scroll("right")}
        className={`shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${canScrollRight ? "" : "invisible"}`}
        aria-label="Scroll right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight size={14} aria-hidden />
      </button>
    </div>
  );
}
