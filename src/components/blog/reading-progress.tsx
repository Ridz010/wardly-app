"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-linear-to-r from-brand-blue to-brand-aqua"
        />
    );
}
