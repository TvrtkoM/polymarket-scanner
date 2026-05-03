"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useFiredAlerts } from "@/lib/watchlist/hooks";
import { formatDate } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";

export function AlertCenter() {
  const { alerts, unreadCount, markAllRead, clear } = useFiredAlerts();

  const recent = alerts.slice(0, 20);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) markAllRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Alert center"
          className="relative"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-120 overflow-y-auto"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Alerts</span>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {recent.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            No alerts yet.
          </p>
        ) : (
          recent.map((alert) => (
            <Link
              key={alert.id}
              href={`/markets/${alert.slug}`}
              className="block px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <p className="text-xs font-medium line-clamp-1">
                {alert.question}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.message}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {formatDate(alert.firedAt)}
              </p>
            </Link>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
