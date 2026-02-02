'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const demoFormSchema = {
  name: (v: string) => (v.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
  email: (v: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v) ? null : 'Please enter a valid email address';
  },
  company: (v: string) => (v.trim().length >= 2 ? null : 'Company name is required'),
};

interface DemoRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoRequestModal({ open, onOpenChange }: DemoRequestModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameError = demoFormSchema.name(formData.name);
    const emailError = demoFormSchema.email(formData.email);
    const companyError = demoFormSchema.company(formData.company);
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (companyError) newErrors.company = companyError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call - replace with actual endpoint when ready
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSuccess(true);
      toast({
        title: "We'll be in touch soon!",
        description: 'Our team will reach out within 24 hours to schedule your demo.',
      });
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
        setErrors({});
      }, 1500);
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      if (isSuccess) {
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
        setErrors({});
        setIsSuccess(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a demo</DialogTitle>
          <DialogDescription>
            Schedule a personalized walkthrough for your organization. No credit card required.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Request received!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll be in touch within 24 hours to schedule your demo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Full name *</Label>
              <Input
                id="demo-name"
                placeholder="John Smith"
                value={formData.name}
                onChange={handleChange('name')}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-email">Work email *</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-company">Company name *</Label>
              <Input
                id="demo-company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={handleChange('company')}
                className={errors.company ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-phone">Phone (optional)</Label>
              <Input
                id="demo-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange('phone')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-message">Message (optional)</Label>
              <textarea
                id="demo-message"
                placeholder="Tell us about your team size and requirements..."
                value={formData.message}
                onChange={handleChange('message')}
                disabled={isSubmitting}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request demo'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
