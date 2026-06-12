import { useCallback, useEffect, useState } from 'react';
import { Brain, Layers, RefreshCw } from 'lucide-react';
import { getDueReviews, type DueReview } from '@/services/srsService';

type SrsReviewSectionProps = {
  refreshKey: number;
  onStartQuiz: (review: DueReview) => void;
  onStartFlashcards: (review: DueReview) => void;
};

export default function SrsReviewSection({
  refreshKey,
  onStartQuiz,
  onStartFlashcards,
}: SrsReviewSectionProps) {
  const [reviews, setReviews] = useState<DueReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setReviews(await getDueReviews());
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews, refreshKey]);

  return (
    <section className="srs-section" aria-labelledby="srs-title">
      <div className="srs-section__header">
        <div>
          <span className="srs-section__eyebrow">Spaced repetition</span>
          <h2 id="srs-title">Reviews due</h2>
        </div>
        <button className="btn btn-ghost btn-sm" disabled={loading} onClick={loadReviews}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card srs-empty">Checking your review schedule...</div>
      ) : reviews.length === 0 ? (
        <div className="card srs-empty">
          <Brain size={24} />
          <div>
            <strong>You are caught up</strong>
            <p>New reviews appear here as completed lessons become due.</p>
          </div>
        </div>
      ) : (
        <div className="srs-review-list">
          {reviews.map((review) => (
            <article className="card srs-review-card" key={review.nodeId}>
              <div className="srs-review-card__top">
                <span className="srs-review-card__icon">{review.icon}</span>
                <div>
                  <strong>{review.title}</strong>
                  <p>
                    Depth {review.depth}
                    {review.accuracy !== null ? ` · ${review.accuracy}% accuracy` : ''}
                    {review.overdueDays > 0 ? ` · ${review.overdueDays}d overdue` : ' · due today'}
                  </p>
                </div>
              </div>
              {review.weakQuestionHints.length > 0 && (
                <p className="srs-review-card__focus">
                  Focus: {review.weakQuestionHints[0]}
                </p>
              )}
              <div className="srs-review-card__actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onStartFlashcards(review)}>
                  <Layers size={16} /> Flashcards
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => onStartQuiz(review)}>
                  <Brain size={16} /> Quick quiz
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
