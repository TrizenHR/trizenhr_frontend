'use client';

import { FinalCTASection } from '@/components/landing/FinalCTASection';

export function CtaBooking() {
  const openDemo = () => {
    window.location.hash = '#demo';
  };

  return <FinalCTASection onBookDemo={openDemo} />;
}
