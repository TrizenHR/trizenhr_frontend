'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { resolveTenantLoginUrl } from '@/lib/host';
import type { ValidatedDemoInvite } from '@/lib/types';

const setPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validatingDemo, setValidatingDemo] = useState(false);
  const [demoInvite, setDemoInvite] = useState<ValidatedDemoInvite | null>(null);
  const [loginRedirect, setLoginRedirect] = useState('/login');

  const token = searchParams.get('token');
  const flow = searchParams.get('flow');
  const isDemoFlow = Boolean(token && flow === 'demo');

  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const organizationId = searchParams.get('organizationId');

  const displayEmail = isDemoFlow ? demoInvite?.email : email;
  const displayRole = isDemoFlow ? demoInvite?.role : role;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  useEffect(() => {
    if (!isDemoFlow) {
      if (!email || !organizationId) {
        toast.error('Invalid invitation link. Please contact your administrator.');
      }
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setValidatingDemo(true);
        const data = await authApi.validateDemoInvite(token!);
        if (cancelled) return;
        setDemoInvite(data);
        setLoginRedirect(resolveTenantLoginUrl(data.subdomain));
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(
          e.response?.data?.message || 'This demo invitation has expired or is invalid.'
        );
      } finally {
        if (!cancelled) setValidatingDemo(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDemoFlow, token, email, organizationId]);

  const onSubmit = async (data: SetPasswordFormData) => {
    setIsLoading(true);

    try {
      if (isDemoFlow) {
        if (!token) {
          toast.error('Missing demo invitation token');
          setIsLoading(false);
          return;
        }
        await authApi.acceptInvitation({ token, password: data.password });
        const redirect = resolveTenantLoginUrl(demoInvite?.subdomain);
        setLoginRedirect(redirect);
        setIsSuccess(true);
        toast.success('Password set successfully!');
        setTimeout(() => {
          window.location.href = redirect;
        }, 3000);
        return;
      }

      if (!email || !organizationId) {
        toast.error('Missing invitation details');
        setIsLoading(false);
        return;
      }
      await authApi.acceptInvitation({ email, organizationId, password: data.password });
      const redirect = resolveTenantLoginUrl(searchParams.get('subdomain') ?? undefined);
      setLoginRedirect(redirect);
      setIsSuccess(true);
      toast.success('Password set successfully!');
      setTimeout(() => {
        window.location.href = redirect;
      }, 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to set password. Link may have expired.');
      setIsLoading(false);
    }
  };

  if (validatingDemo) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-md">
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500">Validating demo invitation…</p>
        </CardContent>
      </Card>
    );
  }

  if (isDemoFlow && !demoInvite) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-md">
        <CardContent className="py-10 text-center">
          <CardTitle className="text-xl font-bold text-slate-900">Invitation unavailable</CardTitle>
          <CardDescription className="mt-2">
            This demo invitation link is invalid or has expired. Contact Trizen HR for a new
            invite.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-md">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Account Ready!</CardTitle>
          <CardDescription className="mt-2 text-slate-600">
            Your password has been set successfully. You are being redirected to the login page…
          </CardDescription>
          <Button className="mt-8 w-full" onClick={() => { window.location.href = loginRedirect; }}>
            Go to Login Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const inviteExpiryCopy = isDemoFlow && demoInvite?.inviteExpiresAt
    ? new Date(demoInvite.inviteExpiresAt).toLocaleString()
    : null;

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="TrizenHR"
              width={40}
              height={40}
              className="rounded-lg shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">TrizenHR</span>
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          {isDemoFlow ? 'Accept Demo Invitation' : 'Secure Your Account'}
        </CardTitle>
        <CardDescription>
          {isDemoFlow && demoInvite ? (
            <>
              Hi <span className="font-medium text-slate-900">{displayEmail}</span>, set a password
              to start your <span className="font-medium text-primary">{demoInvite.companyName}</span>{' '}
              demo as{' '}
              <span className="font-medium text-primary capitalize">
                {displayRole?.replace('_', ' ')}
              </span>
              . After accepting, you&apos;ll have {demoInvite.demoAccessTtlDays} days of demo access.
            </>
          ) : (
            <>
              Hi <span className="font-medium text-slate-900">{displayEmail}</span>, please set a
              password to join your organization as{' '}
              <span className="font-medium text-primary capitalize">
                {displayRole?.replace('_', ' ')}
              </span>
              .
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className={`pl-10 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
              />
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20"
            disabled={
              isLoading ||
              (isDemoFlow ? !demoInvite : !email || !organizationId)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your account…
              </>
            ) : isDemoFlow ? (
              'Accept & Set Password'
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            {inviteExpiryCopy
              ? `Invitation link expires ${inviteExpiryCopy}.`
              : 'Invitations expire after the period shown in your email.'}{' '}
            Need help?{' '}
            <Link href="/dashboard/help" className="font-medium text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <Suspense
          fallback={
            <Card className="flex w-full max-w-md flex-col items-center p-10">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-500">Loading invitation…</p>
            </Card>
          }
        >
          <SetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
