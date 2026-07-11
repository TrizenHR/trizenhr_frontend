'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuth } from '@/features/auth-context';
import { needsProfileCompletion, postAuthRedirectPath } from '@/lib/profileUtils';

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .min(6, 'Enter a valid phone number'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, token, isLoading, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dateOfBirth: '',
      gender: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    if (!needsProfileCompletion(user)) {
      router.replace('/dashboard');
    }
  }, [isLoading, token, user, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    try {
      const updatedUser = await authApi.completeProfile({
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone.trim(),
      });
      updateUser(updatedUser);
      toast.success('Profile completed successfully!');
      router.push(postAuthRedirectPath(updatedUser));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to save profile.');
      setSubmitting(false);
    }
  };

  if (isLoading || !user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-10">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500">Loading…</p>
        </Card>
      </div>
    );
  }

  if (!needsProfileCompletion(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-10">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500">Redirecting…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full justify-center">
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
            <CardTitle className="text-2xl font-bold text-slate-900">Complete Your Profile</CardTitle>
            <CardDescription>
              Hi <span className="font-medium text-slate-900">{user.firstName || user.fullName}</span>,
              add a few personal details to finish setting up your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  disabled={submitting}
                  max={new Date().toISOString().slice(0, 10)}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs font-medium text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange} disabled={submitting}>
                      <SelectTrigger id="gender" className={`w-full ${errors.gender ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs font-medium text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  {...register('phone')}
                  disabled={submitting}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-xs font-medium text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving profile…
                  </>
                ) : (
                  <>
                    <UserCircle2 className="mr-2 h-5 w-5" />
                    Complete Setup
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
