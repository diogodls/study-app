import { ArrowDown, ArrowUp } from 'lucide-react';
import { getDisplayPathIcon, LEARNING_PATHS } from '@/config/paths';
import { ROADMAP_PRESETS, getDefaultRoadmapPathIds, getRoadmapRole } from '@/config/roadmaps';
import { useGameState } from '@/context/GameStateContext';

export default function RoadmapEditor() {
  const { roadmapGoalId, roadmapPathIds, setRoadmap } = useGameState();
  const selectedIds = roadmapPathIds.length ? roadmapPathIds : LEARNING_PATHS.map((path) => path.id);

  const chooseGoal = (goalId: string) => setRoadmap(goalId, getDefaultRoadmapPathIds(goalId));
  const move = (pathId: string, direction: -1 | 1) => {
    const next = [...selectedIds];
    const index = next.indexOf(pathId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRoadmap(roadmapGoalId, next);
  };
  const toggle = (pathId: string) => {
    const next = selectedIds.includes(pathId) ? selectedIds.filter((id) => id !== pathId) : [...selectedIds, pathId];
    setRoadmap(roadmapGoalId, next);
  };

  return (
    <section className="card roadmap-editor">
      <h2>Career Roadmap</h2>
      <p>Prioritize the catalog without locking any learning path.</p>
      <div className="roadmap-goals">
        {ROADMAP_PRESETS.map((preset) => (
          <button key={preset.id} className={roadmapGoalId === preset.id ? 'active' : ''} onClick={() => chooseGoal(preset.id)}>
            <strong>{preset.title}</strong><small>{preset.description}</small>
          </button>
        ))}
      </div>
      <div className="roadmap-path-list">
        {LEARNING_PATHS.map((path) => {
          const enabled = selectedIds.includes(path.id);
          const position = selectedIds.indexOf(path.id);
          return (
            <div key={path.id} className={enabled ? '' : 'disabled'}>
              <input type="checkbox" checked={enabled} onChange={() => toggle(path.id)} aria-label={`Include ${path.title}`} />
              <span>{getDisplayPathIcon(path.id)} {path.shortTitle}<small>{getRoadmapRole(roadmapGoalId, path.id)}</small></span>
              <button disabled={!enabled || position === 0} onClick={() => move(path.id, -1)}><ArrowUp size={15} /></button>
              <button disabled={!enabled || position === selectedIds.length - 1} onClick={() => move(path.id, 1)}><ArrowDown size={15} /></button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
