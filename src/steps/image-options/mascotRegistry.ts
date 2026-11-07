// Registry of available mascot variants.
// Each entry maps to [basePath]/[id]-body.png and [basePath]/[id]-shirt-mask.png
// To add a new variant: extract the PNGs into the right folder, then add an entry here.

export interface MascotVariant {
    id: string;
    label: string;
    /** Folder under /public where the PNGs live. Defaults to '/mascot'. */
    basePath?: string;
}

export const MASCOT_VARIANTS: MascotVariant[] = [
    // Age variants
    { id: 'vector-maya-18-24',  label: 'Maya · Age 18–24',  basePath: '/mascot/vector' },
    { id: 'vector-maya-25-34',  label: 'Maya · Age 25–34',  basePath: '/mascot/vector' },
    { id: 'vector-maya-35-44',  label: 'Maya · Age 35–44',  basePath: '/mascot/vector' },
    { id: 'vector-maya-45plus', label: 'Maya · Age 45+',    basePath: '/mascot/vector' },
    // Body type variants
    { id: 'vector-maya-body-slim',      label: 'Maya · Slim',       basePath: '/mascot/vector' },
    { id: 'vector-maya-body-thin',      label: 'Maya · Thin',       basePath: '/mascot/vector' },
    { id: 'vector-maya-body-fit',       label: 'Maya · Fit',        basePath: '/mascot/vector' },
    { id: 'vector-maya-body-average',   label: 'Maya · Average',    basePath: '/mascot/vector' },
    { id: 'vector-maya-body-hourglass', label: 'Maya · Hourglass',  basePath: '/mascot/vector' },
    { id: 'vector-maya-body-mid-sized', label: 'Maya · Mid-sized',  basePath: '/mascot/vector' },
    { id: 'vector-maya-body-curvy',     label: 'Maya · Curvy',      basePath: '/mascot/vector' },
    { id: 'vector-maya-body-plus-sized',label: 'Maya · Plus-sized', basePath: '/mascot/vector' },
];

export const MASCOT_SELECT_OPTIONS = [
    { value: '', label: 'Image URL' },
    ...MASCOT_VARIANTS.map((v) => ({ value: v.id, label: `Mascot: ${v.label}` })),
];

/** Returns the body/mask base URL for a given variant id. */
export function getMascotBasePath(variantId: string): string {
    return MASCOT_VARIANTS.find((v) => v.id === variantId)?.basePath ?? '/mascot';
}
