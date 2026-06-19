import { LEARNING_PATHS } from '@/config/paths';

export type RoadmapRole = 'core' | 'recommended' | 'optional';

export type RoadmapPreset = {
  id: string;
  title: string;
  description: string;
  core: string[];
  recommended: string[];
};

export const ROADMAP_PRESETS: RoadmapPreset[] = [
  {
    id: 'backend-engineer',
    title: 'Backend Engineer',
    description: 'APIs, data, reliability, testing and architecture.',
    core: ['backend', 'data-structures', 'testing', 'system-design'],
    recommended: ['typescript-advanced', 'design-patterns', 'appsec', 'performance', 'networking'],
  },
  {
    id: 'fullstack-engineer',
    title: 'Full-stack Engineer',
    description: 'Frontend architecture plus production-ready backend skills.',
    core: ['frontend-rendering', 'backend', 'typescript-advanced', 'testing'],
    recommended: ['design-patterns', 'appsec', 'performance', 'git', 'networking'],
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud',
    description: 'Linux, delivery, networking and cloud operations.',
    core: ['linux', 'git', 'networking', 'devops'],
    recommended: ['aws', 'appsec', 'performance', 'system-design', 'backend'],
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    description: 'Applied AI systems backed by strong software fundamentals.',
    core: ['applied-ai', 'backend', 'typescript-advanced', 'data-structures'],
    recommended: ['system-design', 'testing', 'appsec', 'performance', 'design-patterns'],
  },
  {
    id: 'technical-interviews',
    title: 'Technical Interviews',
    description: 'Algorithms, system design and practical engineering depth.',
    core: ['data-structures', 'system-design', 'backend'],
    recommended: ['testing', 'performance', 'design-patterns', 'networking', 'typescript-advanced'],
  },
];

export function getRoadmapPreset(id: string | null) {
  return ROADMAP_PRESETS.find((preset) => preset.id === id);
}

export function getDefaultRoadmapPathIds(id: string): string[] {
  const preset = getRoadmapPreset(id);
  if (!preset) return [];
  const selected = [...preset.core, ...preset.recommended];
  return [...selected, ...LEARNING_PATHS.map((path) => path.id).filter((pathId) => !selected.includes(pathId))];
}

export function getRoadmapRole(goalId: string | null, pathId: string): RoadmapRole {
  const preset = getRoadmapPreset(goalId);
  if (preset?.core.includes(pathId)) return 'core';
  if (preset?.recommended.includes(pathId)) return 'recommended';
  return 'optional';
}

export function orderPathsByRoadmap(pathIds: string[]) {
  if (!pathIds.length) return LEARNING_PATHS;
  const order = new Map(pathIds.map((id, index) => [id, index]));
  return [...LEARNING_PATHS].sort((left, right) =>
    (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(right.id) ?? Number.MAX_SAFE_INTEGER));
}
