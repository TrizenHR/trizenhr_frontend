import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/features/auth-context';
import { ToastProvider } from '@/components/providers/toast-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trizenhr.com';

const siteTitle = 'TrizenHR | Attendance & Payroll for Growing Teams';
const siteDescription =
  'Role-based attendance and payroll platform that gives HR teams complete visibility, control, and compliance as organizations scale.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: '%s | TrizenHR',
  },
  description: siteDescription,
  keywords: [
    'attendance management',
    'payroll software',
    'HR platform',
    'leave management',
    'workforce management',
    'time tracking',
    'TrizenHR',
  ],
  authors: [{ name: 'Trizen Ventures' }],
  creator: 'Trizen Ventures',
  publisher: 'Trizen Ventures',
  category: 'business',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'TrizenHR',
    locale: 'en_US',
    url: baseUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 700,
        alt: 'TrizenHR attendance dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trizenhr',
    creator: '@trizenhr',
    title: siteTitle,
    description: siteDescription,
    images: ['/image.png'],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TrizenHR',
  url: baseUrl,
  logo: `${baseUrl}/assets/logo.png`,
  description: siteDescription,
  email: 'support@trizenventures.com',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Trizen Ventures',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TrizenHR',
  url: baseUrl,
  description: siteDescription,
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    name: 'TrizenHR',
    logo: `${baseUrl}/assets/logo.png`,
  },
};

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TrizenHR',
  url: baseUrl,
  image: `${baseUrl}/image.png`,
  description: siteDescription,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  inLanguage: 'en',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '1',
      priceCurrency: 'INR',
      description: 'Up to 50 employees — core attendance and payroll',
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      price: '2',
      priceCurrency: 'INR',
      description: 'Up to 200 employees — all features plus basic integrations',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'Trizen Ventures',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
