import type { User } from './types';

/** True when the user still needs the post-invite profile step. */
export function needsProfileCompletion(user: Pick<User, 'profileComplete'> | null | undefined): boolean {
  return user?.profileComplete === false;
}

export function postAuthRedirectPath(user: Pick<User, 'profileComplete'> | null | undefined): string {
  return needsProfileCompletion(user) ? '/auth/complete-profile' : '/dashboard';
}

/** Org invite password flow always continues to profile completion. */
export const ORG_INVITE_PROFILE_PATH = '/auth/complete-profile';

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
};

export function formatGenderLabel(gender?: string | null): string {
  if (!gender) return 'Not provided';
  return GENDER_LABELS[gender] ?? gender.replace(/_/g, ' ');
}

export function formatProfileDate(dateKey?: string | null): string {
  if (!dateKey) return 'Not provided';
  const normalized = dateKey.length >= 10 ? dateKey.slice(0, 10) : dateKey;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return dateKey;
  }
  const [y, m, d] = normalized.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
