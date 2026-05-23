import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Landing from '@/pages/Landing';

describe('Landing', () => {
  it('positions LIME as a continuous-payoff prediction market', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {
      name: /a prediction market, but with a continuous payoff/i,
    })).toBeInTheDocument();
    expect(screen.getAllByText(/Anthropic IPO/i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText(/Binary prediction markets/i)).toBeInTheDocument();
    expect(screen.getByText(/Linear LIME markets/i)).toBeInTheDocument();
  });

  it('uses softer market-design framing in the primary navigation', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: 'Landing navigation' });
    expect(within(nav).getByRole('link', { name: 'Market design' })).toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: 'Protocol' })).not.toBeInTheDocument();
  });

  it('routes repeated conversion CTAs to the waitlist', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const waitlistLinks = screen
      .getAllByRole('link', { name: /join/i })
      .filter((link) => link.getAttribute('href') === '/waitlist');

    expect(waitlistLinks.length).toBeGreaterThanOrEqual(4);
  });

  it('smooth scrolls to the explainer from the hero CTA', () => {
    const scrollIntoView = vi.fn();
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: /see how it works/i }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(replaceState).toHaveBeenCalledWith(null, '', '#how-it-works');

    replaceState.mockRestore();
  });
});
