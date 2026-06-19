import { describe, expect, it } from 'vitest';
import { normalizeCodingLab } from '@/services/geminiService';

describe('coding lab contract', () => {
  it('enables Sandpack only for executable JS/TS labs with imported Jest tests', () => {
    const lab = normalizeCodingLab({
      instructions: 'Implement sum.',
      boilerplateCode: 'export const sum = () => 0;',
      testCode: "import { sum } from './solution'; test('adds', () => expect(sum(1, 2)).toBe(3));",
      fileName: 'solution.js',
      language: 'javascript',
    });
    expect(lab.runnerMode).toBe('sandpack');
    expect(lab.testFile).toBe('solution.test.js');
  });

  it('falls back to manual when generated tests cannot safely validate code', () => {
    const lab = normalizeCodingLab({
      instructions: 'Inspect a service.',
      boilerplateCode: 'echo ok',
      testCode: 'run this checklist',
      fileName: 'solution.sh',
      language: 'shell',
    });
    expect(lab.runnerMode).toBe('manual');
  });
});
