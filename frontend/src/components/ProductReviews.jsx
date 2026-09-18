import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, Edit2, Trash2, CheckCircle, Send, X } from 'lucide-react';
import * as api from '../services/api';

// ── Star rating input ──────────────────────────────────────────────────────────
function StarInput({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              (hovered || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Rating distribution bar ────────────────────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-slate-600 font-semibold text-right">{star}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-slate-500 font-medium">{count}</span>
    </div>
  );
}

// ── Single review card ─────────────────────────────────────────────────────────
function ReviewCard({ review, isOwn, onDelete }) {
  const initials = (review.profiles?.full_name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-extrabold flex items-center justify-center text-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 text-sm">
                {review.profiles?.full_name || 'Customer'}
              </p>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Verified Purchase
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(review.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {review.title && (
        <h5 className="font-bold text-slate-900 text-sm mb-1">{review.title}</h5>
      )}
      {review.body && (
        <p className="text-slate-600 text-sm leading-relaxed">{review.body}</p>
      )}
    </div>
  );
}

// ── Main ProductReviews component ─────────────────────────────────────────────
export default function ProductReviews({ productId, productRating, productReviewsCount }) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(productReviewsCount || 0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Eligibility
  const [eligibility, setEligibility] = useState(null); // null | { eligible, reason, qualifying_order_id }
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // Review form
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Current user (from localStorage)
  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('alphonsa_user') || '{}');
      return u.id || null;
    } catch { return null; }
  })();

  const isLoggedIn = !!localStorage.getItem('alphonsa_token');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProductReviews(productId, page, 10);
      if (res.success) {
        setReviews(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setEligibilityLoading(true);
    api.checkReviewEligibility(productId)
      .then(res => { if (res.success) setEligibility(res.data); })
      .catch(() => {})
      .finally(() => setEligibilityLoading(false));
  }, [productId, isLoggedIn]);

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const avgRating = productRating || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Please select a star rating.'); return; }
    if (!eligibility?.qualifying_order_id) { setSubmitError('No qualifying order found.'); return; }

    setSubmitting(true);
    setSubmitError('');
    setSubmitMsg('');

    try {
      await api.submitReview({
        product_id: productId,
        order_id: eligibility.qualifying_order_id,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
      });
      setSubmitMsg('✅ Thank you! Your review has been submitted for moderation.');
      setShowForm(false);
      setRating(0); setTitle(''); setBody('');
      // Refresh eligibility so form won't show again
      setEligibility({ eligible: false, reason: 'already_reviewed' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotal((t) => Math.max(0, t - 1));
      setEligibility(null); // re-check eligibility
    } catch (err) {
      alert(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h3 className="font-heading font-extrabold text-2xl text-slate-900">
          Customer Reviews
          {total > 0 && <span className="text-base font-semibold text-slate-400 ml-2">({total})</span>}
        </h3>

        {/* CTA */}
        {isLoggedIn && eligibility?.eligible && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition shadow-md flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Write a Review
          </button>
        )}
        {!isLoggedIn && (
          <p className="text-sm text-slate-500">
            <a href="/auth" className="text-primary font-semibold hover:underline">Sign in</a> and purchase this product to leave a review.
          </p>
        )}
        {isLoggedIn && !eligibilityLoading && eligibility && !eligibility.eligible && (
          <p className="text-sm text-slate-400 italic">
            {eligibility.reason === 'already_reviewed' && 'You have already reviewed this product.'}
            {eligibility.reason === 'product_not_purchased' && 'Purchase this product to write a review.'}
            {eligibility.reason === 'no_qualifying_order' && 'Purchase this product to write a review.'}
          </p>
        )}
      </div>

      {/* Submitted confirmation */}
      {submitMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 mb-6 text-sm font-medium">
          {submitMsg}
        </div>
      )}

      {/* Summary + Distribution */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-center shrink-0">
            <p className="text-6xl font-extrabold text-slate-900">{Number(avgRating).toFixed(1)}</p>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1 font-medium">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-2">
            {distribution.map((d) => (
              <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-bold text-slate-900 text-lg">Write Your Review</h4>
            <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rating *</label>
              <StarInput value={rating} onChange={setRating} disabled={submitting} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Review Title</label>
              <input
                type="text"
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Review</label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share what you liked or didn't like..."
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                disabled={submitting}
              />
            </div>
            {submitError && (
              <p className="text-red-600 text-sm font-medium">{submitError}</p>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 animate-pulse h-28 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-100">
          <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 mb-1">No reviews yet</h4>
          <p className="text-slate-400 text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={review.user_id === currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Page {page}</span>
          <button
            disabled={page * 10 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
