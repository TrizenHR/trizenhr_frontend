import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trizenhr.com';

export const metadata: Metadata = {
  title: 'Login | TrizenHR',
  description:
    'Sign in to TrizenHR, the role-based attendance and payroll platform for growing teams.',
  alternates: { canonical: `${baseUrl}/login` },
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'TrizenHR',
    locale: 'en_US',
    url: `${baseUrl}/login`,
    title: 'Login | TrizenHR',
    description:
      'Sign in to TrizenHR, the role-based attendance and payroll platform for growing teams.',
    images: [
      {
        url: `${baseUrl}/image.png`,
        width: 1200,
        height: 700,
        alt: 'TrizenHR attendance dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login | TrizenHR',
    description:
      'Sign in to TrizenHR, the role-based attendance and payroll platform for growing teams.',
    images: [`${baseUrl}/image.png`],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
