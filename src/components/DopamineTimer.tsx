// ============================================================
// DevQuest — Dopamine Timer (Milestone 6.2)
// ============================================================
// Full-screen countdown overlay for timed rewards.
// Persists through tab switches via timerEndsAt timestamp.
// Supports pause/resume and fires alarm at 0:00.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { playAlarm, stopAlarm } from '@/services/soundService';

interface DopamineTimerProps {
  durationMinutes: number;
  rewardName: string;
  onClose: () => void;
}

const MOTIVATIONAL = [
  'You earned this break. Enjoy it fully!',
  'Rest well — great code requires a fresh mind.',
  'Recharge now, conquer tomorrow.',
  'A warrior must rest between battles.',
  'Your brain is consolidating everything you learned.',
];

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DopamineTimer({ durationMinutes, rewardName, onClose }: DopamineTimerProps) {
  const { timerEndsAt, setTimerEndsAt } = useGameState();
  const durationMs = durationMinutes * 60 * 1000;

  // Initialise timerEndsAt on mount (only if not already set from a previous session)
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    // If context already has a future timestamp (resumed from background), use it
    if (!timerEndsAt || timerEndsAt <= Date.now()) {
      setTimerEndsAt(Date.now() + durationMs);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [remaining, setRemaining] = useState<number>(() => {
    if (timerEndsAt && timerEndsAt > Date.now()) return timerEndsAt - Date.now();
    return durationMs;
  });
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);
  const pausedRemaining = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subtitle = useRef(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Tick every second
  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const now = Date.now();
      const ends = timerEndsAt ?? (now + durationMs);
      const rem = ends - now;
      if (rem <= 0) {
        clearInterval(tickRef.current!);
        setRemaining(0);
        setExpired(true);
        setTimerEndsAt(null);
        playAlarm();
      } else {
        setRemaining(rem);
      }
    }, 500); // 500ms gives smooth updates
  }, [timerEndsAt, durationMs, setTimerEndsAt]);

  useEffect(() => {
    if (!paused && !expired) startTick();
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [paused, expired, startTick]);

  // Tab visibility — recalculate from timerEndsAt on refocus
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && timerEndsAt && !paused) {
        const rem = timerEndsAt - Date.now();
        if (rem <= 0) {
          setRemaining(0);
          setExpired(true);
          setTimerEndsAt(null);
          playAlarm();
        } else {
          setRemaining(rem);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [timerEndsAt, paused, setTimerEndsAt]);

  const handlePause = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    pausedRemaining.current = remaining;
    setTimerEndsAt(null);
    setPaused(true);
  }, [remaining, setTimerEndsAt]);

  const handleResume = useCallback(() => {
    const newEnd = Date.now() + pausedRemaining.current;
    setTimerEndsAt(newEnd);
    setPaused(false);
  }, [setTimerEndsAt]);

  const handleClose = useCallback(() => {
    stopAlarm();
    if (tickRef.current) clearInterval(tickRef.current);
    setTimerEndsAt(null);
    onClose();
  }, [setTimerEndsAt, onClose]);

  const pct = Math.max(0, Math.min(100, (remaining / durationMs) * 100));
  const isLow = remaining < 60_000 && !expired; // last 60s

  return (
    <div className="timer-overlay" role="dialog" aria-modal="true" aria-label="Dopamine Timer">
      <div className="timer-card">

        {/* Header */}
        <div className="timer-header">
          <span className="timer-reward-label">🎁 {rewardName}</span>
          {!expired && (
            <button
              id="timer-close-early-btn"
              className="timer-close-btn"
              onClick={handleClose}
              aria-label="Close timer early"
            >
              ✕
            </button>
          )}
        </div>

        {/* Circular progress ring */}
        <div className={`timer-ring-wrapper${isLow ? ' timer-ring-wrapper--low' : ''}`}>
          <svg className="timer-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="timer-ring__track" cx="60" cy="60" r="54" />
            <circle
              className="timer-ring__fill"
              cx="60" cy="60" r="54"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="timer-time">
            {expired ? '🎉' : formatTime(remaining)}
          </div>
        </div>

        {/* Status text */}
        <div className="timer-status">
          {expired ? (
            <>
              <h2 className="timer-expired-title">Time&apos;s up!</h2>
              <p className="timer-expired-sub">Back to studying 🚀</p>
            </>
          ) : paused ? (
            <>
              <h2 className="timer-paused-title">Paused</h2>
              <p className="timer-sub">{subtitle.current}</p>
            </>
          ) : (
            <>
              <h2 className="timer-running-title">Enjoy your break</h2>
              <p className="timer-sub">{subtitle.current}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="timer-actions">
          {expired ? (
            <button id="timer-done-btn" className="btn btn-primary btn-3d" onClick={handleClose}>
              Done — Back to DevQuest →
            </button>
          ) : paused ? (
            <button id="timer-resume-btn" className="btn btn-primary btn-3d" onClick={handleResume}>
              ▶ Resume
            </button>
          ) : (
            <button id="timer-pause-btn" className="btn btn-ghost" onClick={handlePause}>
              ⏸ Pause
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
