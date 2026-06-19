import { describe, expect, it } from 'vitest';
import { LEARNING_PATHS, validateLearningPaths } from '@/config/paths';

describe('learning paths', () => {
  it('have valid unique nodes and prerequisites', () => {
    expect(() => validateLearningPaths(LEARNING_PATHS)).not.toThrow();
  });
});
