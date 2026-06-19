import { describe, expect, it } from 'vitest';
import { getLevel, getProgressToNextLevel } from '@/config/levels';

describe('level progression', () => {
  it('keeps level and progress consistent', () => {
    expect(getLevel(0)).toBe(1);
    const progress = getProgressToNextLevel(500);
    expect(progress.xpIntoLevel).toBeGreaterThanOrEqual(0);
    expect(progress.xpNeededForNext).toBeGreaterThan(0);
  });
});
