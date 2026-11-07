"use client";

import { ChevronDownIcon, ChevronUpIcon, CopyIcon, DotsIcon, TrashIcon } from "@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { pageList, pageMenu } from "@/content/dashboard/editor";
import { useEditor, useEditorUi } from "../editor-context";

/** The three dots on the chosen page and the menu they open (board PageMenu). Start and End pages have none. */
export function PageMenu({ pageId }: { pageId: string }) {
  const index = useEditor((s) => s.doc.pages.findIndex((p) => p.id === pageId));
  const count = useEditor((s) => s.doc.pages.length);
  const { requestDuplicate, requestDeletePage, requestMove } = useEditorUi();
  const first = index === 1;
  const lastQuestion = index === count - 2;

  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={pageList.options}
          className="grid size-11 flex-none place-items-center rounded-[10px] bg-white text-slate transition-colors duration-200 hover:bg-line focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate data-[state=open]:bg-line"
        >
          <DotsIcon />
        </button>
      </MenuTrigger>
      <MenuContent className="w-[260px]">
        <MenuItem icon={<CopyIcon />} onSelect={() => requestDuplicate(pageId)}>
          {pageMenu.duplicate}
        </MenuItem>
        <MenuItem icon={<ChevronUpIcon />} disabled={first} onSelect={() => requestMove(pageId, index - 1)}>
          {pageMenu.moveUp}
        </MenuItem>
        <MenuItem icon={<ChevronDownIcon size={18} />} disabled={lastQuestion} onSelect={() => requestMove(pageId, index + 1)}>
          {pageMenu.moveDown}
        </MenuItem>
        <MenuSeparator />
        <MenuItem danger icon={<TrashIcon />} onSelect={() => requestDeletePage(pageId)}>
          {pageMenu.delete}
        </MenuItem>
      </MenuContent>
    </Menu>
  );

}
