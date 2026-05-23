import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Waitlist from './Waitlist';

const { joinWaitlist } = vi.hoisted(() => ({
  joinWaitlist: vi.fn(),
}));

vi.mock('@/services/waitlist', async () => {
  const actual = await vi.importActual<typeof import('@/services/waitlist')>('@/services/waitlist');
  return {
    ...actual,
    joinWaitlist,
  };
});

describe('Waitlist', () => {
  beforeEach(() => {
    joinWaitlist.mockReset();
  });

  it('renders the waitlist form', () => {
    render(
      <MemoryRouter>
        <Waitlist />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Join the waitlist' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('blocks invalid email before submitting', () => {
    render(
      <MemoryRouter>
        <Waitlist />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Join Waitlist' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
    expect(joinWaitlist).not.toHaveBeenCalled();
  });

  it('submits a valid email and shows success', async () => {
    joinWaitlist.mockResolvedValue({
      status: 'joined',
      message: "You're on the LIME waitlist.",
    });

    render(
      <MemoryRouter>
        <Waitlist />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'founder@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Join Waitlist' }));

    await waitFor(() => expect(joinWaitlist).toHaveBeenCalledWith({
      email: 'founder@example.com',
      name: '',
      source: 'waitlist_page',
    }));
    expect(await screen.findByText("You're on the list.")).toBeInTheDocument();
  });
});
