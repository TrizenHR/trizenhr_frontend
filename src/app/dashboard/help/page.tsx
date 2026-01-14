'use client';

import { useState } from 'react';
import { HelpCircle, Search, MessageCircle, Mail, Phone, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import GettingStartedSection from '@/components/help/GettingStartedSection';
import FeatureGuidesSection from '@/components/help/FeatureGuidesSection';
import FAQSection from '@/components/help/FAQSection';
import TroubleshootingSection from '@/components/help/TroubleshootingSection';

export default function HelpPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter content based on user role
  const userRole = user?.role || UserRole.EMPLOYEE;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          <h1 className="text-xl md:text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Find answers to common questions and learn how to use TrizenHR
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help topics, features, or questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="getting-started" className="text-xs sm:text-sm">Getting Started</TabsTrigger>
          <TabsTrigger value="guides" className="text-xs sm:text-sm">Guides</TabsTrigger>
          <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
          <TabsTrigger value="troubleshooting" className="text-xs sm:text-sm">Troubleshooting</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="mt-6">
          <GettingStartedSection searchQuery={searchQuery} userRole={userRole} />
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <FeatureGuidesSection searchQuery={searchQuery} userRole={userRole} />
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <FAQSection searchQuery={searchQuery} userRole={userRole} />
        </TabsContent>

        <TabsContent value="troubleshooting" className="mt-6">
          <TroubleshootingSection searchQuery={searchQuery} userRole={userRole} />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Need additional help? Contact our support team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send us an email and we'll get back to you within 24 hours
                </p>
                <a
                  href="mailto:support@trizenventures.com"
                  className="text-blue-600 hover:underline text-sm"
                >
                  support@trizenventures.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Call us during business hours for immediate assistance
                </p>
                <a
                  href="tel:+1-800-ATTEND"
                  className="text-green-600 hover:underline text-sm"
                >
                  +1 (800) ATTEND
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Support Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM (IST)
                  <br />
                  Saturday: 10:00 AM - 2:00 PM (IST)
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to emails within 24 hours during business days.
                  For urgent issues, please call our support line.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">System Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Browser Support</p>
                <p className="font-medium">Chrome, Firefox, Safari, Edge</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mobile</p>
                <p className="font-medium">Responsive Web App</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">2025-01-15</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
