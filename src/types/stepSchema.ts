// Declarative editor schema for quiz steps.
// A step's index.ts can declare `schema: SchemaField[]` instead of writing a hand-coded React editor.
// The PropertyEditor renders the schema via SchemaEditor.

interface BaseField {
    /** Path into the step's content. Supports dot paths for nested objects, e.g. "validation.min". */
    id: string;
    label: string;
    /** Optional hint text rendered below the input. */
    info?: string;
    /** When provided, the field is only rendered if this returns true. Receives the full content object. */
    visibleWhen?: (content: Record<string, unknown>) => boolean;
}

export interface TextField extends BaseField {
    type: 'text';
    placeholder?: string;
    default?: string;
}

export interface TextareaField extends BaseField {
    type: 'textarea';
    placeholder?: string;
    rows?: number;
    default?: string;
    /** Code-style hints rendered as small chips beneath the textarea. */
    hints?: { syntax: string; description: string }[];
}

export interface NumberField extends BaseField {
    type: 'number';
    placeholder?: string;
    min?: number;
    max?: number;
    default?: number;
    /** When set, displayed value = stored / scale, stored = displayed * scale. e.g. ms↔seconds via scale: 1000. */
    scale?: number;
    /** Optional unit caption (e.g. "seconds") shown next to the input. */
    unit?: string;
    /** Render width — narrow inputs (~8rem) for short numeric fields. Default: 'narrow'. */
    width?: 'narrow' | 'full';
}

export interface SelectField extends BaseField {
    type: 'select';
    options: { value: string; label: string }[];
    default?: string;
}

export interface CheckboxField extends BaseField {
    type: 'checkbox';
    default?: boolean;
}

export interface ImageField extends BaseField {
    type: 'image';
    placeholder?: string;
    default?: string;
}

export interface IconField extends BaseField {
    type: 'icon';
    default?: string;
}

export interface AlignmentField extends BaseField {
    type: 'alignment';
    default?: 'left' | 'center' | 'right';
}

export interface HeaderField {
    type: 'header';
    label: string;
    info?: string;
}

export interface DividerField {
    type: 'divider';
}

export interface InfoField {
    type: 'info';
    text: string;
}

export interface GroupField {
    type: 'group';
    columns?: 2 | 3 | 4;
    fields: SchemaField[];
}

/**
 * A min/max range field. Reads and writes a `{min, max}` object at the given path.
 * Renders as a paired pair of number inputs under one label.
 */
export interface RangeField extends BaseField {
    type: 'range';
    minLabel?: string;
    maxLabel?: string;
    minPlaceholder?: string;
    maxPlaceholder?: string;
    /** Unit caption shown next to each input (e.g. "kg", "yrs"). */
    unit?: string;
}

export interface RepeaterField extends BaseField {
    type: 'repeater';
    /** Schema describing each item's editable fields. Field ids are local to the item. */
    itemFields: SchemaField[];
    /** Factory for new items. Called when user clicks "Add". */
    newItem: (existingCount: number) => Record<string, unknown>;
    /** Property used as the React/dnd key. Each item must produce a unique value here. */
    itemKey: string;
    /** Optional label rendered in the item header. Receives the item and its index. */
    itemLabel?: (item: Record<string, unknown>, index: number) => string;
    addLabel?: string;
    sortable?: boolean;
    emptyMessage?: string;
}

export type SchemaField =
    | TextField
    | TextareaField
    | NumberField
    | SelectField
    | CheckboxField
    | ImageField
    | IconField
    | AlignmentField
    | HeaderField
    | DividerField
    | InfoField
    | GroupField
    | RangeField
    | RepeaterField;

/** Read a value from a content object using a dot-path id (e.g. "validation.min"). */
export function getByPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/** Write a value into a content object using a dot-path id; returns a new object (immutable). */
export function setByPath(
    obj: Record<string, unknown>,
    path: string,
    value: unknown,
): Record<string, unknown> {
    const keys = path.split('.');
    if (keys.length === 1) {
        return { ...obj, [keys[0]]: value };
    }
    const [head, ...rest] = keys;
    const child = (obj[head] && typeof obj[head] === 'object'
        ? obj[head]
        : {}) as Record<string, unknown>;
    return { ...obj, [head]: setByPath(child, rest.join('.'), value) };
}
