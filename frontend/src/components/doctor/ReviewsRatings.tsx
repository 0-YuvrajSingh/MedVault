import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import { formatDate, formatDistanceToNow } from '@/utils/dateUtils';
import { Star, User, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import type { Review } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type RatingFilter = 'ALL' | '1' | '2' | '3' | '4' | '5';
type Distribution = Record<1 | 2 | 3 | 4 | 5, number>;

function buildDistribution(reviews: Review[]): Distribution {
  const d: Distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const key = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
    d[key]++;
  });
  return d;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewsRatings() {
  const { user } = useAuth();
  const [reviews,       setReviews]       = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [ratingFilter,  setRatingFilter]  = useState<RatingFilter>('ALL');

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await reviewAPI.getByDoctor(user.id);
      if (res.data.success) {
        const list: Review[] = (res.data.data ?? []).sort(
          (a: Review, b: Review) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(list);
      }
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAverage = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await reviewAPI.getDoctorAverageRating(user.id);
      if (res.data.success) setAverageRating(Number(res.data.data) || 0);
    } catch (err) {
      logger.error('Failed to load average rating', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReviews();
    fetchAverage();
  }, [fetchReviews, fetchAverage]);

  const dist     = buildDistribution(reviews);
  const filtered = ratingFilter === 'ALL'
    ? reviews
    : reviews.filter(r => r.rating === Number(ratingFilter));

  const recommendRate = reviews.length > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
    : 0;
  const recentCount = reviews.filter(r => {
    const d = new Date(r.createdAt);
    const ago = new Date(); ago.setDate(ago.getDate() - 30);
    return d > ago;
  }).length;
  const satisfaction = averageRating >= 4.5 ? 'Excellent' : averageRating >= 4 ? 'Very Good' : averageRating >= 3 ? 'Good' : 'Improving';

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reviews & Ratings</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <p className="text-xs text-neutral-500 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-600 mb-2">
            {Number.isFinite(averageRating) ? averageRating.toFixed(1) : 'N/A'}
          </p>
          <Stars rating={Math.round(averageRating)} />
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
            </div>
            <MessageSquare className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-500 mb-1">5-Star Reviews</p>
              <p className="text-3xl font-bold text-green-600">{dist[5]}</p>
            </div>
            <ThumbsUp className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Rating Distribution</h2>
        <div className="space-y-2.5">
          {([5, 4, 3, 2, 1] as const).map(r => {
            const count = dist[r];
            const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={r} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{r}</span>
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                  <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-neutral-500 w-20 text-right flex-shrink-0">
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="flex flex-wrap border-b border-neutral-200 dark:border-neutral-800">
          {(['ALL', '5', '4', '3', '2', '1'] as const).map(f => (
            <button
              key={f}
              onClick={() => setRatingFilter(f)}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                ratingFilter === f
                  ? 'text-yellow-600 border-yellow-500'
                  : 'text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {f === 'ALL' ? `All (${reviews.length})` : `${f}★ (${dist[Number(f) as 1 | 2 | 3 | 4 | 5]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map(review => (
          <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {review.patientName?.[0] ?? 'P'}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{review.patientName ?? 'Patient'}</p>
                  <p className="text-xs text-neutral-500">{formatDistanceToNow(review.createdAt)}</p>
                </div>
              </div>
              <Stars rating={review.rating} size={16} />
            </div>

            {review.comment && (
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 mb-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {review.comment}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{formatDate(review.createdAt)}</span>
              {(review as any).verified && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <ThumbsUp size={12} /> Verified Patient
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <Star size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No Reviews Found</p>
            <p className="text-sm text-neutral-500">
              {ratingFilter !== 'ALL' ? `No ${ratingFilter}-star reviews yet` : 'Reviews will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Insights */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} />
            <h2 className="text-lg font-bold">Performance Insights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { label: 'Recommendation Rate', value: `${recommendRate}%` },
              { label: 'Recent Reviews (30d)', value: String(recentCount) },
              { label: 'Patient Satisfaction',  value: satisfaction },
            ]).map(i => (
              <div key={i.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-xs text-blue-100 mb-1">{i.label}</p>
                <p className="text-2xl font-bold">{i.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
