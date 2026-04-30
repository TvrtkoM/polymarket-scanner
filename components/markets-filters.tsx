"use client";

import { marketsSearchParsers, SORT_OPTIONS } from "@/lib/markets/search-params";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const inputClass =
  "h-8 rounded-lg border border-border bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30";

const DEFAULT_ORDER = marketsSearchParsers.order.defaultValue;
const DEFAULT_LIQUIDITY = marketsSearchParsers.liquidity_num_min.defaultValue;
const DEFAULT_TAG = marketsSearchParsers.tag_match.defaultValue;

export function MarketsFilters() {
  const [{ order, liquidity_num_min, tag_match }, setParams] = useQueryStates(
    marketsSearchParsers,
    { shallow: false }
  );

  const [liquidityInput, setLiquidityInput] = useState(String(liquidity_num_min));
  const [tagInput, setTagInput] = useState(tag_match);

  // Keep local state in sync when URL params change externally (e.g. browser back)
  useEffect(() => { setLiquidityInput(String(liquidity_num_min)); }, [liquidity_num_min]);
  useEffect(() => { setTagInput(tag_match); }, [tag_match]);

  // Debounce liquidity input → URL
  useEffect(() => {
    const parsed = parseInt(liquidityInput, 10);
    if (isNaN(parsed) || parsed === liquidity_num_min) return;
    const id = setTimeout(() => setParams({ liquidity_num_min: parsed }), 400);
    return () => clearTimeout(id);
  }, [liquidityInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce tag input → URL
  useEffect(() => {
    if (tagInput === tag_match) return;
    const id = setTimeout(() => setParams({ tag_match: tagInput }), 400);
    return () => clearTimeout(id);
  }, [tagInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty =
    order !== DEFAULT_ORDER ||
    liquidity_num_min !== DEFAULT_LIQUIDITY ||
    tag_match !== DEFAULT_TAG;

  function reset() {
    setParams({ order: DEFAULT_ORDER, liquidity_num_min: DEFAULT_LIQUIDITY, tag_match: DEFAULT_TAG });
    setLiquidityInput(String(DEFAULT_LIQUIDITY));
    setTagInput(DEFAULT_TAG);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort */}
      <select
        value={order}
        onChange={(e) => setParams({ order: e.target.value })}
        className={cn(inputClass, "pr-7 appearance-none cursor-pointer")}
        aria-label="Sort by"
      >
        {Object.entries(SORT_OPTIONS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Min liquidity */}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">$</span>
        <input
          type="number"
          min={0}
          value={liquidityInput}
          onChange={(e) => setLiquidityInput(e.target.value)}
          className={cn(inputClass, "w-32 pl-5")}
          aria-label="Minimum liquidity"
          placeholder="Min liquidity"
        />
      </div>

      {/* Tag match */}
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        className={cn(inputClass, "w-36")}
        aria-label="Tag"
        placeholder="Tag"
      />

      {/* Reset */}
      {isDirty && (
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
          <X />
          Reset
        </Button>
      )}
    </div>
  );
}
