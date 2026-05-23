import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import AppLayout from './AppLayout';

vi.mock('./Navbar', () => ({
  default: () => <nav aria-label="Main navigation" />,
}));

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="path">{location.pathname}</span>;
}

describe('AppLayout', () => {
  it('renders app content without an auth redirect', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppLayout>
          <CurrentPath />
          <h1>Explore markets</h1>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Explore markets' })).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/');
  });
});
