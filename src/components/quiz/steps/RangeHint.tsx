"use client";

import React from "react";

// The fading min/max hint under the big number inputs. Always rendered (it
// reserves its line height); `show` flips it red+visible. Classes verbatim
// from the original inline <p> used by weight (x2), height, and age.
export function RangeHint({ show, children }: { show: boolean; children: React.ReactNode }) {
    return (
        <p className={`text-center text-sm transition-opacity duration-300 ${show ? 'text-red-400 opacity-100' : 'text-slate-400 dark:text-slate-500 opacity-0'}`}>
            {children}
        </p>
    );
}
