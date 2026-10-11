import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HomePage', () => {
  it('shows a successful health payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Service is healthy',
          data: {
            status: 'ok',
            timestamp: '2026-09-10T12:00:00.000Z',
          },
        }),
      }),
    );

    renderHomePage();

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.getByText('2026-09-10T12:00:00.000Z')).toBeInTheDocument();
  });

  it('shows an error when the health request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: 'The requested resource was not found',
          code: 'NOT_FOUND',
        }),
      }),
    );

    renderHomePage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The requested resource was not found',
    );
  });
});
