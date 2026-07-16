'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant =
  | 'fadeUp'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scaleIn'
  | 'textReveal';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

const VARIANT_CLASS: Record<RevealVariant, string> = {
  fadeUp: 'reveal-fade-up',
  fadeLeft: 'reveal-fade-left',
  fadeRight: 'reveal-fade-right',
  scaleIn: 'reveal-scale-in',
  textReveal: 'reveal-text',
};

export function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration,
  className,
  once = true,
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  const mergedStyle: CSSProperties = {
    ...style,
    transitionDelay: delay ? `${delay}ms` : undefined,
    transitionDuration: duration ? `${duration}ms` : undefined,
  };

  return (
    <div
      ref={ref}
      className={cn(
        'reveal-base',
        VARIANT_CLASS[variant],
        visible && 'is-visible',
        className
      )}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
