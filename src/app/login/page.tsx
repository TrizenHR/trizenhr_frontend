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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/features/auth-context';
import { LoginFormData, loginSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setIsForgotSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gray-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo-white.png"
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
            <CardTitle className="text-2xl font-semibold">
              {isForgotPassword ? 'Reset password' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {isForgotPassword 
                ? 'Enter your email to receive a password reset link' 
                : 'Sign in to access your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgotPassword ? (
              <div className="space-y-4">
                {isForgotSubmitted ? (
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-sm text-green-800">
                      If an account exists with <strong>{forgotEmail}</strong>, you will receive a password reset link shortly.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsForgotSubmitted(false);
                      }}
                      className="mt-2 text-green-800 font-semibold"
                    >
                      Return to sign in
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        'Send reset link'
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setIsForgotPassword(false)}
                      disabled={isLoading}
                    >
                      Back to sign in
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <>
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
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...register('password')}
                        disabled={isLoading}
                        className={`${errors.password ? 'border-red-500' : ''} pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
              </>
            )}

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

