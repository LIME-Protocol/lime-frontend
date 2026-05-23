CREATE TABLE public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text NOT NULL DEFAULT 'landing',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.waitlist_signups TO anon, authenticated;

CREATE POLICY "Anyone can join the waitlist"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email = lower(trim(email))
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND length(source) BETWEEN 1 AND 80
  AND (name IS NULL OR length(name) <= 120)
);
