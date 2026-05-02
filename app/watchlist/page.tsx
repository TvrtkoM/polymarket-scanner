"use client";

import { WatchlistList } from "@/components/watchlist/watchlist-list";

export default function WatchlistPage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Watchlist</h1>
      <WatchlistList />
    </>
  );
}
