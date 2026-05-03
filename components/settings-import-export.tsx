"use client";

import { Button } from "@/components/ui/button";
import { exportAll, parseImport } from "@/lib/io/export-import";
import {
  alertStateAtom,
  firedAlertsAtom,
  watchlistAtom
} from "@/lib/watchlist/atoms";
import { useAtom, useAtomValue } from "jotai";
import { Download, RefreshCw, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </h2>
  );
}

export function SettingsImportExport() {
  const watchlist = useAtomValue(watchlistAtom);
  const firedAlerts = useAtomValue(firedAlertsAtom);
  const alertState = useAtomValue(alertStateAtom);

  const [, setWatchlist] = useAtom(watchlistAtom);
  const [, setFiredAlerts] = useAtom(firedAlertsAtom);
  const [, setAlertState] = useAtom(alertStateAtom);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => exportAll(watchlist, firedAlerts, alertState);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const envelope = parseImport(evt.target?.result as string);
        setWatchlist(envelope.watchlist);
        setFiredAlerts(envelope.firedAlerts);
        setAlertState(envelope.alertState);
        toast.success("Data imported successfully.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Import failed.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetAlerts = () => {
    setAlertState((prev) => {
      const reset: typeof prev = {};
      for (const [id, s] of Object.entries(prev)) {
        reset[id] = { ...s, status: "armed" };
      }
      return reset;
    });
    toast.success("All alert rules re-armed.");
  };

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading>Data</SectionHeading>
        <p className="text-sm text-muted-foreground mb-4">
          Export your watchlist and alert rules as a JSON file. Import to
          restore them on another device or after clearing storage.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Export data
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" />
            Import data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      <div>
        <SectionHeading>Alert rules</SectionHeading>
        <p className="text-sm text-muted-foreground mb-4">
          Re-arm all fired alert rules so they can fire again when their
          conditions are met.
        </p>
        <Button variant="outline" onClick={handleResetAlerts}>
          <RefreshCw className="size-4" />
          Re-arm all rules
        </Button>
      </div>
    </div>
  );
}
