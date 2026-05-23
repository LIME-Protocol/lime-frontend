import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import RoleGate from './RoleGate';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, loading: false }),
}));

vi.mock('@/hooks/use-user-role', () => ({
  useHasRole: () => ({ hasRole: false, isLoading: false }),
}));

describe('RoleGate', () => {
  it('redirects signed-in users without the required role when configured', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RoleGate role="admin" unauthorizedRedirectTo="/app">
                <h1>Admin panel</h1>
              </RoleGate>
            }
          />
          <Route path="/app" element={<h1>Explore markets</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /explore markets/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /admin panel/i })).not.toBeInTheDocument();
  });
});
