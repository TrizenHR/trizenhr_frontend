import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/features/auth-context';
import { ToastProvider } from '@/components/providers/toast-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trizenhr.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'TrizenHR | Attendance & Payroll for Growing Teams',
  description:
    'Role-based attendance and payroll platform that gives HR teams complete visibility, control, and compliance as organizations scale.',
  icons: {
    icon: '/assets/logo.png',
  },
  openGraph: {
    title: 'TrizenHR | Attendance & Payroll for Growing Teams',
    description:
      'Role-based attendance and payroll platform that gives HR teams complete visibility, control, and compliance as organizations scale.',
    images: ['/assets/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'TrizenHR | Attendance & Payroll for Growing Teams',
    description:
      'Role-based attendance and payroll platform that gives HR teams complete visibility, control, and compliance as organizations scale.',
    images: ['/assets/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
