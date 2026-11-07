/**
 * Shared value-comparison primitives used by both the visibility engine
 * (src/lib/visibility.ts) and the branch condition engine (src/lib/branching.ts).
 */

export function isEmptyValue(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

export function matchesEquals(value: unknown, target: string): boolean {
    if (Array.isArray(value)) {
        // Single-equals on a checkbox answer = "the only selected value is target"
        return value.length === 1 && String(value[0]) === target;
    }
    if (value === undefined || value === null) return target === '';
    return String(value) === target;
}

export function matchesContains(value: unknown, target: string): boolean {
    // Arrays (checkbox answers): does the array include target?
    // Strings: does the string contain target as a substring?
    if (Array.isArray(value)) {
        return value.some((v) => String(v) === target);
    }
    if (typeof value === 'string') {
        return value.includes(target);
    }
    return false;
}
