'use client';

import { useState, useEffect } from 'react';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DemoRequestModal } from '@/components/landing/DemoRequestModal';
import { EnhancedHero } from '@/components/landing/EnhancedHero';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CoreCapabilitiesSection } from '@/components/landing/CoreCapabilitiesSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { EnhancedSocialProof } from '@/components/landing/EnhancedSocialProof';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { RoleBasedExperienceSection } from '@/components/landing/RoleBasedExperienceSection';
import { ReportsComplianceSection } from '@/components/landing/ReportsComplianceSection';

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    const openIfHashDemo = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#demo') {
        setDemoModalOpen(true);
      }
    };
    openIfHashDemo();
    window.addEventListener('hashchange', openIfHashDemo);
    return () => window.removeEventListener('hashchange', openIfHashDemo);
  }, []);

  const openDemoModal = () => setDemoModalOpen(true);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar onBookDemo={openDemoModal} />

      <main className="flex-1">
        <EnhancedHero onBookDemo={openDemoModal} />
        <ProblemSection />
        <HowItWorksSection />
        <CoreCapabilitiesSection />
        <FeatureShowcase />
        <RoleBasedExperienceSection />
        <ReportsComplianceSection />
        <PricingSection onBookDemo={openDemoModal} />
        <EnhancedSocialProof />
        <FinalCTASection onBookDemo={openDemoModal} />
      </main>

      <LandingFooter onBookDemo={openDemoModal} />
      <DemoRequestModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
