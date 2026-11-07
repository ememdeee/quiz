import { useEffect, useState, useRef } from 'react';

export function useInView(options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px' }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                setHasTriggered(true);
                if (ref.current) observer.unobserve(ref.current); // Trigger once
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options.threshold, options.rootMargin]);

    return { ref, isInView, hasTriggered };
}
