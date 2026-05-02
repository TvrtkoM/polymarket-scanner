"use client";

import { Button } from "@/components/ui/button";
import type { MarketWithSignals } from "@/lib/markets/types";
import { useAlertRules } from "@/lib/watchlist/hooks";
import type { AlertRule, AlertRuleState } from "@/lib/watchlist/types";
import { formatCurrency, formatSignedPercent } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { RefreshCw, Trash2 } from "lucide-react";
import { alertStateAtom } from "@/lib/watchlist/atoms";
import { AlertRuleForm } from "./alert-rule-form";

function ruleDescription(rule: AlertRule): string {
  switch (rule.ruleId) {
    case "price_cross":
      return `${rule.outcomeLabel} price ${rule.direction} ${(rule.threshold * 100).toFixed(0)}%`;
    case "price_move_24h":
      return `24h move ≥ ${formatSignedPercent(rule.absChange)}`;
    case "volume_24h":
      return `24h volume > ${formatCurrency(rule.threshold)}`;
    case "near_resolution":
      return `Resolves within ${rule.daysLeft} day(s)`;
  }
}

function RuleStatusBadge({ state }: { state: AlertRuleState | undefined }) {
  const fired = state?.status === "fired";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        fired
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {fired ? "fired" : "armed"}
    </span>
  );
}

type AlertRuleRowProps = {
  rule: AlertRule;
  state: AlertRuleState | undefined;
  onRemove: (id: string) => void;
  onReset: (id: string) => void;
};

function AlertRuleRow({ rule, state, onRemove, onReset }: AlertRuleRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="flex-1 truncate text-muted-foreground">
        {ruleDescription(rule)}
      </span>
      <RuleStatusBadge state={state} />
      {state?.status === "fired" && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onReset(rule.id)}
          aria-label="Re-arm rule"
          title="Re-arm"
        >
          <RefreshCw className="size-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(rule.id)}
        aria-label="Remove rule"
        title="Remove"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

type AlertRuleListProps = {
  marketId: string;
  market?: Pick<MarketWithSignals, "id" | "outcomes">;
};

/**
 * Renders the list of alert rules for a market plus a button to add more.
 * Requires `market` to show the add-rule dialog. When `market` is not yet
 * loaded (e.g. watchlist list is still fetching), only existing rules are shown.
 */
export function AlertRuleList({ marketId, market }: AlertRuleListProps) {
  const { rules, removeRule, resetRule } = useAlertRules(marketId);
  const alertState = useAtomValue(alertStateAtom);

  if (rules.length === 0 && !market) return null;

  return (
    <div className="flex flex-col gap-1.5 px-1">
      {rules.map((rule) => (
        <AlertRuleRow
          key={rule.id}
          rule={rule}
          state={alertState[rule.id]}
          onRemove={removeRule}
          onReset={resetRule}
        />
      ))}
      {market && <AlertRuleForm market={market} />}
    </div>
  );
}
