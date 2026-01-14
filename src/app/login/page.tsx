'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth-context';
import { LoginFormData, loginSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

// Test credentials for all roles
const TEST_CREDENTIALS = [
  { role: 'Super Admin', email: 'demo@trizenventures.com', password: 'demo123' },
  { role: 'Admin', email: 'admin@trizenventures.com', password: 'admin123' },
  { role: 'HR', email: 'hr@trizenventures.com', password: 'hr1234' },
  { role: 'Supervisor', email: 'supervisor@trizenventures.com', password: 'supervisor123' },
  { role: 'Employee', email: 'employee@trizenventures.com', password: 'employee123' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    try {
      // Get Microsoft auth URL from backend
      const response = await authApi.getMicrosoftAuthUrl();
      // Redirect to Microsoft login
      window.location.href = response.authUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate Microsoft login');
      setIsMicrosoftLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
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
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Microsoft Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
              onClick={handleMicrosoftLogin}
              disabled={isMicrosoftLoading || isLoading}
            >
              {isMicrosoftLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting to Microsoft...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  disabled={isLoading}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
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
                  {...register('password')}
                  disabled={isLoading}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
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

            {/* Test Credentials - All Roles */}
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">Quick Login (Test Accounts)</p>
              <div className="grid grid-cols-1 gap-2">
                {TEST_CREDENTIALS.map((cred) => (
                  <Button
                    key={cred.role}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => fillCredentials(cred.email, cred.password)}
                  >
                    <span className="font-medium">{cred.role}</span>
                    <span className="text-xs text-gray-500">{cred.email}</span>
                  </Button>
                ))}
              </div>
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

