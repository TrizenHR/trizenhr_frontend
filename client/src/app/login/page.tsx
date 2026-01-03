'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

// Test credentials for demo purposes
const TEST_CREDENTIALS = {
  email: 'demo@trizenventures.com',
  password: 'demo123',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check test credentials
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      // Store auth state in localStorage for demo
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ email, name: 'Demo User', role: 'admin' }));
      router.push('/dashboard');
    } else {
      setError('Invalid email or password. Use the test credentials below.');
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(TEST_CREDENTIALS.email);
    setPassword(TEST_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gray-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-semibold text-white">Attendance Dashboard</span>
          </Link>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-white">
            Workforce management made simple
          </h2>
          <p className="mt-4 text-gray-400">
            Track attendance, manage teams, and maintain compliance with a centralized platform
            built for modern organizations.
          </p>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} Trizen Ventures</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2 lg:px-8">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/assets/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold">Attendance Dashboard</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Test Credentials Box */}
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Test Credentials</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Email: <code className="rounded bg-gray-200 px-1.5 py-0.5">{TEST_CREDENTIALS.email}</code>
                </p>
                <p>
                  Password: <code className="rounded bg-gray-200 px-1.5 py-0.5">{TEST_CREDENTIALS.password}</code>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={fillTestCredentials}
              >
                Fill Test Credentials
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">
                ← Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
