'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Star, ArrowRight, ShieldCheck, Sparkles, Building2, Users } from 'lucide-react';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TrialOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPlan?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
}

const DEFAULT_TRIAL_EMPLOYEE_COUNT = 25;
const MAX_EMPLOYEE_COUNT = 99999;

export function TrialOnboardingModal({
  open,
  onOpenChange,
  defaultPlan = 'GROWTH',
}: TrialOnboardingModalProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);


  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number | ''>(DEFAULT_TRIAL_EMPLOYEE_COUNT);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>(defaultPlan);

  // Auto-recommend plan based on employee count
  const recommendedPlan =
    typeof employeeCount === 'number'
      ? employeeCount <= 50
        ? 'STARTER'
        : employeeCount <= 200
        ? 'GROWTH'
        : 'ENTERPRISE'
      : 'GROWTH';

  useEffect(() => {
    if (step === 3 && typeof employeeCount === 'number') {
      setSelectedPlan(recommendedPlan);
    }
  }, [employeeCount, step, recommendedPlan]);

  const handleSendOtp = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast({ title: 'Validation error', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: 'Validation error', description: 'Please enter a valid work email address.', variant: 'destructive' });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: 'Validation error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setEmailExistsError(false);
    try {
      await authApi.sendOtp(email);
      setOtpSent(true);
      toast({
        title: 'Verification code sent ✓',
        description: `A 6-digit code has been sent to ${email}. Please check your inbox.`,
      });
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      const status = err.response?.status;
      const message = err.response?.data?.message || '';

      if (status === 409 || message.toLowerCase().includes('already exists')) {
        // Account already registered — show inline error under the email field
        setEmailExistsError(true);
      } else {
        toast({
          title: 'Could not send verification code',
          description: message || 'Please verify your email address and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      toast({ title: 'Validation error', description: 'Please enter the 6-digit code.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp(email, otp);
      setOtpVerified(true);
      toast({ title: 'Email verified!', description: 'Your email address has been confirmed.' });
      setStep(2); // Move to Organization Details
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Invalid code',
        description: err.response?.data?.message || 'The code entered is incorrect or expired.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => {
    if (!organizationName.trim() || organizationName.trim().length < 2) {
      toast({ title: 'Validation error', description: 'Please enter your organization name.', variant: 'destructive' });
      return;
    }
    setStep(3); // Move to Employee Count
  };

  const handleStep3Next = () => {
    if (!employeeCount || Number(employeeCount) < 1) {
      toast({ title: 'Validation error', description: 'Please enter a valid employee count.', variant: 'destructive' });
      return;
    }
    setStep(4); // Move to Plan Selection
  };

  const handleStep4Next = () => {
    setStep(5); // Move to Trial Confirmation
  };

  const handleActivateTrial = async () => {
    setLoading(true);
    try {
      const result = await authApi.registerTrial({
        fullName,
        email,
        phone: phone || undefined,
        password,
        organizationName,
        employeeCount: Number(employeeCount) || DEFAULT_TRIAL_EMPLOYEE_COUNT,
        planId: selectedPlan,
        billingCycle: 'MONTHLY',
      });

      // Save token & user in localStorage for immediate access
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      toast({
        title: '30-Day Free Trial Activated!',
        description: 'Welcome to TrizenHR! Redirecting to your dashboard...',
      });

      onOpenChange(false);
      window.location.href = '/dashboard';
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast({
        title: 'Could not create trial',
        description: err.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const planRateText =
    selectedPlan === 'STARTER'
      ? '₹1/user/day'
      : selectedPlan === 'GROWTH'
      ? '₹2/user/day'
      : 'Custom pricing';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900 sm:rounded-2xl shadow-2xl">
        {/* Top Header / Progress Bar */}
        <div className="bg-white p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">TRIZEN<span className="text-indigo-600">HR</span></span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Sparkles className="h-3 w-3" /> 30 Days Free Trial
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="mt-6 flex items-center justify-between gap-2">
            {[
              { num: 1, title: 'Account' },
              { num: 2, title: 'Organization' },
              { num: 3, title: 'Team Size' },
              { num: 4, title: 'Plan' },
              { num: 5, title: 'Confirm' },
            ].map((s) => (
              <div key={s.num} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-all duration-300',
                    step >= s.num ? 'bg-indigo-600' : 'bg-slate-200'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium hidden sm:inline',
                    step >= s.num ? 'text-indigo-600' : 'text-slate-400'
                  )}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* STEP 1: Registration & OTP */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create your Admin Account</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Start your 30-day free trial. Instant access, no credit card required.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-slate-700">Full Name *</Label>
                  <Input
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || otpVerified}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <Label className="text-slate-700">Work Email *</Label>
                  <Input
                    type="email"
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailExistsError(false);
                    }}
                    disabled={loading || otpVerified}
                    className={`bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 ${
                      emailExistsError ? 'border-red-400 focus:border-red-500' : ''
                    }`}
                  />
                  {emailExistsError && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                      <span className="text-sm text-red-700 flex-1">
                        An account with this email already exists.
                      </span>
                      <a
                        href="/login"
                        className="text-sm font-semibold text-indigo-600 hover:underline whitespace-nowrap"
                        onClick={() => onOpenChange(false)}
                      >
                        Log in →
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading || otpVerified}
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700">Password *</Label>
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || otpVerified}
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* OTP Verification Box */}
                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Email Verification Code'}
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-800 text-sm font-semibold">Enter 6-Digit Code</Label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        maxLength={6}
                        placeholder=""
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-white border-slate-300 text-center text-lg font-mono tracking-widest text-slate-900 focus:border-indigo-500"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Code sent to <span className="text-slate-800 font-medium">{email}</span>.{' '}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-indigo-600 hover:underline"
                      >
                        Resend Code
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Organization Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Organization Details</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tell us about your company to personalize your workspace.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-slate-700">Organization Name *</Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="e.g. ABC Technologies Pvt Ltd"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 h-11"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Your unique subdomain will be generated automatically (e.g. abctechnologies.trizenhr.com).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleStep2Next}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                >
                  Continue to Team Size <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Employee Count */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Team Size & Plan Recommendation</h3>
                <p className="text-sm text-slate-500 mt-1">
                  TrizenHR pricing is employee-based. Tell us your team size.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-slate-700 text-sm font-semibold">
                    How many employees does your organization currently have? *
                  </Label>
                  <div className="relative mt-2">
                    <Users className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      type="number"
                      min={1}
                      max={MAX_EMPLOYEE_COUNT}
                      placeholder="e.g. 100"
                      value={employeeCount}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setEmployeeCount('');
                          return;
                        }

                        const parsed = parseInt(e.target.value, 10);
                        if (Number.isNaN(parsed)) {
                          setEmployeeCount('');
                          return;
                        }

                        setEmployeeCount(Math.min(parsed, MAX_EMPLOYEE_COUNT));
                      }}
                      className="pl-10 bg-white border-slate-300 text-slate-900 text-lg font-semibold focus:border-indigo-500 h-12"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Your recommended plan is based on your employee count.
                  </p>
                </div>

                {/* Recommendation Banner */}
                {typeof employeeCount === 'number' && employeeCount > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        Recommended Plan for {employeeCount} Employees
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                        {recommendedPlan === 'STARTER' ? (
                          'Starter Plan'
                        ) : recommendedPlan === 'GROWTH' ? (
                          <>
                            Growth Plan <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          </>
                        ) : (
                          'Enterprise Plan'
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {recommendedPlan === 'STARTER' && '1-50 employees · ₹1/user/day'}
                        {recommendedPlan === 'GROWTH' && '51-200 employees · ₹2/user/day'}
                        {recommendedPlan === 'ENTERPRISE' && '200+ employees · Custom pricing'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 text-white shadow-sm">
                        <Check className="h-3.5 w-3.5" /> Auto-Selected
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleStep3Next}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                >
                  Review Plan Options <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Select Plan */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Select your Plan</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Choose the plan that best fits your organization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
                {/* Starter Card */}
                <div
                  onClick={() => setSelectedPlan('STARTER')}
                  className={cn(
                    'cursor-pointer relative p-4 rounded-xl border transition-all flex flex-col justify-between',
                    selectedPlan === 'STARTER'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {recommendedPlan === 'STARTER' && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Recommended
                    </span>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Starter</h4>
                    <p className="text-xs text-slate-500 mt-1">Up to 50 employees</p>
                    <div className="mt-3">
                      <span className="text-xl font-bold text-slate-900">₹1</span>
                      <span className="text-xs text-slate-500">/user/day</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span
                      className={cn(
                        'text-xs font-semibold flex items-center justify-center gap-1 py-1 rounded-md w-full',
                        selectedPlan === 'STARTER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {selectedPlan === 'STARTER' ? <Check className="h-3.5 w-3.5" /> : null}
                      {selectedPlan === 'STARTER' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>

                {/* Growth Card - Most Popular */}
                <div
                  onClick={() => setSelectedPlan('GROWTH')}
                  className={cn(
                    'cursor-pointer relative p-4 rounded-xl border transition-all flex flex-col justify-between',
                    selectedPlan === 'GROWTH'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-100'
                      : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                  )}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> Most Popular
                    </span>
                  </div>
                  <div className="pt-1">
                    <h4 className="text-base font-bold text-slate-900">Growth</h4>
                    <p className="text-xs text-slate-500 mt-1">Up to 200 employees</p>
                    <div className="mt-3">
                      <span className="text-xl font-bold text-slate-900">₹2</span>
                      <span className="text-xs text-slate-500">/user/day</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span
                      className={cn(
                        'text-xs font-semibold flex items-center justify-center gap-1 py-1 rounded-md w-full',
                        selectedPlan === 'GROWTH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {selectedPlan === 'GROWTH' ? <Check className="h-3.5 w-3.5" /> : null}
                      {selectedPlan === 'GROWTH' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>

                {/* Enterprise Card */}
                <div
                  onClick={() => setSelectedPlan('ENTERPRISE')}
                  className={cn(
                    'cursor-pointer relative p-4 rounded-xl border transition-all flex flex-col justify-between',
                    selectedPlan === 'ENTERPRISE'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {recommendedPlan === 'ENTERPRISE' && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Recommended
                    </span>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Enterprise</h4>
                    <p className="text-xs text-slate-500 mt-1">200+ employees</p>
                    <div className="mt-3">
                      <span className="text-lg font-bold text-slate-900">Custom</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span
                      className={cn(
                        'text-xs font-semibold flex items-center justify-center gap-1 py-1 rounded-md w-full',
                        selectedPlan === 'ENTERPRISE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {selectedPlan === 'ENTERPRISE' ? <Check className="h-3.5 w-3.5" /> : null}
                      {selectedPlan === 'ENTERPRISE' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleStep4Next}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                >
                  View Trial Confirmation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Trial Confirmation Card */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Trial Confirmation</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Review your 30-day free trial details before activation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      T
                    </div>
                    <span className="font-extrabold tracking-wider text-slate-900 text-sm">TRIZENHR</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    No Credit Card Required
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block">Organization</span>
                      <span className="font-semibold text-slate-900">{organizationName || 'ABC Technologies Pvt Ltd'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Employees</span>
                      <span className="font-semibold text-slate-900">{employeeCount || DEFAULT_TRIAL_EMPLOYEE_COUNT}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Selected Plan</span>
                      <span className="font-semibold text-indigo-600 flex items-center gap-1">
                        {selectedPlan === 'STARTER' ? 'Starter' : selectedPlan === 'GROWTH' ? 'Growth' : 'Enterprise'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Trial Period</span>
                      <span className="font-semibold text-emerald-600">30 Days FREE</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Trial Employee Limit</span>
                      <span className="font-semibold text-slate-900">
                        {selectedPlan === 'STARTER' ? 'Up to 50 employees' : selectedPlan === 'GROWTH' ? 'Up to 200 employees' : 'Custom limit'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Trial Price</span>
                      <span className="font-semibold text-slate-900">₹0</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">After Trial</span>
                      <span className="font-semibold text-slate-900">{planRateText}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Billing</span>
                      <span className="font-semibold text-slate-900">Monthly</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs block">Payment Required Now</span>
                      <span className="font-bold text-emerald-600">₹0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  disabled={loading}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleActivateTrial}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Activating Free Trial...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" /> Start Free Trial (Immediate Access)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

