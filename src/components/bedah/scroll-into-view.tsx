"use client";

import { useEffect, useRef } from "react";

export function ScrollIntoView() {
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);
    return <span ref={ref} className="-mt-24 block pt-24" aria-hidden="true" />;
}
