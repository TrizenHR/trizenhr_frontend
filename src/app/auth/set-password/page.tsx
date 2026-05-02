'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

const setPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const organizationId = searchParams.get('organizationId');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  useEffect(() => {
    if (!email || !organizationId) {
      toast.error('Invalid invitation link. Please contact your administrator.');
    }
  }, [email, organizationId]);

  const onSubmit = async (data: SetPasswordFormData) => {
    if (!email || !organizationId) {
      toast.error('Missing invitation details');
      return;
    }

    setIsLoading(true);

    try {
      if (!API_BASE_URL) {
        toast.error('Server configuration error. NEXT_PUBLIC_API_URL is not set.');
        setIsLoading(false);
        return;
      }
      await axios.post(`${API_BASE_URL}/auth/accept-invitation`, {
        email,
        organizationId,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success('Password set successfully!');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to set password. Link may have expired.');
      setIsLoading(false);
    }
  };

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
            Your password has been set successfully. You are being redirected to the login page...
          </CardDescription>
          <Button className="mt-8 w-full" asChild>
            <Link href="/login">Go to Login Now</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <CardTitle className="text-2xl font-bold text-slate-900">Secure Your Account</CardTitle>
        <CardDescription>
          Hi <span className="font-medium text-slate-900">{email}</span>, please set a password to join your organization as <span className="font-medium text-primary capitalize">{role?.replace('_', ' ')}</span>.
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

          <Button type="submit" className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20" disabled={isLoading || !email}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Invitations expire in 7 days. Need help?{' '}
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
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md p-10 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500">Loading invitation...</p>
          </Card>
        }>
          <SetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
