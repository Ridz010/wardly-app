'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  separator?: string;
  className?: string;
}

const CountUp = ({ to, from = 0, duration = 1.6, delay = 0, separator = '.', className = '' }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useMotionValue(from);
  const spring = useSpring(value, { damping: 20 + 40 * (1 / duration), stiffness: 100 * (1 / duration) });
  const inView = useInView(ref, { once: true, margin: '0px' });

  const format = (n: number) => Math.round(n).toLocaleString('id-ID').replace(/\./g, separator);

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(from);
  }, [from]);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => value.set(to), delay * 1000);
    return () => clearTimeout(timer);
  }, [inView, to, delay, value]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      }),
    [spring]
  );

  return <span ref={ref} className={className} />;
};

export default CountUp;
