'use client';

import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

export function PricingBooking() {
  const openDemo = () => {
    window.location.hash = '#demo';
  };

  return (
    <>
      <PricingSection onBookDemo={openDemo} />
      <FinalCTASection onBookDemo={openDemo} />
    </>
  );
}
