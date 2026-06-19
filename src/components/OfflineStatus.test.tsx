import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OfflineStatus from '@/components/OfflineStatus';

describe('OfflineStatus', () => {
  it('shows a clear offline state', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    render(<OfflineStatus />);
    expect(await screen.findByText('Offline')).toBeInTheDocument();
  });
});
