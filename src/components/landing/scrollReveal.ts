/**
 * Shared scroll-reveal timing for landing sections below the hero.
 * Animations start when content reaches the viewport center band,
 * and run slower so they remain visible while the user is looking.
 */
export const LANDING_SCROLL_REVEAL: IntersectionObserverInit = {
  // Shrink the root to the middle band — fire when the section is centered
  rootMargin: '-18% 0px -32% 0px',
  threshold: 0.08,
};

/** Multiply enter durations so motion finishes while content is on screen */
export const LANDING_DURATION_SCALE = 1.55;

/** Slightly stretch stagger delays to match slower motion */
export const LANDING_DELAY_SCALE = 1.25;

export function landingDuration(ms: number): number {
  return Math.round(ms * LANDING_DURATION_SCALE);
}

export function landingDelay(ms: number): number {
  return Math.round(ms * LANDING_DELAY_SCALE);
}
