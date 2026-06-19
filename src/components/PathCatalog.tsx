import { useMemo, useState } from 'react';
import type { LearningPath, PathCategory, NodeDepth } from '@/types';
import { getRoadmapRole } from '@/config/roadmaps';

const CATEGORY_ORDER: PathCategory[] = ['Foundations', 'Development', 'Infrastructure', 'Architecture', 'Specializations'];

export default function PathCatalog({
  paths,
  selectedPathId,
  nodeDepths,
  onSelect,
  roadmapGoalId,
}: {
  paths: LearningPath[];
  selectedPathId: string;
  nodeDepths: Record<string, NodeDepth>;
  onSelect: (pathId: string) => void;
  roadmapGoalId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? paths[0];
  const grouped = useMemo(
    () => CATEGORY_ORDER.map((category) => ({
      category,
      paths: paths.filter((path) => (path.category ?? 'Specializations') === category),
    })).filter((group) => group.paths.length),
    [paths],
  );

  return (
    <section className="path-catalog">
      <button className="path-catalog__trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span className="path-catalog__trigger-icon">{selectedPath.icon}</span>
        <span>
          <small>Current path</small>
          <strong>{selectedPath.title}</strong>
        </span>
        <span className="path-catalog__trigger-action">{open ? 'Close' : `Explore ${paths.length} paths`}</span>
      </button>

      {open && (
        <div className="path-catalog__panel">
          {grouped.map((group) => (
            <div key={group.category} className="path-catalog__group">
              <h2>{group.category}</h2>
              <div className="path-catalog__grid">
                {group.paths.map((path) => {
                  const learned = path.nodes.filter((node) => (nodeDepths[node.id] ?? 0) >= 1).length;
                  const percent = Math.round((learned / path.nodes.length) * 100);
                  const recommendations = path.recommendedPathIds
                    ?.map((pathId) => paths.find((candidate) => candidate.id === pathId)?.shortTitle)
                    .filter(Boolean)
                    .join(', ');
                  return (
                    <button
                      key={path.id}
                      className={`path-catalog__card${path.id === selectedPathId ? ' path-catalog__card--active' : ''}`}
                      style={{ '--catalog-color': path.color } as React.CSSProperties}
                      onClick={() => {
                        onSelect(path.id);
                        setOpen(false);
                      }}
                    >
                      <span className="path-catalog__card-icon">{path.icon}</span>
                      <span className="path-catalog__card-body">
                        <strong>{path.title}</strong>
                        {roadmapGoalId && <span className={`roadmap-role roadmap-role--${getRoadmapRole(roadmapGoalId, path.id)}`}>{getRoadmapRole(roadmapGoalId, path.id)}</span>}
                        <small>{path.nodes.length} nodes · {percent}% learned</small>
                        {recommendations && <em>Suggested after: {recommendations}</em>}
                      </span>
                      {path.id === selectedPathId && <span className="path-catalog__current">Current</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
