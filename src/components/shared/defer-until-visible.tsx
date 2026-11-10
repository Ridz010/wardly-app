"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
    rootMargin?: string;
};

/**
 * Mounts children only when the wrapper nears the viewport. Render a
 * `next/dynamic` component inside it so its code is fetched at that point too.
 */
export function DeferUntilVisible({ children, className, rootMargin = "300px" }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setVisible(true);
                observer.disconnect();
            },
            { rootMargin },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [rootMargin]);

    return (
        <div ref={ref} className={className}>
            {visible ? children : null}
        </div>
    );
}
