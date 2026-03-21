import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { Star, Edit2, Trash2, User, Check, X } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { Review } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientReview extends Review {
  doctorName?:    string;
  specialization?: string;
}

interface EditData { rating: number; comment: string }

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({
  rating, editable = false, onChange,
}: { rating: number; editable?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => editable && onChange?.(s)}
          disabled={!editable}
          className={`transition-transform ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}>
          <Star size={editable ? 22 : 18}
            className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} />
        </button>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reviews() {
  const { user } = useAuth();

  const [reviews,       setReviews]      = useState<PatientReview[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [editingId,     setEditingId]    = useState<number | null>(null);
  const [editData,      setEditData]     = useState<EditData>({ rating: 5, comment: '' });

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await reviewAPI.getByPatient(user.id);
      if (res.data.success) setReviews(res.data.data ?? []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleEdit = (review: PatientReview) => {
    setEditingId(review.id);
    setEditData({ rating: review.rating, comment: review.comment ?? '' });
  };

  const handleUpdate = async (reviewId: number) => {
    if (!editData.comment.trim()) { toast.error('Please provide a comment'); return; }

    const snapshot = [...reviews];
    // Optimistic update
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...editData } : r));
    setEditingId(null);

    try {
      const res = await reviewAPI.update(reviewId, editData);
      if (!res.data.success) throw new Error('Update failed');
      toast.success('Review updated');
    } catch {
      setReviews(snapshot);
      setEditingId(reviewId);
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) return;

    const snapshot = [...reviews];
    // Optimistic update
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    try {
      const res = await reviewAPI.delete(reviewId);
      if (!res.data.success) throw new Error('Delete failed');
      toast.success('Review deleted');
    } catch {
      setReviews(snapshot);
      toast.error('Failed to delete review');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Reviews</h1>
      <CardSkeleton count={3} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Reviews</h1>

      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white text-sm">Dr. {review.doctorName}</p>
                  {review.specialization && <p className="text-xs text-neutral-500">{review.specialization}</p>}
                  <p className="text-xs text-neutral-400 mt-0.5">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {editingId !== review.id && (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(review)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Edit mode */}
            {editingId === review.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Rating</label>
                  <StarRating rating={editData.rating} editable onChange={r => setEditData(prev => ({ ...prev, rating: r }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Comment</label>
                  <textarea
                    value={editData.comment}
                    onChange={e => setEditData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={3}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={() => handleUpdate(review.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div>
                <StarRating rating={review.rating} />
                {review.comment && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{review.comment}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <Star size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">No reviews yet</p>
            <p className="text-sm text-neutral-400">Complete an appointment to leave a review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
