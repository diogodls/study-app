import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import { LEARNING_PATHS, isNodeUnlocked } from '@/config/paths';
import type { SkillNode, LearningPath } from '@/types';
import SessionModal from '@/components/SessionModal';

document.title = 'Skill Tree — DevQuest';

// ─────────────────────────────────────────────────────────────
// Path progress pill
// ─────────────────────────────────────────────────────────────
function ProgressPill({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="progress-pill">
      <div className="progress-pill-bar" style={{ width: `${pct}%`, background: color }} />
      <span className="progress-pill-label">{done}/{total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single node card
// ─────────────────────────────────────────────────────────────
type NodeState = 'completed' | 'available' | 'locked';

function NodeCard({
  node,
  state,
  pathColor,
  onClick,
  index,
}: {
  node: SkillNode;
  state: NodeState;
  pathColor: string;
  onClick: () => void;
  index: number;
}) {
  const statusIcon = state === 'completed' ? '✅' : state === 'locked' ? '🔒' : '▶';

  return (
    <div className="node-wrapper">
      {index > 0 && (
        <div className={`node-connector ${state !== 'locked' ? 'node-connector--active' : ''}`}
          style={{ '--node-color': pathColor } as React.CSSProperties}
        />
      )}
      <button
        id={`node-${node.id}`}
        className={`node-card node-card--${state}`}
        style={{ '--node-color': pathColor } as React.CSSProperties}
        onClick={onClick}
        disabled={state === 'locked'}
        aria-label={`${node.title} — ${state}`}
      >
        <span className="node-card__icon" aria-hidden="true">{node.icon}</span>
        <div className="node-card__body">
          <span className="node-card__title">{node.title}</span>
          <span className="node-card__desc">{node.description}</span>
          <span className="node-card__time">~{node.estimatedMinutes} min</span>
        </div>
        <span className="node-card__status" aria-hidden="true">{statusIcon}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Path tab
// ─────────────────────────────────────────────────────────────
function PathTab({
  path,
  active,
  onClick,
}: {
  path: LearningPath;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`path-tab-${path.id}`}
      className={`path-tab ${active ? 'path-tab--active' : ''}`}
      style={{ '--tab-color': path.color } as React.CSSProperties}
      onClick={onClick}
      aria-selected={active}
    >
      <span className="path-tab__icon">{path.icon}</span>
      <span className="path-tab__label">{path.shortTitle}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function SkillTreePage() {
  const { completedNodes, lives } = useGameState();
  const navigate = useNavigate();
  const location = useLocation();

  // Honour startingPathId passed from OnboardingFlow via router state
  const initialPathId =
    (location.state as { startingPathId?: string } | null)?.startingPathId ??
    LEARNING_PATHS[0].id;

  const [selectedPathId, setSelectedPathId] = useState(initialPathId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const path = LEARNING_PATHS.find((p) => p.id === selectedPathId)!;

  const getNodeState = useCallback(
    (node: SkillNode): NodeState => {
      if (completedNodes.includes(node.id)) return 'completed';
      if (isNodeUnlocked(node, completedNodes)) return 'available';
      return 'locked';
    },
    [completedNodes],
  );

  const doneCount = path.nodes.filter((n) => completedNodes.includes(n.id)).length;

  return (
    <div className="page skill-tree-page">
      {/* ── Lives warning banner ─────────────────────────── */}
      {lives === 0 && (
        <div className="banner banner--warning" role="alert">
          <span>💔 You're out of lives!</span>
          <button className="banner__cta" onClick={() => navigate('/practice')}>
            Recover in Arena →
          </button>
        </div>
      )}

      {/* ── Path tabs ────────────────────────────────────── */}
      <div className="path-tabs" role="tablist" aria-label="Learning paths">
        {LEARNING_PATHS.map((p) => (
          <PathTab
            key={p.id}
            path={p}
            active={p.id === selectedPathId}
            onClick={() => setSelectedPathId(p.id)}
          />
        ))}
      </div>

      {/* ── Path header ──────────────────────────────────── */}
      <div
        className="path-header"
        style={{ '--path-color': path.color } as React.CSSProperties}
      >
        <div className="path-header__icon">{path.icon}</div>
        <div className="path-header__info">
          <h1 className="path-header__title">{path.title}</h1>
          <p className="path-header__desc">{path.description}</p>
        </div>
        <ProgressPill done={doneCount} total={path.nodes.length} color={path.color} />
      </div>

      {/* ── Node list ────────────────────────────────────── */}
      <div className="node-list" role="list">
        {path.nodes.map((node, idx) => {
          const state = getNodeState(node);
          return (
            <NodeCard
              key={node.id}
              node={node}
              state={state}
              pathColor={path.color}
              index={idx}
              onClick={() => {
                if (state !== 'locked') setActiveNodeId(node.id);
              }}
            />
          );
        })}
      </div>

      {/* ── Session modal ────────────────────────────────── */}
      {activeNodeId && (
        <SessionModal
          nodeId={activeNodeId}
          pathId={selectedPathId}
          onClose={() => setActiveNodeId(null)}
        />
      )}
    </div>
  );
}
