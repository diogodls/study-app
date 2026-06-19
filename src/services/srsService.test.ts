import { describe, expect, it } from 'vitest';
import { computeNextSrsEntry } from '@/services/srsService';

describe('SRS scheduling', () => {
  it('resets failed reviews to one day', () => {
    expect(computeNextSrsEntry(null, 'again', 1).intervalDays).toBe(1);
  });

  it('increases repetition after a successful review', () => {
    expect(computeNextSrsEntry(null, 'good', 2).repetitionCount).toBe(1);
  });
});
