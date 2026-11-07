"use client";

import { useEffect, useState, type ComponentType } from "react";

// Hand-rolled loadable used instead of next/dynamic for the lazy step
// leaves. next/dynamic goes through React.lazy + Suspense, which throttles
// the fallback->content reveal by ~300ms on first mount even when the chunk
// is already cached (measured: the info-step markdown appeared 282-291ms
// after mount despite an idle-time warm-up). A module that is warm here
// renders synchronously on first mount — pixel-identical to a static
// import; only a genuinely cold mount shows the null fallback until the
// chunk arrives.
export function createWarmLazy<P extends object>(
    load: () => Promise<{ default: ComponentType<P> }>
) {
    let Loaded: ComponentType<P> | null = null;
    let inFlight: Promise<void> | null = null;
    const ensure = () => (inFlight ??= load().then((m) => { Loaded = m.default; }));

    function WarmLazy(props: P) {
        const [, bump] = useState(0);
        useEffect(() => {
            if (!Loaded) ensure().then(() => bump((n) => n + 1));
        }, []);
        return Loaded ? <Loaded {...props} /> : null;
    }
    WarmLazy.preload = ensure;
    return WarmLazy;
}
