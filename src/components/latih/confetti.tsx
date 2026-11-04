"use client";

import { motion, useReducedMotion } from "motion/react";

const COLORS = ["#158ab0", "#5df2e7", "#78dcb8", "#2fb6c9", "#fbbf24", "#f472b6"];

// Pseudo-acak deterministik agar render tetap murni.
const noise = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
};

const PIECES = Array.from({ length: 44 }, (_, index) => ({
    id: index,
    x: (noise(index + 1) - 0.5) * 520,
    y: -120 - noise(index + 7) * 220,
    fall: 260 + noise(index + 13) * 220,
    rotate: (noise(index + 21) - 0.5) * 720,
    size: 6 + noise(index + 31) * 6,
    delay: noise(index + 41) * 0.25,
    color: COLORS[index % COLORS.length],
    round: index % 3 === 0,
}));

export function Confetti() {
    const reduced = useReducedMotion();
    if (reduced) return null;

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
            {PIECES.map((piece) => (
                <motion.span
                    key={piece.id}
                    className="absolute block"
                    style={{
                        width: piece.size,
                        height: piece.round ? piece.size : piece.size * 1.8,
                        borderRadius: piece.round ? 999 : 2,
                        backgroundColor: piece.color,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
                    animate={{
                        x: piece.x,
                        y: [0, piece.y, piece.y + piece.fall],
                        opacity: [1, 1, 0],
                        rotate: piece.rotate,
                        scale: 1,
                    }}
                    transition={{ duration: 1.9, delay: piece.delay, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 1] }}
                />
            ))}
        </div>
    );
}
