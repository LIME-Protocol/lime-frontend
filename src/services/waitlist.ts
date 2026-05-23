import { supabase } from '@/integrations/supabase/client';

export type WaitlistResult =
  | { status: 'joined'; message: string }
  | { status: 'already_joined'; message: string }
  | { status: 'error'; message: string };

export interface WaitlistSignupInput {
  email: string;
  name?: string;
  source?: string;
}

export function normalizeWaitlistEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidWaitlistEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeWaitlistEmail(email));
}

export async function joinWaitlist({
  email,
  name,
  source = 'landing',
}: WaitlistSignupInput): Promise<WaitlistResult> {
  const normalizedEmail = normalizeWaitlistEmail(email);

  if (!isValidWaitlistEmail(normalizedEmail)) {
    return {
      status: 'error',
      message: 'Enter a valid email address.',
    };
  }

  const { error } = await supabase
    .from('waitlist_signups')
    .insert({
      email: normalizedEmail,
      name: name?.trim() || null,
      source,
    });

  if (!error) {
    return {
      status: 'joined',
      message: "You're on the LIME waitlist.",
    };
  }

  if (error.code === '23505') {
    return {
      status: 'already_joined',
      message: "You're already on the LIME waitlist.",
    };
  }

  return {
    status: 'error',
    message: 'We could not join the waitlist right now. Please try again.',
  };
}
