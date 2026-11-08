"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DotsIcon, InfoIcon, LockIcon, PencilIcon, PlusIcon, TrashIcon, CopyIcon } from "@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SaveStatus } from "@/components/ui/save-status";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOAST_SECONDS, useToast } from "@/components/ui/toast";
import { Section } from "./gallery-basics";

/** Dev only (/dev/ui): menus, dialogs, messages, labels, navigation and data. Everything here is live. */
export function FeedbackSections() {
  const { show } = useToast();
  const [dialog, setDialog] = useState(false);
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Menu" note="Arrow keys move through the items, Escape closes. Danger items sit last, after a divider.">
          <Menu>
            <MenuTrigger asChild>
              <Button shape="box" variant="secondary" aria-label="Open the example menu"><DotsIcon /></Button>
            </MenuTrigger>
            <MenuContent align="start">
              <MenuItem icon={<PencilIcon />}>Rename</MenuItem>
              <MenuItem icon={<CopyIcon />}>Duplicate</MenuItem>
              <MenuItem icon={<LockIcon />}>Close the quiz</MenuItem>
              <MenuSeparator />
              <MenuItem danger icon={<TrashIcon />}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </Section>
        <Section title="Dialog" note="Focus moves into the dialog and returns when it closes. The safe choice is on the left.">
          <Button shape="box" variant="secondary" onClick={() => setDialog(true)}>Open the example dialog</Button>
          <Dialog
            open={dialog}
            onOpenChange={setDialog}
            title="Delete this quiz?"
            description="This also deletes its responses. You can’t undo this."
            actions={
              <>
                <Button shape="box" size="sm" variant="secondary" onClick={() => setDialog(false)}>Keep it</Button>
                <Button shape="box" size="sm" variant="danger" onClick={() => setDialog(false)}>Delete quiz</Button>
              </>
            }
          />
        </Section>
      </div>

      <Section title="Banners and toasts" note={`Errors stay until fixed. Confirmations fade after ${TOAST_SECONDS.confirm} seconds. Toasts that can be undone stay for ${TOAST_SECONDS.undo}.`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Banner icon={<InfoIcon />}><strong>Info.</strong> Your quiz has changes that aren’t published yet.</Banner>
          <Banner icon={<InfoIcon />}><strong>Done.</strong> Your quiz is live.</Banner>
          <Banner tone="error"><strong>Error.</strong> We couldn’t save. Try again.</Banner>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button shape="box" size="sm" variant="secondary" onClick={() => show({ message: "Link copied" })}>Show a confirmation</Button>
          <Button shape="box" size="sm" variant="secondary" onClick={() => show({ message: "Page deleted", action: { label: "Undo", onSelect: () => undefined }, seconds: TOAST_SECONDS.undo })}>Show a toast with Undo</Button>
          <Button shape="box" size="sm" variant="secondary" onClick={() => show({ message: "Your last change wasn’t saved. Check your connection and try again.", tone: "error", action: { label: "Try again", onSelect: () => undefined } })}>Show an error toast</Button>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Labels">
          <div className="flex flex-wrap gap-2.5">
            <Pill tone="solid">Open</Pill>
            <Pill>Closed</Pill>
            <Pill tone="outline">Not published</Pill>
            <Pill tone="solid">Custom plan</Pill>
            <Pill tone="soft">Verified</Pill>
            <Pill>Left at page 5</Pill>
          </div>
        </Section>
        <Section title="Empty and loading">
          <div className="flex items-stretch gap-5">
            <EmptyState className="flex-1 px-5 py-6" icon={<PlusIcon size={26} />} title="No quizzes yet" action={<Button shape="box" size="sm">New quiz</Button>}>Create your first one.</EmptyState>
            <div className="flex flex-1 flex-col justify-center gap-2.5" role="status" aria-label="Loading">
              <Skeleton className="h-[18px] w-[70%]" />
              <Skeleton className="h-3.5" />
              <Skeleton className="h-3.5 w-[85%]" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Tabs" note="Selected: white. Used for Edit / Responses and Summary / Individual.">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="pt-3 text-sm text-mute">Edit tab</TabsContent>
            <TabsContent value="responses" className="pt-3 text-sm text-mute">Responses tab</TabsContent>
            <TabsContent value="summary" className="pt-3 text-sm text-mute">Summary tab</TabsContent>
          </Tabs>
        </Section>
        <Section title="Progress and usage" note="The value is always written next to the bar, so color is never the only signal.">
          <div className="flex flex-col gap-3.5">
            <ProgressBar value={55} max={100} label="Example" size="sm" />
            <ProgressBar value={3} max={5} label="Quizzes used" />
            <ProgressBar value={12} max={15} label="Pages used" />
          </div>
        </Section>
      </div>

      <Section title="Table" note="Tables scroll sideways on narrow windows. A row never wraps onto two lines.">
        <Table>
          <TableHead>
            <TableRow><TableHeadCell>Date</TableHeadCell><TableHeadCell>Main goal</TableHeadCell><TableHeadCell>Age</TableHeadCell></TableRow>
          </TableHead>
          <TableBody>
            <TableRow><TableCell>Nov 6, 10:42</TableCell><TableCell>Lose weight</TableCell><TableCell>46</TableCell></TableRow>
            <TableRow><TableCell>Nov 6, 09:15</TableCell><TableCell>Have more energy</TableCell><TableCell>52</TableCell></TableRow>
            <TableRow><TableCell>Nov 5, 21:03</TableCell><TableCell>Tone my body</TableCell><TableCell>44</TableCell></TableRow>
          </TableBody>
        </Table>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Cards" note="Cards lift a little on hover.">
          <div className="flex gap-4">
            <Card className="flex-1 rounded-2xl p-5 [--lift:4px]"><Pill tone="solid">Open</Pill><div className="my-3.5 text-xl font-bold">Body Reset</div><Button shape="box" size="sm">Edit</Button></Card>
            <Card className="flex-1 rounded-2xl p-5 [--lift:4px]"><Pill>Closed</Pill><div className="my-3.5 text-xl font-bold">Hover me</div><Button shape="box" size="sm">Edit</Button></Card>
          </div>
        </Section>
        <Section title="Save status (the editor header)">
          <div className="flex flex-col gap-2.5">
            <SaveStatus state="saving" />
            <SaveStatus state="saved" />
            <SaveStatus state="error" onRetry={() => undefined} />
          </div>
        </Section>
      </div>
    </>
  );
}
