'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { AuthField, AuthPageShell } from '@/components/auth/AuthPageShell';

const backToLogin = (
  <p className="text-center text-[13px] text-slate-500">
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      Back to login
    </Link>
  </p>
);

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      toast.success('Password reset successfully');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to reset password. The link may be expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthPageShell
        eyebrow="Link expired"
        title="This reset link is invalid"
        description="Your password reset link is invalid or has expired. Request a new one to continue."
        footer={backToLogin}
      >
        <div className="rounded-2xl border border-red-200/80 bg-red-50/70 p-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15">
            <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <p className="text-[14px] leading-relaxed text-red-900">
            Password reset links are single-use and time-limited for your security.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-5 h-11 w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  if (isSuccess) {
    return (
      <AuthPageShell
        eyebrow="All set"
        title="Password reset successful"
        description="Your password has been updated. We are redirecting you to sign in."
        footer={backToLogin}
      >
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden />
          </div>
          <p className="text-[14px] leading-relaxed text-emerald-900">
            You can now sign in with your new password.
          </p>
          <Link href="/login">
            <Button className="mt-5 h-11 w-full">Go to login</Button>
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      eyebrow="Secure your account"
      title="Set a new password"
      description="Choose a strong password with at least 6 characters to protect your account."
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField>
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
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
        </AuthField>

        <AuthField>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-11 pr-11"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </AuthField>

        <Button type="submit" className="h-11 w-full text-[15px]" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100svh] items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
