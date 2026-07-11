import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo.png"
              alt="TrizenHR"
              width={32}
              height={32}
              className="rounded"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-slate-900">TrizenHR</span>
              <span className="text-[10px] text-slate-500 -mt-0.5">by Trizen Ventures</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-300" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" className="font-medium shadow-sm" asChild>
            <Link href="/#demo">Book a demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="TrizenHR"
              width={32}
              height={32}
              className="brightness-0 invert transition-transform hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-200">TrizenHR</span>
              <span className="text-xs text-slate-400">by Trizen Ventures</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-300 transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/privacy-policy" className="text-slate-300 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/login" className="text-slate-300 transition-colors hover:text-white">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-2 border-t border-slate-800 pt-6 text-xs text-slate-400">
          © {year} Trizen Ventures. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

type PolicySectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

function PolicySection({ id, title, children }: PolicySectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/70 pt-8">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const effectiveDate = new Date();
  const lastUpdated = new Date();

  const toc = [
    { id: 'sec-overview', label: 'Overview' },
    { id: 'sec-info', label: 'Information We Collect' },
    { id: 'sec-use', label: 'How We Use Data' },
    { id: 'sec-legal-bases', label: 'Legal Bases' },
    { id: 'sec-cookies', label: 'Cookies' },
    { id: 'sec-sharing', label: 'How We Share Data' },
    { id: 'sec-retention', label: 'Data Retention' },
    { id: 'sec-security', label: 'Data Security' },
    { id: 'sec-rights', label: 'Your Rights' },
    { id: 'sec-transfers', label: 'International Transfers' },
    { id: 'sec-children', label: 'Children’s Privacy' },
    { id: 'sec-contact', label: 'Contact Us' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:px-0 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border/70 bg-muted/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  On this page ({toc.length})
                </div>
                <nav className="mt-3 space-y-2">
                  {toc.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {idx + 1}. {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div>
              <div className="flex items-start gap-4 lg:gap-5">
                <div className="mt-1 rounded-xl border border-border/80 bg-muted/10 p-2.5">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Privacy Policy</h1>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Effective Date:</span>{' '}
                      {effectiveDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Last Updated:</span>{' '}
                      {lastUpdated.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <PolicySection id="sec-overview" title="1. Overview">
                  <p>
                    This Privacy Policy explains how Trizen Ventures Private Limited (“TrizenHR”, “we”, “us”, or “our”) collects, uses,
                    and shares personal data when you use our attendance &amp; payroll platform and related services.
                  </p>
                  <p>
                    If you access the service on behalf of an organization (for example, as an employee, HR user, or administrator), that
                    organization determines how the service is used. In many cases, we act as a processor that provides the platform; your
                    organization remains responsible for the purpose and scope of processing.
                  </p>
                  <p>
                    This Privacy Policy is governed in accordance with the laws of India, unless otherwise required by applicable law.
                  </p>
                  <p>
                    <strong>Mobile app — location data:</strong> The TrizenHR Android and iOS apps access and collect location data
                    (including precise GPS location and, where enabled by your employer, background location while you are checked in).
                    Location is used for attendance geofencing, field workforce tracking, and fraud prevention. See Section 2.D for full
                    details on what is collected, how it is used, who can view it, and how you can control permissions.
                  </p>
                </PolicySection>

                <PolicySection id="sec-info" title="2. Information We Collect">
                  <p>We collect data needed to operate and secure the service.</p>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">A. Account and administrative information</h3>
                      <p className="mt-1">Examples: name, work email, role/job title, company/organization details, and account settings.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">B. Workforce data</h3>
                      <p className="mt-1">
                        Examples: attendance records, leave requests and balances, employee profile data, approvals, and payroll-related
                        information you provide or that your organization uses in the platform.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">C. Camera access and check-in photos (mobile app)</h3>
                      <p className="mt-1">
                        The TrizenHR mobile app requests access to your device&apos;s camera solely to capture a selfie photo when you check in for
                        attendance. The photo is taken using the front-facing camera and is immediately uploaded to your organization&apos;s account
                        as part of the attendance record.
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>
                          The photo is <strong>not intentionally</strong> stored in the user&apos;s personal photo gallery or media library.
                        </li>
                        <li>Camera access is requested only at the moment of check-in — not in the background or at any other time.</li>
                        <li>The image is accessible to authorized HR and admin users in your organization for attendance verification.</li>
                        <li>Photos are processed solely for attendance verification and fraud prevention purposes.</li>
                        <li>You can deny or revoke camera permission at any time in your device settings; this will prevent photo-based check-in.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">D. Location data (mobile app)</h3>
                      <p className="mt-1">
                        The TrizenHR mobile app <strong>accesses and collects location data</strong> from your device for
                        attendance-related features. This may include <strong>precise location</strong> (GPS coordinates) and{' '}
                        <strong>approximate location</strong>, depending on the permissions you grant. How location is used depends on
                        your organization&apos;s settings and your role.
                      </p>
                      <p className="mt-2 font-medium text-foreground">Check-in location (geofencing)</p>
                      <p className="mt-1">
                        When your organization enables geofence-based attendance, the app reads your GPS coordinates when you check in
                        (and, where applicable, when you check out) to verify that you are within an authorized work area. Location is
                        collected only at those moments — not continuously for standard office attendance.
                      </p>
                      <p className="mt-2 font-medium text-foreground">Field tracking</p>
                      <p className="mt-1">
                        For employees whose organization has enabled field tracking, the app collects GPS location updates at regular
                        intervals (for example, every 5 minutes) while you are checked in. A persistent notification indicates when
                        background location sharing is active. Location points are stored against your attendance session and are
                        visible to authorized HR and admin users on the field tracking dashboard (live map and location history).
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>Location data is collected and processed solely for attendance verification, field workforce management, and fraud prevention.</li>
                        <li>
                          <strong>Background location</strong> may be collected while you are checked in when your organization has
                          enabled field tracking, so updates can continue when the app is minimized. A persistent notification is shown
                          while background location sharing is active.
                        </li>
                        <li>
                          Location data is shared with your organization and is accessible to authorized HR and admin users; it is not
                          sold or shared publicly.
                        </li>
                        <li>
                          You can deny or revoke location permission at any time in your device settings; this may prevent geofence
                          check-in or field tracking from working.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">E. Support and communications</h3>
                      <p className="mt-1">
                        Examples: information you send to our support team, including messages, tickets, and related correspondence.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">F. Usage and device information</h3>
                      <p className="mt-1">
                        Examples: IP address, browser type, pages viewed, and other log data used to maintain security and performance.
                      </p>
                    </div>
                  </div>
                </PolicySection>

                <PolicySection id="sec-use" title="3. How We Use Personal Data">
                  <p>We use data to deliver the service and meet legal requirements.</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Provide attendance, leave, payroll, and related HR functionality.</li>
                    <li>
                      Enable photo-based attendance check-in verification (mobile app only) — check-in photos are stored against the
                      corresponding attendance record and are visible to authorized HR and admin users within your organization.
                    </li>
                    <li>
                      Verify attendance against organization-defined office locations using GPS at check-in (mobile app, when geofencing
                      is enabled by your organization).
                    </li>
                    <li>
                      Enable field employee location tracking and route history for authorized HR and admin users (mobile app only,
                      when field tracking is enabled by your organization).
                    </li>
                    <li>Enable role-based access and organizational administration.</li>
                    <li>Operate, maintain, and secure the platform (including fraud detection and incident response).</li>
                    <li>Communicate with you about your account, requests, and support inquiries.</li>
                    <li>Comply with legal obligations (e.g., recordkeeping and lawful requests).</li>
                  </ul>
                </PolicySection>

                <PolicySection id="sec-legal-bases" title="4. Legal Bases (GDPR/UK GDPR)">
                  <p>Where applicable, we process personal data based on one or more of the following legal bases:</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Contract or steps prior to entering into a contract.</li>
                    <li>Legitimate interests in operating and securing the platform.</li>
                    <li>Legal obligations.</li>
                    <li>Consent (where required), such as for certain cookie categories.</li>
                  </ul>
                </PolicySection>

                <PolicySection id="sec-cookies" title="5. Cookies and Similar Technologies">
                  <p>
                    We may use cookies or similar technologies to help run and secure the website and service.
                  </p>
                  <p>
                    Cookies may be used for essential functionality (such as session management) and other purposes depending on your settings
                    and local laws. You can manage cookies through your browser settings.
                  </p>
                </PolicySection>

                <PolicySection id="sec-sharing" title="6. How We Share Data">
                  <p>We only share data as needed to provide the service or as required by law.</p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Your organization (as permitted for HR and administration).</li>
                    <li>
                      Service providers and partners acting on our behalf (which may include cloud hosting providers, analytics providers,
                      communication providers, and infrastructure partners).
                    </li>
                    <li>Law enforcement, regulators, or other parties when required to comply with legal obligations.</li>
                  </ul>
                </PolicySection>

                <PolicySection id="sec-retention" title="7. Data Retention">
                  <p>
                    We retain personal data only for as long as necessary for the purposes described in this policy.
                  </p>
                  <p>
                    Retention periods may vary depending on legal obligations, support needs, and how long you (or your organization) maintain
                    an account.
                  </p>
                  <p>
                    Following account termination, personal data may be deleted or anonymized, and we may also delete or anonymize certain data
                    upon request, unless retention is required or appropriate for legal, compliance, security, dispute resolution, or legitimate
                    business purposes.
                  </p>
                </PolicySection>

                <PolicySection id="sec-security" title="8. Data Security">
                  <p>
                    We implement administrative, technical, and physical safeguards designed to protect personal data.
                  </p>
                  <p>
                    No method of transmission or storage is 100% secure. However, we work to protect against unauthorized access, disclosure,
                    alteration, and destruction.
                  </p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>HTTPS / encrypted connections in transit where applicable.</li>
                    <li>Role-based access controls and least-privilege access practices.</li>
                    <li>Authentication protections (such as secure session handling and administrative controls).</li>
                    <li>Infrastructure monitoring and alerting designed to detect abnormal activity.</li>
                  </ul>
                </PolicySection>

                <PolicySection id="sec-rights" title="9. Your Rights">
                  <p>
                    Depending on where you live and the applicable laws, you may have rights such as:
                  </p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Access to personal data we hold about you.</li>
                    <li>Correction of inaccurate or incomplete data.</li>
                    <li>Deletion (where applicable).</li>
                    <li>Restriction or objection to certain processing.</li>
                    <li>Portability (where applicable).</li>
                  </ul>
                  <p>
                    If you are an employee or user of the service, some requests may need to be handled by your organization first. You can still
                    contact us for assistance.
                  </p>
                </PolicySection>

                <PolicySection id="sec-transfers" title="10. International Data Transfers">
                  <p>We may host or process data in countries other than where you live.</p>
                  <p>
                    Where required, we take steps designed to ensure appropriate safeguards for cross-border transfers (for example, through
                    contractual mechanisms and security measures).
                  </p>
                </PolicySection>

                <PolicySection id="sec-children" title="11. Children’s Privacy">
                  <p>The service is not directed to children under the age required by applicable law.</p>
                  <p>We do not knowingly collect personal data from children.</p>
                </PolicySection>

                <PolicySection id="sec-contact" title="12. Contact Us">
                  <p>Questions about this Privacy Policy or your rights are welcome.</p>
                  <p>
                    Email:{' '}
                    <a className="text-primary underline-offset-4 hover:underline" href="mailto:support@trizenventures.com">
                      support@trizenventures.com
                    </a>
                  </p>
                  <p>
                    If you contact us, please include enough detail so we can identify your account (for example, the organization name and
                    work email used on your account).
                  </p>
                </PolicySection>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

