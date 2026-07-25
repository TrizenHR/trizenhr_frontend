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
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0&display=swap"
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
