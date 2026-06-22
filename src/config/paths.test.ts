import { describe, expect, it } from 'vitest';
import {
  getDisplayNodeIcon,
  getDisplayPathIcon,
  LEARNING_PATHS,
  validateLearningPaths,
} from '@/config/paths';

describe('learning paths', () => {
  it('have valid unique nodes and prerequisites', () => {
    expect(() => validateLearningPaths(LEARNING_PATHS)).not.toThrow();
  });

  it('use display icons without mojibake', () => {
    for (const path of LEARNING_PATHS) {
      expect(getDisplayPathIcon(path.id)).not.toMatch(/[Ãâð]/);
      for (const node of path.nodes) {
        expect(getDisplayNodeIcon(node)).not.toMatch(/[Ãâð]/);
      }
    }
  });
});
