import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import { LEARNING_PATHS, isNodeUnlocked } from '@/config/paths';
import type { SkillNode, NodeDepth, SessionMode } from '@/types';
import SessionModal from '@/components/SessionModal';
import NodeDepthModal from '@/components/NodeDepthModal';
import PathCatalog from '@/components/PathCatalog';
import GlobalNodeSearch from '@/components/GlobalNodeSearch';
import SkillAssessmentModal from '@/components/SkillAssessmentModal';
import { getAssessmentStatuses } from '@/services/assessmentService';

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
  depth,
  pathColor,
  onClick,
  index,
  testedOut,
  highlighted,
}: {
  node: SkillNode;
  state: NodeState;
  depth: NodeDepth;
  pathColor: string;
  onClick: () => void;
  index: number;
  testedOut: boolean;
  highlighted: boolean;
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
        className={`node-card node-card--${state}${highlighted ? ' node-card--highlighted' : ''}`}
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
          {testedOut && <span className="node-card__tested">Tested out</span>}
          <span className="node-card__depth-dots" aria-label={`Depth ${depth} of 3`}>
            {[1, 2, 3].map((value) => (
              <span key={value} className={`node-card__depth-dot ${depth >= value ? 'node-card__depth-dot--on' : ''}`} />
            ))}
          </span>
        </div>
        <span className="node-card__status" aria-hidden="true">{statusIcon}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Path tab
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function SkillTreePage() {
  const { completedNodes, nodeDepths, completedLabs, testedOutNodes, lives, selectedPathId: savedPathId, setSelectedPath, applyTestedOutNodes } = useGameState();
  const navigate = useNavigate();
  const location = useLocation();

  // Honour startingPathId passed from OnboardingFlow via router state
  const initialPathId =
    (location.state as { startingPathId?: string } | null)?.startingPathId ??
    savedPathId;

  const [selectedPathId, setSelectedPathId] = useState(initialPathId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [sessionConfig, setSessionConfig] = useState<{ nodeId: string; depth: NodeDepth; mode: SessionMode; isReplay: boolean } | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentPassed, setAssessmentPassed] = useState<Set<string>>(new Set());
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

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

  useEffect(() => {
    void getAssessmentStatuses().then((statuses) => {
      setAssessmentPassed(new Set(Array.from(statuses.entries()).filter(([, value]) => value.passed).map(([pathId]) => pathId)));
    });
  }, []);

  useEffect(() => {
    const focusNodeId = (location.state as { focusNodeId?: string } | null)?.focusNodeId;
    if (!focusNodeId) return;
    const targetPath = LEARNING_PATHS.find((candidate) => candidate.nodes.some((node) => node.id === focusNodeId));
    if (!targetPath) return;
    setSelectedPathId(targetPath.id);
    setSelectedPath(targetPath.id);
    setHighlightedNodeId(focusNodeId);
    window.setTimeout(() => {
      document.getElementById(`node-${focusNodeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const node = targetPath.nodes.find((candidate) => candidate.id === focusNodeId);
      if (node && isNodeUnlocked(node, completedNodes)) setActiveNodeId(focusNodeId);
    }, 100);
    window.setTimeout(() => setHighlightedNodeId(null), 2500);
  }, [location.state, completedNodes, setSelectedPath]);

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

      <GlobalNodeSearch
        completedNodes={completedNodes}
        nodeDepths={nodeDepths}
        onSelect={(result) => {
          setSelectedPathId(result.pathId);
          setSelectedPath(result.pathId);
          setHighlightedNodeId(result.node.id);
          window.setTimeout(() => document.getElementById(`node-${result.node.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
          if (result.status !== 'locked') setActiveNodeId(result.node.id);
          if (result.status === 'locked') {
            const requirements = result.node.prerequisiteIds
              .map((id) => LEARNING_PATHS.flatMap((candidate) => candidate.nodes).find((node) => node.id === id)?.title ?? id)
              .join(', ');
            setLockedNotice(`Complete Learn in ${requirements} to unlock ${result.node.title}.`);
          } else {
            setLockedNotice(null);
          }
          window.setTimeout(() => setHighlightedNodeId(null), 2500);
        }}
      />
      {lockedNotice && <div className="search-lock-notice" role="status">🔒 {lockedNotice}</div>}

      {/* ── Path tabs ────────────────────────────────────── */}
      <PathCatalog
        paths={LEARNING_PATHS}
        selectedPathId={selectedPathId}
        nodeDepths={nodeDepths}
        onSelect={(pathId) => {
          setSelectedPathId(pathId);
          setSelectedPath(pathId);
        }}
      />

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
        {assessmentPassed.has(path.id) ? (
          <span className="path-assessment-tested">Level tested</span>
        ) : (
          <button className="btn btn-ghost btn-sm path-assessment-btn" onClick={() => setAssessmentOpen(true)}>Test your level</button>
        )}
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
              depth={nodeDepths[node.id] ?? 0}
              pathColor={path.color}
              index={idx}
              testedOut={testedOutNodes.includes(node.id)}
              highlighted={highlightedNodeId === node.id}
              onClick={() => {
                if (state !== 'locked') setActiveNodeId(node.id);
              }}
            />
          );
        })}
      </div>

      {/* ── Session modal ────────────────────────────────── */}
      {activeNodeId && (
        <NodeDepthModal
          nodeTitle={path.nodes.find((node) => node.id === activeNodeId)?.title ?? 'Node'}
          currentDepth={nodeDepths[activeNodeId] ?? 0}
          completedLab={completedLabs.includes(activeNodeId)}
          onClose={() => setActiveNodeId(null)}
          onStart={(depthMode, replay, replayMode) => {
            const depthMap: Record<'learn' | 'deepen' | 'master', NodeDepth> = { learn: 1, deepen: 2, master: 3 };
            setSessionConfig({
              nodeId: activeNodeId,
              depth: depthMap[depthMode],
              mode: replay ? (replayMode ?? 'replay-assessment') : depthMode,
              isReplay: replay,
            });
            setActiveNodeId(null);
          }}
        />
      )}

      {sessionConfig && (
        <SessionModal
          nodeId={sessionConfig.nodeId}
          pathId={selectedPathId}
          depth={sessionConfig.depth}
          mode={sessionConfig.mode}
          isReplay={sessionConfig.isReplay}
          onClose={() => setSessionConfig(null)}
        />
      )}

      {assessmentOpen && (
        <SkillAssessmentModal
          path={path}
          onClose={() => setAssessmentOpen(false)}
          onPassed={(nodeIds) => {
            applyTestedOutNodes(nodeIds);
            setAssessmentPassed((current) => new Set(current).add(path.id));
          }}
        />
      )}
    </div>
  );
}
