import { describe, expect, it } from 'vitest';
import { LEARNING_PATHS } from '@/config/paths';
import { ROADMAP_PRESETS, getDefaultRoadmapPathIds } from '@/config/roadmaps';

describe('roadmap presets', () => {
  it('only reference registered paths and include every path in the editable order', () => {
    const validIds = new Set(LEARNING_PATHS.map((path) => path.id));
    for (const preset of ROADMAP_PRESETS) {
      expect([...preset.core, ...preset.recommended].every((id) => validIds.has(id))).toBe(true);
      expect(new Set(getDefaultRoadmapPathIds(preset.id)).size).toBe(LEARNING_PATHS.length);
    }
  });
});
