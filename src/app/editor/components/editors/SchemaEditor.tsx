"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
    type SchemaField,
    type TextField,
    type TextareaField,
    type NumberField,
    type SelectField,
    type CheckboxField,
    type ImageField,
    type IconField,
    type AlignmentField,
    type HeaderField,
    type InfoField,
    type GroupField,
    type RangeField,
    type RepeaterField,
    getByPath,
    setByPath,
} from "@/types/stepSchema";
import { ICON_OPTIONS } from "./iconOptions";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

interface SchemaEditorProps {
    schema: SchemaField[];
    content: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
}

export function SchemaEditor({ schema, content, onChange }: SchemaEditorProps) {
    return (
        <div className="space-y-6">
            {schema.map((field, idx) => (
                <FieldRenderer
                    key={fieldKey(field, idx)}
                    field={field}
                    content={content}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}

function fieldKey(field: SchemaField, idx: number): string {
    if ("id" in field) return field.id;
    return `${field.type}-${idx}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field dispatcher
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
    field: SchemaField;
    content: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
}

function FieldRenderer({ field, content, onChange }: FieldProps) {
    if ("visibleWhen" in field && field.visibleWhen && !field.visibleWhen(content)) {
        return null;
    }

    switch (field.type) {
        case "header":
            return <HeaderRow field={field} />;
        case "divider":
            return <div className="h-px bg-dashboard-border-dark w-full" />;
        case "info":
            return <InfoRow field={field} />;
        case "group":
            return <GroupRow field={field} content={content} onChange={onChange} />;
        case "text":
            return <TextRow field={field} content={content} onChange={onChange} />;
        case "textarea":
            return <TextareaRow field={field} content={content} onChange={onChange} />;
        case "number":
            return <NumberRow field={field} content={content} onChange={onChange} />;
        case "select":
            return <SelectRow field={field} content={content} onChange={onChange} />;
        case "checkbox":
            return <CheckboxRow field={field} content={content} onChange={onChange} />;
        case "image":
            return <ImageRow field={field} content={content} onChange={onChange} />;
        case "icon":
            return <IconRow field={field} content={content} onChange={onChange} />;
        case "alignment":
            return <AlignmentRow field={field} content={content} onChange={onChange} />;
        case "range":
            return <RangeRow field={field} content={content} onChange={onChange} />;
        case "repeater":
            return <RepeaterRow field={field} content={content} onChange={onChange} />;
        default: {
            const _exhaustive: never = field;
            return _exhaustive;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual-only fields
// ─────────────────────────────────────────────────────────────────────────────

function HeaderRow({ field }: { field: HeaderField }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {field.label}
            </label>
            {field.info && <p className="text-xs text-slate-500 mt-1">{field.info}</p>}
        </div>
    );
}

function InfoRow({ field }: { field: InfoField }) {
    return (
        <div className="p-3 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg">
            <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-500 mt-0.5">info</span>
                <p className="text-xs text-slate-400 leading-relaxed">{field.text}</p>
            </div>
        </div>
    );
}

function GroupRow({ field, content, onChange }: { field: GroupField } & Pick<FieldProps, "content" | "onChange">) {
    const cols = field.columns ?? 2;
    const colsClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";
    return (
        <div className={`grid ${colsClass} gap-4`}>
            {field.fields.map((child, idx) => (
                <FieldRenderer
                    key={fieldKey(child, idx)}
                    field={child}
                    content={content}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitive value fields
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
    return (
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {label}
        </label>
    );
}

function FieldHint({ info }: { info?: string }) {
    if (!info) return null;
    return <p className="text-xs text-slate-500 mt-1.5">{info}</p>;
}

const INPUT_BASE =
    "w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:border-dashboard-primary placeholder-slate-600 focus:outline-none";

function TextRow({ field, content, onChange }: { field: TextField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | undefined) ?? field.default ?? "";
    return (
        <div>
            <FieldLabel label={field.label} />
            <input
                className={INPUT_BASE}
                type="text"
                value={value}
                onChange={(e) => onChange(setByPath(content, field.id, e.target.value))}
                placeholder={field.placeholder}
            />
            <FieldHint info={field.info} />
        </div>
    );
}

function TextareaRow({ field, content, onChange }: { field: TextareaField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | undefined) ?? field.default ?? "";
    return (
        <div>
            <FieldLabel label={field.label} />
            <textarea
                className={`${INPUT_BASE} resize-none font-mono`}
                rows={field.rows ?? 4}
                value={value}
                onChange={(e) => onChange(setByPath(content, field.id, e.target.value))}
                placeholder={field.placeholder}
            />
            {field.hints && field.hints.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                    {field.hints.map((h, i) => (
                        <span key={i}>
                            <code className="bg-slate-700/50 px-1 rounded">{h.syntax}</code> {h.description}
                        </span>
                    ))}
                </div>
            )}
            <FieldHint info={field.info} />
        </div>
    );
}

function NumberRow({ field, content, onChange }: { field: NumberField } & Pick<FieldProps, "content" | "onChange">) {
    const stored = getByPath(content, field.id) as number | undefined;
    const display =
        stored === undefined
            ? field.default !== undefined
                ? field.scale
                    ? Math.floor(field.default / field.scale)
                    : field.default
                : ""
            : field.scale
                ? Math.floor(stored / field.scale)
                : stored;

    const widthClass = field.width === "full" ? "w-full" : "w-32";

    return (
        <div>
            <FieldLabel label={field.label} />
            <div className="flex items-center gap-2">
                <input
                    className={`${widthClass} bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none`}
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={display}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                            onChange(setByPath(content, field.id, undefined));
                            return;
                        }
                        const parsed = parseInt(raw, 10);
                        if (Number.isNaN(parsed)) return;
                        const toStore = field.scale ? parsed * field.scale : parsed;
                        onChange(setByPath(content, field.id, toStore));
                    }}
                />
                {field.unit && <span className="text-xs text-slate-500">{field.unit}</span>}
            </div>
            <FieldHint info={field.info} />
        </div>
    );
}

function SelectRow({ field, content, onChange }: { field: SelectField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | undefined) ?? field.default ?? "";
    return (
        <div>
            <FieldLabel label={field.label} />
            <div className="relative">
                <select
                    className={`${INPUT_BASE} appearance-none cursor-pointer pr-9`}
                    value={value}
                    onChange={(e) => onChange(setByPath(content, field.id, e.target.value))}
                >
                    {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="absolute right-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px] pointer-events-none">
                    expand_more
                </span>
            </div>
            <FieldHint info={field.info} />
        </div>
    );
}

function CheckboxRow({ field, content, onChange }: { field: CheckboxField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as boolean | undefined) ?? field.default ?? false;
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-dashboard-surface-dark border border-dashboard-border-dark">
            <div>
                <span className="text-sm font-medium text-white">{field.label}</span>
                {field.info && <p className="text-xs text-slate-500 mt-0.5">{field.info}</p>}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    checked={value}
                    onChange={(e) => onChange(setByPath(content, field.id, e.target.checked))}
                    className="sr-only peer"
                    type="checkbox"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dashboard-primary"></div>
            </label>
        </div>
    );
}

function ImageRow({ field, content, onChange }: { field: ImageField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | null | undefined) ?? field.default ?? "";
    return (
        <div>
            <FieldLabel label={field.label} />
            <input
                className={INPUT_BASE}
                type="text"
                value={value || ""}
                onChange={(e) => onChange(setByPath(content, field.id, e.target.value || null))}
                placeholder={field.placeholder ?? "https://example.com/image.jpg"}
            />
            <FieldHint info={field.info} />
            {value && (
                <div className="mt-3 p-3 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark">
                    <p className="text-xs text-slate-500 mb-2">Preview:</p>
                    <img
                        src={value}
                        alt="Preview"
                        className="h-20 w-auto object-contain rounded"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                        }}
                    />
                </div>
            )}
        </div>
    );
}

function IconRow({ field, content, onChange }: { field: IconField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | undefined) ?? field.default ?? "";
    const [open, setOpen] = useState(false);
    return (
        <div>
            <FieldLabel label={field.label} />
            <div className="relative">
                <button
                    onClick={() => setOpen((o) => !o)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${value
                            ? "border-dashboard-primary/50 bg-dashboard-primary/10 text-dashboard-primary"
                            : "border-dashboard-border-dark bg-dashboard-surface-dark text-slate-500 hover:text-slate-300 hover:border-slate-500"
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">{value || "add_circle"}</span>
                    <span className="text-sm">{value || "Select icon"}</span>
                </button>
                {open && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                        <div className="absolute left-0 top-full mt-1 z-40 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl p-2 w-[280px]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1.5">
                                Select Icon
                            </p>
                            <div className="grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto">
                                {ICON_OPTIONS.map((iconName) => (
                                    <button
                                        key={iconName || "__none"}
                                        onClick={() => {
                                            onChange(setByPath(content, field.id, iconName || undefined));
                                            setOpen(false);
                                        }}
                                        className={`flex items-center justify-center w-[38px] h-[38px] rounded-lg transition-colors cursor-pointer ${value === iconName
                                                ? "bg-dashboard-primary/20 text-dashboard-primary border border-dashboard-primary/40"
                                                : "hover:bg-dashboard-border-dark text-slate-400 hover:text-white border border-transparent"
                                            }`}
                                        title={iconName || "No icon"}
                                    >
                                        {iconName ? (
                                            <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[16px] text-slate-600">block</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <FieldHint info={field.info} />
        </div>
    );
}

const ALIGN_OPTIONS = [
    { value: "left", icon: "format_align_left", label: "Left" },
    { value: "center", icon: "format_align_center", label: "Center" },
    { value: "right", icon: "format_align_right", label: "Right" },
];

function AlignmentRow({ field, content, onChange }: { field: AlignmentField } & Pick<FieldProps, "content" | "onChange">) {
    const value = (getByPath(content, field.id) as string | undefined) ?? field.default ?? "center";
    return (
        <div>
            <FieldLabel label={field.label} />
            <div className="flex gap-1 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg p-1">
                {ALIGN_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(setByPath(content, field.id, opt.value))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${value === opt.value
                                ? "bg-dashboard-primary/20 text-dashboard-primary border border-dashboard-primary/30"
                                : "text-slate-500 hover:text-slate-300 border border-transparent"
                            }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                        <span>{opt.label}</span>
                    </button>
                ))}
            </div>
            <FieldHint info={field.info} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Range (min/max paired number inputs)
// ─────────────────────────────────────────────────────────────────────────────

function RangeRow({ field, content, onChange }: { field: RangeField } & Pick<FieldProps, "content" | "onChange">) {
    const obj = (getByPath(content, field.id) as { min?: number; max?: number } | undefined) ?? {};
    const update = (key: "min" | "max", raw: string) => {
        const next = { ...obj };
        if (raw === "") {
            delete next[key];
        } else {
            const parsed = parseInt(raw, 10);
            if (Number.isNaN(parsed)) return;
            next[key] = parsed;
        }
        onChange(setByPath(content, field.id, next));
    };

    const inputCls =
        "w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none";

    return (
        <div>
            <FieldLabel label={field.label} />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                        {field.minLabel ?? "Minimum"}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            className={inputCls}
                            type="number"
                            value={obj.min ?? ""}
                            placeholder={field.minPlaceholder}
                            onChange={(e) => update("min", e.target.value)}
                        />
                        {field.unit && <span className="text-xs text-slate-500">{field.unit}</span>}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                        {field.maxLabel ?? "Maximum"}
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            className={inputCls}
                            type="number"
                            value={obj.max ?? ""}
                            placeholder={field.maxPlaceholder}
                            onChange={(e) => update("max", e.target.value)}
                        />
                        {field.unit && <span className="text-xs text-slate-500">{field.unit}</span>}
                    </div>
                </div>
            </div>
            <FieldHint info={field.info} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Repeater
// ─────────────────────────────────────────────────────────────────────────────

function RepeaterRow({ field, content, onChange }: { field: RepeaterField } & Pick<FieldProps, "content" | "onChange">) {
    const items = ((getByPath(content, field.id) as Record<string, unknown>[] | undefined) ?? []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const update = (next: Record<string, unknown>[]) => {
        onChange(setByPath(content, field.id, next));
    };

    const handleAdd = () => {
        update([...items, field.newItem(items.length)]);
    };

    const handleRemove = (idx: number) => {
        update(items.filter((_, i) => i !== idx));
    };

    const handleItemChange = (idx: number, nextItem: Record<string, unknown>) => {
        const next = items.map((it, i) => (i === idx ? nextItem : it));
        update(next);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((it) => String(it[field.itemKey]) === String(active.id));
        const newIndex = items.findIndex((it) => String(it[field.itemKey]) === String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;
        update(arrayMove(items, oldIndex, newIndex));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {field.label}
                </label>
                <button
                    onClick={handleAdd}
                    className="text-xs text-dashboard-primary font-medium hover:text-dashboard-primary/80 flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    {field.addLabel ?? "Add"}
                </button>
            </div>

            {field.sortable !== false && items.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={items.map((it) => String(it[field.itemKey] ?? ""))}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <SortableRepeaterItem
                                    key={String(item[field.itemKey] ?? idx)}
                                    id={String(item[field.itemKey] ?? idx)}
                                    field={field}
                                    item={item}
                                    index={idx}
                                    onItemChange={(next) => handleItemChange(idx, next)}
                                    onRemove={() => handleRemove(idx)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <RepeaterItem
                            key={String(item[field.itemKey] ?? idx)}
                            field={field}
                            item={item}
                            index={idx}
                            sortable={false}
                            onItemChange={(next) => handleItemChange(idx, next)}
                            onRemove={() => handleRemove(idx)}
                        />
                    ))}
                </div>
            )}

            {items.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                    {field.emptyMessage ?? `No items yet. Click "${field.addLabel ?? "Add"}" to create one.`}
                </div>
            )}
        </div>
    );
}

interface RepeaterItemProps {
    field: RepeaterField;
    item: Record<string, unknown>;
    index: number;
    sortable: boolean;
    sortableProps?: {
        setNodeRef: (el: HTMLElement | null) => void;
        listeners?: SyntheticListenerMap;
        attributes?: DraggableAttributes;
        style?: React.CSSProperties;
    };
    onItemChange: (next: Record<string, unknown>) => void;
    onRemove: () => void;
}

function RepeaterItem({
    field,
    item,
    index,
    sortable,
    sortableProps,
    onItemChange,
    onRemove,
}: RepeaterItemProps) {
    const headerLabel = field.itemLabel ? field.itemLabel(item, index) : `Item ${index + 1}`;

    return (
        <div
            ref={sortableProps?.setNodeRef}
            style={sortableProps?.style}
            className="bg-dashboard-surface-dark p-4 rounded-lg border border-dashboard-border-dark group hover:border-dashboard-primary/50 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    {sortable && sortableProps && (
                        <span
                            {...sortableProps.attributes}
                            {...sortableProps.listeners}
                            className="material-symbols-outlined text-slate-600 cursor-grab active:cursor-grabbing text-[18px] hover:text-white shrink-0"
                        >
                            drag_handle
                        </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400 truncate">{headerLabel}</span>
                </div>
                <button
                    onClick={onRemove}
                    className="text-slate-500 hover:text-red-400 p-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
            <SchemaEditor schema={field.itemFields} content={item} onChange={onItemChange} />
        </div>
    );
}

function SortableRepeaterItem({
    id,
    field,
    item,
    index,
    onItemChange,
    onRemove,
}: {
    id: string;
    field: RepeaterField;
    item: Record<string, unknown>;
    index: number;
    onItemChange: (next: Record<string, unknown>) => void;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <RepeaterItem
            field={field}
            item={item}
            index={index}
            sortable
            sortableProps={{ setNodeRef, listeners, attributes, style }}
            onItemChange={onItemChange}
            onRemove={onRemove}
        />
    );
}
