import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import GeminiErrorCard from '@/components/GeminiErrorCard';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import { useGameState } from '@/context/GameStateContext';
import { getCachedContent, saveCachedContent } from '@/services/contentCacheService';
import { generateFlashcards } from '@/services/geminiService';
import {
  buildReviewPrompt,
  recordSrsReview,
  type DueReview,
  type SrsRating,
} from '@/services/srsService';
import type { Flashcard } from '@/types';

type FlashcardReviewModalProps = {
  review: DueReview;
  onClose: () => void;
  onComplete: () => void;
};

export default function FlashcardReviewModal({
  review,
  onClose,
  onComplete,
}: FlashcardReviewModalProps) {
  const { selectedModel, language } = useGameState();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = await getCachedContent<Flashcard[]>(
        review.nodeId,
        review.depth,
        'flashcards',
        selectedModel,
      );
      if (cached?.length) {
        setCards(cached);
        return;
      }

      const generated = await generateFlashcards(
        buildReviewPrompt(review),
        selectedModel,
        language,
      );
      await saveCachedContent(
        review.nodeId,
        review.depth,
        'flashcards',
        selectedModel,
        generated,
      );
      setCards(generated);
    } catch (loadError) {
      setError(loadError as Error);
    } finally {
      setLoading(false);
    }
  }, [language, review, selectedModel]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentCard = cards[index];
  const progressLabel = useMemo(
    () => cards.length ? `${Math.min(index + 1, cards.length)} / ${cards.length}` : '',
    [cards.length, index],
  );

  const answer = useCallback(async (didRemember: boolean) => {
    const nextRemembered = remembered + (didRemember ? 1 : 0);
    if (index < cards.length - 1) {
      setRemembered(nextRemembered);
      setIndex((current) => current + 1);
      setRevealed(false);
      return;
    }

    setRemembered(nextRemembered);
    setSaving(true);
    const ratio = cards.length ? nextRemembered / cards.length : 0;
    const rating: SrsRating =
      ratio < 0.4 ? 'again' :
      ratio < 0.7 ? 'hard' :
      ratio < 0.9 ? 'good' :
      'easy';
    await recordSrsReview(review.nodeId, review.depth, rating);
    setSaving(false);
    setCompleted(true);
    onComplete();
  }, [cards.length, index, onComplete, remembered, review.depth, review.nodeId]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Flashcards for ${review.title}`}>
      <div className="modal flashcard-modal">
        <div className="modal-header">
          <div className="modal-header__left">
            <span className="modal-node-icon">{review.icon}</span>
            <div>
              <h2 className="modal-title">{review.title}</h2>
              <span className="modal-subtitle">Spaced-repetition flashcards</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close flashcards">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading && <GeminiLoadingState message="Preparing your flashcards..." />}
          {error && <GeminiErrorCard error={error} onRetry={loadCards} />}

          {!loading && !error && completed && (
            <div className="modal-content flashcard-complete">
              <h3>Review scheduled</h3>
              <p>You remembered {remembered} of {cards.length} cards. The next review date was adjusted automatically.</p>
              <button className="btn btn-primary btn-3d" onClick={onClose}>Finish</button>
            </div>
          )}

          {!loading && !error && !completed && currentCard && (
            <div className="modal-content">
              <div className="flashcard-progress">
                <span>{progressLabel}</span>
                <div className="quiz-progress__track">
                  <div
                    className="quiz-progress__fill"
                    style={{ width: `${((index + 1) / cards.length) * 100}%` }}
                  />
                </div>
              </div>

              <button
                className={`flashcard ${revealed ? 'flashcard--revealed' : ''}`}
                onClick={() => setRevealed(true)}
                disabled={revealed}
              >
                <span className="flashcard__label">{revealed ? 'Answer' : 'Question'}</span>
                <strong>{revealed ? currentCard.back : currentCard.front}</strong>
                {revealed && currentCard.codeSnippet && <pre><code>{currentCard.codeSnippet}</code></pre>}
                {!revealed && <small>Tap to reveal</small>}
              </button>

              {revealed && (
                <div className="flashcard-actions">
                  <button className="btn btn-ghost" disabled={saving} onClick={() => answer(false)}>
                    <RotateCcw size={16} /> Again
                  </button>
                  <button className="btn btn-primary btn-3d" disabled={saving} onClick={() => answer(true)}>
                    Remembered
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
