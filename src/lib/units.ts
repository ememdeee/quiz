// Unit conversions shared by the form-step components and their
// definitions (validate/syncToProfile). One source of truth for the
// ratios that were previously inlined at ~10 call sites.

export const LBS_PER_KG = 2.20462;
export const CM_PER_INCH = 2.54;

/** Whole-pound display value (moved here from healthCalculations). */
export function kgToLbs(kg: number): number {
    return Math.round(kg * LBS_PER_KG);
}

/** 1-decimal kg value, as stored in the user profile. */
export function lbsToKg(lbs: number): number {
    return +(lbs / LBS_PER_KG).toFixed(1);
}

export function ftInToCm(feet: number, inches: number): number {
    return Math.round((feet * 12 + inches) * CM_PER_INCH);
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
    const totalInches = Math.round(cm / CM_PER_INCH);
    return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}
