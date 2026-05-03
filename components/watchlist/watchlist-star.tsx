"use client";

import type { Market } from "@/lib/markets/types";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist/hooks";
import { BellPlus } from "lucide-react";
import { useState } from "react";
import { AlertRuleDialog } from "../alerts/alert-rule-form";
import { Button } from "../ui/button";

type WatchlistStarProps = {
  market: Market;
  className?: string;
};

/**
 * Toggle button that adds or removes a market from the watchlist.
 * Renders a filled star when watched, outline star otherwise.
 */
export function WatchlistStar({ market, className }: WatchlistStarProps) {
  const { isWatched, remove } = useWatchlist();
  const watched = isWatched(market.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggle = () => {
    if (watched) {
      remove(market.id);
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
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
        <BellPlus className={cn("size-4", watched && "fill-current")} />
      </Button>
      <AlertRuleDialog
        market={market}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
