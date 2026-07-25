'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth-context';
import { LoginFormData, loginSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { postAuthRedirectPath } from '@/lib/profileUtils';
import { AuthField, AuthPageShell } from '@/components/auth/AuthPageShell';

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
      const loggedInUser = await login(data.email, data.password);
      router.push(postAuthRedirectPath(loggedInUser));
    } catch (err: any) {
      if (!err.response) {
        toast.error('Cannot reach the API server. Make sure the backend is running on port 5000.');
      } else {
        toast.error(
          err.response?.data?.message || err.response?.data?.error || 'Invalid email or password'
        );
      }
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    try {
      const response = await authApi.getMicrosoftAuthUrl();
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

  const backToSignIn = () => {
    setIsForgotPassword(false);
    setIsForgotSubmitted(false);
  };

  const eyebrow = isForgotPassword ? 'Account recovery' : 'Welcome back';
  const title = isForgotPassword ? 'Reset your password' : 'Sign in to TrizenHR';
  const description = isForgotPassword
    ? 'Enter the email linked to your account and we will send a secure reset link.'
    : 'Access your attendance and payroll dashboard.';

  return (
    <AuthPageShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      footer={
        <p className="text-center text-[13px] text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to home
          </Link>
        </p>
      }
    >
      {isForgotPassword ? (
        isForgotSubmitted ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
            </div>
            <p className="text-[14px] leading-relaxed text-emerald-900">
              If an account exists for <strong>{forgotEmail}</strong>, a password reset link is on
              its way. Check your inbox and spam folder.
            </p>
            <Button variant="outline" onClick={backToSignIn} className="mt-5 h-11 w-full">
              Return to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <AuthField>
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </AuthField>
            <Button type="submit" className="h-11 w-full text-[15px]" disabled={isLoading}>
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
              type="button"
              variant="ghost"
              className="h-11 w-full"
              onClick={backToSignIn}
              disabled={isLoading}
            >
              Back to sign in
            </Button>
          </form>
        )
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2.5 text-[15px] font-medium"
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
                <svg className="h-[18px] w-[18px]" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthField>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register('email')}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                className="h-11"
              />
              {errors.email && <p className="text-[13px] text-red-500">{errors.email.message}</p>}
            </AuthField>

            <AuthField>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
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
                  aria-invalid={!!errors.password}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[13px] text-red-500">{errors.password.message}</p>
              )}
            </AuthField>

            <Button type="submit" className="h-11 w-full text-[15px]" disabled={isLoading}>
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
    </AuthPageShell>
  );
}
