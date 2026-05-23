import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Navbar from './Navbar';

let user: null | { email?: string } = null;
let roles: string[] = [];

interface MockAuthState {
  user: typeof user;
  signOut: () => void;
}

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: MockAuthState) => unknown) => selector({
    user,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-user-role', () => ({
  useUserRoles: () => ({ data: roles, isLoading: false }),
}));

vi.mock('@/hooks/use-wallet', () => ({
  useBalances: () => ({ data: [] }),
}));

vi.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({ theme: 'dark', toggle: vi.fn() }),
}));

vi.mock('@/hooks/use-markets', () => ({
  useMarkets: () => ({ data: [] }),
}));

vi.mock('@/components/layout/NotificationBell', () => ({
  default: () => <button>Notifications</button>,
}));

describe('Navbar', () => {
  beforeEach(() => {
    user = null;
    roles = [];
  });

  it('hides the admin control panel link from signed-in non-admin users', () => {
    user = { email: 'trader@example.com' };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: /control panel/i })).not.toBeInTheDocument();
  });
});
