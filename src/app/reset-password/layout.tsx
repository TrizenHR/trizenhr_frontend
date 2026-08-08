import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trizenhr.com';

export const metadata: Metadata = {
  title: 'Reset Password | TrizenHR',
  description:
    'Reset your TrizenHR account password to get back to attendance and payroll management.',
  alternates: { canonical: `${baseUrl}/reset-password` },
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'TrizenHR',
    locale: 'en_US',
    url: `${baseUrl}/reset-password`,
    title: 'Reset Password | TrizenHR',
    description:
      'Reset your TrizenHR account password to get back to attendance and payroll management.',
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
    title: 'Reset Password | TrizenHR',
    description:
      'Reset your TrizenHR account password to get back to attendance and payroll management.',
    images: [`${baseUrl}/image.png`],
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
