import { beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from },
}));

describe('waitlist service', () => {
  beforeEach(() => {
    from.mockClear();
    insert.mockReset();
  });

  it('normalizes email before inserting the signup', async () => {
    insert.mockResolvedValue({ error: null });
    const { joinWaitlist } = await import('./waitlist');

    const result = await joinWaitlist({
      email: '  Founder@Example.COM ',
      name: '  Gustavo ',
      source: 'hero',
    });

    expect(result.status).toBe('joined');
    expect(from).toHaveBeenCalledWith('waitlist_signups');
    expect(insert).toHaveBeenCalledWith({
      email: 'founder@example.com',
      name: 'Gustavo',
      source: 'hero',
    });
  });

  it('treats duplicate emails as already joined', async () => {
    insert.mockResolvedValue({ error: { code: '23505' } });
    const { joinWaitlist } = await import('./waitlist');

    const result = await joinWaitlist({ email: 'founder@example.com' });

    expect(result).toEqual({
      status: 'already_joined',
      message: "You're already on the LIME waitlist.",
    });
  });

  it('returns a generic message for unexpected errors', async () => {
    insert.mockResolvedValue({ error: { code: '42501' } });
    const { joinWaitlist } = await import('./waitlist');

    const result = await joinWaitlist({ email: 'founder@example.com' });

    expect(result).toEqual({
      status: 'error',
      message: 'We could not join the waitlist right now. Please try again.',
    });
  });

  it('blocks invalid email before calling Supabase', async () => {
    const { joinWaitlist } = await import('./waitlist');

    const result = await joinWaitlist({ email: 'not-an-email' });

    expect(result.status).toBe('error');
    expect(insert).not.toHaveBeenCalled();
  });
});
