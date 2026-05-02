"use client";

import type { Market } from "@/lib/markets/types";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist/hooks";
import { Bell } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button";

type WatchlistStarProps = {
  market: Pick<Market, "id" | "slug" | "question">;
  className?: string;
};

/**
 * Toggle button that adds or removes a market from the watchlist.
 * Renders a filled star when watched, outline star otherwise.
 */
export function WatchlistStar({ market, className }: WatchlistStarProps) {
  const { isWatched, add, remove } = useWatchlist();
  const watched = isWatched(market.id);

  const toggle = useCallback(() => {
    if (watched) {
      remove(market.id);
    } else {
      add({
        marketId: market.id,
        slug: market.slug,
        question: market.question
      });
    }
  }, [watched, market, add, remove]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={watched}
      className={cn(
        watched && "text-amber-500 hover:text-amber-600",
        className
      )}
    >
      <Bell className={cn("size-4", watched && "fill-current")} />
    </Button>
  );
}
