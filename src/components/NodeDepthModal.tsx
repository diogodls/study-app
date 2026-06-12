import type { NodeDepth } from '@/types';

type DepthOption = {
  key: 'learn' | 'deepen' | 'master';
  label: string;
  depth: NodeDepth;
  description: string;
};

const DEPTH_OPTIONS: DepthOption[] = [
  { key: 'learn', label: 'Learn', depth: 1, description: 'Dense lesson + 5 quizzes. Unlocks the next node.' },
  { key: 'deepen', label: 'Deepen', depth: 2, description: 'Advanced lesson + 5 hard quizzes + coding lab.' },
  { key: 'master', label: 'Master', depth: 3, description: 'Speed quiz + teach-back for true mastery.' },
];

export default function NodeDepthModal({
  nodeTitle,
  currentDepth,
  completedLab,
  onClose,
  onStart,
}: {
  nodeTitle: string;
  currentDepth: NodeDepth;
  completedLab: boolean;
  onClose: () => void;
  onStart: (mode: 'learn' | 'deepen' | 'master', replay: boolean, replayMode?: 'replay-view' | 'replay-assessment') => void;
}) {
  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal depth-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{nodeTitle}</h2>
            <span className="modal-subtitle">Choose a depth</span>
          </div>
          <button id="depth-modal-close" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body depth-modal__body">
          {DEPTH_OPTIONS.map((option, index) => {
            const requiredDepth = index as NodeDepth;
            const completed = currentDepth >= option.depth;
            const available = currentDepth >= requiredDepth;
            const lockedText = option.depth === 2 ? 'Requires Learn first.' : option.depth === 3 ? 'Requires Deepen first.' : '';

            return (
              <div key={option.key} className={`depth-card ${completed ? 'depth-card--done' : available ? 'depth-card--available' : 'depth-card--locked'}`}>
                <div className="depth-card__meta">
                  <div className="depth-card__header">
                    <strong>{option.label}</strong>
                    <span className="depth-card__status">
                      {completed ? 'Completed' : available ? 'Available' : 'Locked'}
                    </span>
                  </div>
                  <p>{option.description}</p>
                  {option.key === 'deepen' && completedLab && (
                    <span className="depth-card__lab">Coding lab completed ✓</span>
                  )}
                  {!available && <span className="depth-card__locked-reason">🔒 {lockedText}</span>}
                </div>
                <div className="depth-card__actions">
                  {!completed && available && (
                    <button id={`start-${option.key}`} className="btn btn-primary btn-3d" onClick={() => onStart(option.key, false)}>
                      Start {option.label}
                    </button>
                  )}
                  {completed && (
                    <>
                      <button id={`review-${option.key}`} className="btn btn-ghost" onClick={() => onStart(option.key, true, 'replay-view')}>
                        Review
                      </button>
                      <button id={`retry-${option.key}`} className="btn btn-primary btn-3d" onClick={() => onStart(option.key, true, 'replay-assessment')}>
                        Redo
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
