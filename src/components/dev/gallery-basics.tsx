"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Radio, RadioGroup, Switch } from "@/components/ui/controls";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PlusIcon } from "@/components/ui/icons";

/** Dev only (/dev/ui). Small helpers for laying out one component in every state. */
export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-7">
      <h2 className="m-0 mb-4 text-[13px] font-bold uppercase tracking-[0.06em] text-mute">{title}</h2>
      {children}
      {note ? <p className="m-0 mt-4 text-sm text-mute">{note}</p> : null}
    </section>
  );
}

export function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5">
      {children}
      <span className="text-[13px] text-mute">{label}</span>
    </div>
  );
}

const focused = "outline-[3px] outline-offset-2 outline-slate";
const grid = "grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-5 gap-y-6";

export function ButtonsSection() {
  return (
    <Section title="Buttons" note="Dashboard buttons are 10 px rounded (shape=&quot;box&quot;), website buttons are pills. Touch targets are never under 44 px; the Small size is 44 px high.">
      <div className={grid}>
        <Cell label="Primary"><Button shape="box">Primary</Button></Cell>
        <Cell label="Keyboard focus"><Button shape="box" className={focused}>Primary</Button></Cell>
        <Cell label="Disabled"><Button shape="box" disabled>Primary</Button></Cell>
        <Cell label="Loading"><Button shape="box" loading className="min-w-[150px]">Saving</Button></Cell>
        <Cell label="Secondary"><Button shape="box" variant="secondary">Secondary</Button></Cell>
        <Cell label="Keyboard focus"><Button shape="box" variant="secondary" className={focused}>Secondary</Button></Cell>
        <Cell label="Disabled"><Button shape="box" variant="secondary" disabled>Secondary</Button></Cell>
        <Cell label="Ghost: light actions"><Button shape="box" variant="ghost">Ghost</Button></Cell>
        <Cell label="Danger"><Button shape="box" variant="danger">Delete</Button></Cell>
        <Cell label="Danger, quiet"><Button shape="box" variant="danger-quiet">Delete</Button></Cell>
        <Cell label="Small"><Button shape="box" size="sm">Small</Button></Cell>
        <Cell label="Icon, 48 px"><Button shape="box" aria-label="Add" className="w-12 px-0"><PlusIcon /></Button></Cell>
        <Cell label="Website look (pill)"><Button>Pill</Button></Cell>
      </div>
    </Section>
  );
}

export function FieldsSection() {
  const [value, setValue] = useState("Filled");
  return (
    <Section title="Text fields" note="An error shows three things together: a thicker red border, an icon, and a message that says how to fix it.">
      <div className={grid}>
        <Field label="Label" htmlFor="g-a" hint="Helper text sits here.">
          <Input id="g-a" shape="box" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="Label" htmlFor="g-b" hint="Empty, showing a hint">
          <Input id="g-b" shape="box" placeholder="Empty" />
        </Field>
        <Field label="Label" htmlFor="g-c" hint="Keyboard or click focus">
          <Input id="g-c" shape="box" defaultValue="Focused" className={focused} />
        </Field>
        <Field label="Label" htmlFor="g-d" hint="Can’t be changed">
          <Input id="g-d" shape="box" defaultValue="Disabled" disabled />
        </Field>
        <Field label="Email" htmlFor="g-e" error="Please enter a valid email.">
          <Input id="g-e" shape="box" defaultValue="sarah@" invalid />
        </Field>
        <Field label="Choose one" htmlFor="g-f" hint="Dropdown">
          <Select id="g-f"><option>Dropdown</option><option>Another choice</option></Select>
        </Field>
        <Field label="Message" htmlFor="g-g" className="col-span-2">
          <Textarea id="g-g" shape="box" rows={3} defaultValue="Long text goes in a taller box." />
        </Field>
      </div>
    </Section>
  );
}

function Labeled({ children, label }: { children: ReactNode; label: string }) {
  return <label className="flex min-h-11 items-center gap-3 text-base">{children}{label}</label>;
}

export function ChoicesSection() {
  return (
    <Section title="Choices">
      <div className={grid}>
        <Labeled label="Switch, off"><Switch /></Labeled>
        <Labeled label="Switch, on"><Switch defaultChecked /></Labeled>
        <Labeled label="Switch, focus"><Switch defaultChecked className={focused} /></Labeled>
        <Labeled label="Switch, disabled"><Switch disabled /></Labeled>
        <Labeled label="Checkbox"><Checkbox /></Labeled>
        <Labeled label="Checked"><Checkbox defaultChecked /></Labeled>
        <RadioGroup defaultValue="b" className="contents">
          <Labeled label="Radio"><Radio value="a" /></Labeled>
          <Labeled label="Selected"><Radio value="b" /></Labeled>
        </RadioGroup>
      </div>
    </Section>
  );
}
