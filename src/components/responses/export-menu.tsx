"use client";

import { Button } from "@/components/ui/button";
import { ChevronDownIcon, DownloadIcon, DotsIcon, TrashIcon } from "@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { exportMenu, responsesPage } from "@/content/dashboard/responses";
import type { ExportFormat } from "@/lib/responses/export/download";
import { cn } from "@/lib/utils";

const formats: { format: ExportFormat; name: string; text: string; badge?: string }[] = [
  { format: "csv", name: exportMenu.csv.name, text: exportMenu.csv.text, badge: exportMenu.csv.badge },
  { format: "xlsx", name: exportMenu.xlsx.name, text: exportMenu.xlsx.text },
  { format: "json", name: exportMenu.json.name, text: exportMenu.json.text },
];

/** "Export all" and its "Download as" menu (board Responses). Downloads are never limited by the plan. */
export function ExportMenu({ label, count, primary, onExport }: { label: string; count: number; primary: boolean; onExport: (format: ExportFormat) => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button shape="box" variant={primary ? "primary" : "secondary"} className="gap-2">
          <DownloadIcon size={18} />
          {label}
          <ChevronDownIcon size={16} />
        </Button>
      </MenuTrigger>
      <MenuContent className="w-[340px]">
        <span className="block px-3 pb-1 pt-2 text-[13px] font-bold uppercase tracking-[0.04em] text-mute">{exportMenu.title}</span>
        {formats.map((item) => (
          <MenuItem key={item.format} onSelect={() => onExport(item.format)} className={cn("min-h-[60px] flex-col items-start justify-center gap-0")}>
            <span className="flex items-center gap-2 text-base font-semibold">
              {item.name}
              {item.badge ? <span className="rounded-full bg-slate px-2 py-0.5 text-xs font-semibold text-white">{item.badge}</span> : null}
            </span>
            <span className="text-sm font-normal text-mute">{item.text}</span>
          </MenuItem>
        ))}
        <div className="mx-1 mt-1.5 border-t border-line px-2 pb-1.5 pt-2.5 text-sm text-mute">{exportMenu.note(count)}</div>
      </MenuContent>
    </Menu>
  );
}

/** The "…" button next to Export all: the place for "Delete all responses…". */
export function MoreMenu({ onDeleteAll }: { onDeleteAll: () => void }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button shape="box" variant="secondary" aria-label={responsesPage.moreActions} className="size-12 px-0">
          <DotsIcon />
        </Button>
      </MenuTrigger>
      <MenuContent className="w-[290px]">
        <MenuItem danger icon={<TrashIcon />} onSelect={onDeleteAll}>
          {responsesPage.deleteAll}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
