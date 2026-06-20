'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/api';
import {
  formatGenderLabel,
  formatProfileDate,
  needsProfileCompletion,
} from '@/lib/profileUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Building2, Calendar, KeyRound, Loader2, Phone, Shield, Camera, Upload, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const refreshProfile = async () => {
      try {
        const freshUser = await authApi.getCurrentUser();
        if (!cancelled) {
          updateUser(freshUser);
        }
      } catch {
        // Keep cached session user if refresh fails.
      }
    };
    void refreshProfile();
    return () => {
      cancelled = true;
    };
  }, [updateUser]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      setPasswords({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, GIF, WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Profile picture must be smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPic(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (user) {
        const updatedUser = { ...user, profilePicture: base64 };
        updateUser(updatedUser);
        toast({
          title: 'Profile Picture Updated',
          description: 'Your profile picture has been updated successfully.',
        });
      }
      setIsUploadingPic(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to read the image file. Please try again.',
        variant: 'destructive',
      });
      setIsUploadingPic(false);
    };
    reader.readAsDataURL(file);
    // Reset the input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveProfilePic = () => {
    if (user) {
      const updatedUser = { ...user, profilePicture: undefined };
      updateUser(updatedUser);
      toast({
        title: 'Profile Picture Removed',
        description: 'Your profile picture has been removed.',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
          Loading profile…
        </div>
      </div>
    );
  }

  const roleLabel = user.role.replace('_', ' ');
  const profileIncomplete = needsProfileCompletion(user);
  const hasPersonalDetails =
    profileIncomplete ||
    Boolean(user.dateOfBirth || user.gender || user.phone);

  return (
    <div className="mx-auto max-w-7xl space-y-5 lg:space-y-6">
      {profileIncomplete ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-950">Complete your profile</p>
              <p className="mt-1 text-sm text-amber-900/80">
                Add your date of birth and other personal details to finish setup.
              </p>
            </div>
          </div>
          <Button asChild className="h-10 shrink-0 rounded-xl">
            <Link href="/auth/complete-profile">Complete profile</Link>
          </Button>
        </div>
      ) : null}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/15">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div className="relative flex min-h-[7.5rem] flex-col justify-center gap-3 px-4 py-3.5 sm:min-h-[8rem] sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5 md:py-4">
          <div className="min-w-0 space-y-1.5">
            <span className="inline-flex w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              Account
            </span>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Profile</h1>
            <p className="max-w-2xl text-sm leading-snug text-primary-foreground/85 sm:line-clamp-2">
              Review your account details and update your password to keep your access secure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="w-fit rounded-full border border-primary-foreground/25 bg-primary-foreground/10 font-semibold text-primary-foreground shadow-none">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
            <CardHeader className="border-b border-border/60 pb-3 pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">Account</CardTitle>
              <CardDescription className="text-sm">Your primary account identity.</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {/* Profile Picture with Upload */}
                <div className="relative group">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPic}
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Change profile picture"
                  >
                    {isUploadingPic ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPic}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <Upload className="h-3 w-3" />
                      {user.profilePicture ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {user.profilePicture && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePic}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{roleLabel}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Member since
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Not available'}
                  </p>
                  {!user.createdAt ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      This account doesn't include a creation date.
                    </p>
                  ) : null}
                </div>
                {user.department ? (
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{user.department}</p>
                  </div>
                ) : null}
                {user.employeeId ? (
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Employee ID
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{user.employeeId}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {hasPersonalDetails ? (
            <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
              <CardHeader className="border-b border-border/60 pb-3 pt-5">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <CardTitle className="text-base font-semibold tracking-tight">Personal Details</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Date of birth, gender, and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Date of birth
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatProfileDate(user.dateOfBirth)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Gender
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatGenderLabel(user.gender)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Phone
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user.phone?.trim() || 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {user.role !== 'super_admin' && (user.organization || user.organizationId) ? (
            <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
              <CardHeader className="border-b border-border/60 pb-3 pt-5">
                <CardTitle className="text-base font-semibold tracking-tight">Organization</CardTitle>
                <CardDescription className="text-sm">Your organization context.</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Organization
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {user.organization?.name || 'Organization not available'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Plan
                      </p>
                    </div>
                    {user.organization?.subscriptionPlan ? (
                      <Badge
                        className="mt-2 border border-primary/25 bg-primary/10 font-semibold text-primary shadow-none"
                        variant="outline"
                      >
                        {user.organization.subscriptionPlan.toUpperCase()}
                      </Badge>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Plan not available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-5">
          <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm ring-1 ring-border/40">
            <CardHeader className="border-b border-border/60 pb-3 pt-5">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle className="text-base font-semibold tracking-tight">Security</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Change your password. You'll be logged out on other sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="oldPassword" className="text-[11px] font-semibold text-muted-foreground">
                    Current password
                  </Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-[11px] font-semibold text-muted-foreground">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[11px] font-semibold text-muted-foreground"
                  >
                    Confirm new password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    className="h-10 rounded-xl"
                  />
                </div>

                <Button type="submit" disabled={isChangingPassword} className="h-10 w-full rounded-xl">
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Updating…
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
