'use client';

import { useState, useEffect } from 'react';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { TrialOnboardingModal } from '@/components/landing/TrialOnboardingModal';
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
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');

  useEffect(() => {
    const openIfHashDemo = () => {
      if (typeof window !== 'undefined' && (window.location.hash === '#demo' || window.location.hash === '#trial')) {
        setTrialModalOpen(true);
      }
    };
    openIfHashDemo();
    window.addEventListener('hashchange', openIfHashDemo);
    return () => window.removeEventListener('hashchange', openIfHashDemo);
  }, []);

  const openTrialModal = (plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE' = 'GROWTH') => {
    setSelectedPlan(plan);
    setTrialModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar onBookDemo={() => openTrialModal('GROWTH')} />

      <main className="flex-1">
        <EnhancedHero onBookDemo={() => openTrialModal('GROWTH')} />
        <ProblemSection />
        <HowItWorksSection />
        <CoreCapabilitiesSection />
        <FeatureShowcase />
        <RoleBasedExperienceSection />
        <ReportsComplianceSection />
        <PricingSection
          onBookDemo={() => openTrialModal('GROWTH')}
          onSelectPlan={(planId) => openTrialModal(planId)}
        />
        <EnhancedSocialProof />
        <FinalCTASection onBookDemo={() => openTrialModal('GROWTH')} />
      </main>

      <LandingFooter onBookDemo={() => openTrialModal('GROWTH')} />
      <TrialOnboardingModal
        open={trialModalOpen}
        onOpenChange={setTrialModalOpen}
        defaultPlan={selectedPlan}
      />
    </div>
  );
}
