'use client';

import { useRef, type CSSProperties, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  spotlightColor?: string;
  spotlightSize?: number;
}

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(21, 138, 176, 0.18)',
  spotlightSize = 360,
  style,
  onPointerMove,
  ...rest
}: SpotlightCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      node.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  };

  const vars = {
    '--spot-color': spotlightColor,
    '--spot-size': `${spotlightSize}px`,
    ...style
  } as CSSProperties;

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      style={vars}
      className={`group/spot relative overflow-hidden ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 motion-reduce:hidden"
        style={{
          background:
            'radial-gradient(var(--spot-size) circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color), transparent 70%)'
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

export default SpotlightCard;
