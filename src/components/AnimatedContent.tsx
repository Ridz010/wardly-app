'use client';

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';
export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart'> {
  children?: ReactNode;
  container?: Element | string | null;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  /** GSAP-style name (`power3.out`) or any CSS easing string. */
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  blur?: number;
  rotate?: number;
  tilt?: number;
  wipe?: AnimatedContentWipe;
  threshold?: number;
  delay?: number;
  stagger?: number;
  staggerFrom?: AnimatedContentStaggerFrom;
  trigger?: 'scroll' | 'mount';
  once?: boolean;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const WIPES: Record<string, string> = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

// GSAP ease names mapped to CSS cubic-beziers, so existing props keep their feel.
const EASES: Record<string, string> = {
  none: 'linear',
  linear: 'linear',
  'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'power1.in': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'power1.inOut': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  'power2.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'power2.in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'power2.inOut': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'power3.out': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'power3.in': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'power3.inOut': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'power4.out': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'power4.in': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  'power4.inOut': 'cubic-bezier(0.86, 0, 0.07, 1)',
  'expo.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'back.out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'sine.out': 'cubic-bezier(0.39, 0.575, 0.565, 1)'
};

const toEasing = (ease: string) =>
  EASES[ease] ?? (/^(cubic-bezier|linear|ease|steps)/.test(ease) ? ease : EASES['power3.out']);

const staggerIndex = (index: number, count: number, from: AnimatedContentStaggerFrom) => {
  const mid = (count - 1) / 2;
  if (from === 'end') return count - 1 - index;
  if (from === 'center') return Math.abs(index - mid);
  if (from === 'edges') return mid - Math.abs(index - mid);
  if (from === 'random') return Math.random() * (count - 1);
  return index;
};

let wipeRegistered = false;
const registerWipe = () => {
  if (wipeRegistered) return;
  wipeRegistered = true;
  try {
    CSS.registerProperty({ name: '--ac-wipe', syntax: '<number>', inherits: false, initialValue: '1' });
  } catch {
    // Already registered, or unsupported: the wipe then simply snaps open.
  }
};

/**
 * Scroll-reveal wrapper. Runs on the Web Animations API, so it never reads
 * computed styles or layout during hydration (the old GSAP version did, for
 * every instance on the page).
 */
const AnimatedContent = ({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
  ...props
}: AnimatedContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });
  useIsomorphicLayoutEffect(() => {
    callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };
  });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reveal = () => {
      el.style.visibility = 'visible';
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduce || typeof el.animate !== 'function') {
      reveal();
      callbacksRef.current.onComplete?.();
      return undefined;
    }

    let scroller: Element | string | null = container || document.getElementById('snap-main-container') || null;
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);

    const targets = (stagger > 0 && el.children.length ? Array.from(el.children) : [el]) as HTMLElement[];
    const horizontal = direction === 'horizontal';
    const sign = reverse ? -1 : 1;
    const mask = WIPES[wipe];

    // Same transform function list on both ends keeps the interpolation smooth.
    const transform = (offset: number, scaleTo: number, rotation: number, lean: number) => {
      const parts = [
        tilt ? 'perspective(900px)' : '',
        horizontal ? `translateX(${offset}px)` : `translateY(${offset}px)`,
        `scale(${scaleTo})`,
        rotate ? `rotate(${rotation}deg)` : '',
        tilt ? (horizontal ? `rotateY(${lean}deg)` : `rotateX(${lean}deg)`) : ''
      ];
      return parts.filter(Boolean).join(' ');
    };

    const lean = horizontal ? -tilt * sign : tilt * sign;
    const from: Keyframe = {
      transform: transform(distance * sign, scale, rotate * sign, lean),
      opacity: animateOpacity ? initialOpacity : 1
    };
    const to: Keyframe = { transform: transform(0, 1, 0, 0), opacity: 1 };
    if (blur > 0) {
      from.filter = `blur(${blur}px)`;
      to.filter = 'blur(0px)';
    }
    if (mask) {
      registerWipe();
      from['--ac-wipe'] = 0;
      to['--ac-wipe'] = 1;
      targets.forEach(target => {
        target.style.maskImage = mask;
        target.style.setProperty('-webkit-mask-image', mask);
      });
    }

    const clearMask = () => {
      if (!mask) return;
      targets.forEach(target => {
        target.style.maskImage = '';
        target.style.removeProperty('-webkit-mask-image');
      });
    };

    const easing = toEasing(ease);
    // Created paused with fill "both": targets sit in the start pose until revealed.
    const animations = targets.map((target, index) => {
      const offset = stagger > 0 ? staggerIndex(index, targets.length, staggerFrom) * stagger : 0;
      const animation = target.animate([from, to], {
        duration: duration * 1000,
        delay: (Math.max(delay, 0) + offset) * 1000,
        easing,
        fill: 'both'
      });
      animation.pause();
      return animation;
    });
    reveal();

    let disposed = false;
    const extras: Animation[] = [];

    const disappear = () => {
      if (disappearAfter <= 0) return;
      const out: Keyframe = {
        transform: transform(-distance * sign, 0.8, 0, 0),
        opacity: animateOpacity ? initialOpacity : 0
      };
      if (blur > 0) out.filter = `blur(${blur}px)`;
      const fades = targets.map((target, index) => {
        const offset = stagger > 0 ? staggerIndex(index, targets.length, staggerFrom) * stagger : 0;
        return target.animate([{ transform: transform(0, 1, 0, 0), opacity: 1 }, out], {
          duration: disappearDuration * 1000,
          delay: (disappearAfter + offset) * 1000,
          easing: toEasing(disappearEase),
          fill: 'forwards'
        });
      });
      extras.push(...fades);
      Promise.all(fades.map(fade => fade.finished))
        .then(() => {
          if (!disposed) callbacksRef.current.onDisappearanceComplete?.();
        })
        .catch(() => {});
    };

    let started = false;
    const play = () => {
      if (!started) {
        started = true;
        callbacksRef.current.onStart?.();
        Promise.all(animations.map(animation => animation.finished))
          .then(() => {
            if (disposed) return;
            callbacksRef.current.onComplete?.();
            if (once) {
              // The end pose equals the element's own styles, so drop the effects entirely.
              animations.forEach(animation => animation.cancel());
              clearMask();
              disappear();
            }
          })
          .catch(() => {});
      }
      animations.forEach(animation => {
        animation.playbackRate = 1;
        animation.play();
      });
    };

    if (trigger === 'mount') {
      play();
      return () => {
        disposed = true;
        animations.forEach(animation => animation.cancel());
        extras.forEach(animation => animation.cancel());
        clearMask();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          if (once) observer.disconnect();
        } else if (!once && started && entry.boundingClientRect.top > 0) {
          animations.forEach(animation => {
            animation.playbackRate = -1;
            animation.play();
          });
        }
      },
      {
        root: scroller instanceof Element ? scroller : null,
        rootMargin: `0px 0px ${-threshold * 100}% 0px`
      }
    );
    observer.observe(el);

    return () => {
      disposed = true;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      extras.forEach(animation => animation.cancel());
      clearMask();
    };
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    rotate,
    tilt,
    wipe,
    threshold,
    delay,
    stagger,
    staggerFrom,
    trigger,
    once,
    disappearAfter,
    disappearDuration,
    disappearEase
  ]);

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden', ...style }} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
