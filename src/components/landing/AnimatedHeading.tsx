'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedHeadingProps {
  /** Full accessible heading text (screen readers). */
  text: string;
  /** Visual lines — each string is shown on its own line. */
  lines: Array<{ text: string; className?: string }>;
  /** Start the letter reveal animation. */
  animate: boolean;
  /** Prefer reduced motion: simple fade, no letter split motion. */
  reducedMotion: boolean;
  /** Mobile: slightly faster stagger. */
  isMobile: boolean;
  className?: string;
  style?: CSSProperties;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Letter-by-letter bottom-to-top reveal with word wrappers so letters
 * never wrap mid-word. Decorative split is aria-hidden; sr text is on h1.
 */
export function AnimatedHeading({
  text,
  lines,
  animate,
  reducedMotion,
  isMobile,
  className,
  style,
}: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (animate) setStarted(true);
  }, [animate]);

  const letterDelay = 26;

  const flatLetters = useMemo(() => {
    let index = 0;
    return lines.map((line) => {
      const words = line.text.split(/(\s+)/);
      return words.map((token) => {
        if (/^\s+$/.test(token)) {
          return { type: 'space' as const, value: token, lineClass: line.className };
        }
        const letters = token.split('').map((char) => {
          const i = index++;
          return { char, i };
        });
        return { type: 'word' as const, letters, lineClass: line.className };
      });
    });
  }, [lines]);

  if (reducedMotion) {
    return (
      <h1
        className={cn(
          'text-[36px] font-bold tracking-tight text-slate-900 sm:text-[48px] lg:text-[56px] lg:leading-[1.08]',
          className
        )}
        style={{
          ...style,
          opacity: started ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      >
        {lines.map((line, i) => (
          <span key={i} className={cn('block', line.className)}>
            {line.text}
          </span>
        ))}
      </h1>
    );
  }

  if (isMobile) {
    return (
      <h1
        className={cn(
          'text-[36px] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-[48px]',
          className
        )}
        style={style}
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden="true" className="block">
          {lines.map((line, index) => (
            <span key={line.text} className="block overflow-hidden pb-[0.04em]">
              <span
                className={cn('block will-change-transform', line.className)}
                style={{
                  opacity: started ? 1 : 0,
                  transform: started ? 'translateY(0)' : 'translateY(72%)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '680ms',
                  transitionTimingFunction: EASE,
                  transitionDelay: started ? `${index * 110}ms` : '0ms',
                }}
              >
                {line.text}
              </span>
            </span>
          ))}
        </span>
      </h1>
    );
  }

  return (
    <h1
      className={cn(
        'text-[36px] font-bold tracking-tight text-slate-900 sm:text-[48px] lg:text-[56px] lg:leading-[1.08]',
        className
      )}
      style={style}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="block">
        {flatLetters.map((lineTokens, lineIdx) => (
          <span key={lineIdx} className="block">
            {lineTokens.map((token, tokenIdx) => {
              if (token.type === 'space') {
                return (
                  <span key={`s-${lineIdx}-${tokenIdx}`} className={token.lineClass}>
                    {'\u00A0'}
                  </span>
                );
              }
              return (
                <span
                  key={`w-${lineIdx}-${tokenIdx}`}
                  className={cn('inline-block whitespace-nowrap', token.lineClass)}
                >
                  {token.letters.map(({ char, i }) => (
                    <span
                      key={`${i}-${char}`}
                      className="inline-block overflow-hidden align-bottom leading-[1.08]"
                      style={{ height: '1.08em' }}
                    >
                      <span
                        className="inline-block will-change-transform"
                        style={{
                          opacity: started ? 1 : 0,
                          transform: started ? 'translateY(0)' : 'translateY(110%)',
                          transitionProperty: 'opacity, transform',
                          transitionDuration: '620ms',
                          transitionTimingFunction: EASE,
                          transitionDelay: started ? `${i * letterDelay}ms` : '0ms',
                        }}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}
