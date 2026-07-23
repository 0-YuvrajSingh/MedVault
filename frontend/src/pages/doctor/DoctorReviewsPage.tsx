import React from 'react';
import { Card } from '../../components/ui/Card';
import { Star, MessageSquare } from 'lucide-react';
import { useReviews } from '../../hooks/useReviewsQuery';
import type { ReviewItem } from '../../api/reviews';
import { EmptyState } from '../../components/ui/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const Stars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
};

const ReviewCard: React.FC<{ review: ReviewItem }> = ({ review }) => {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
          {review.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-sm font-semibold text-slate-900">{review.patientName}</h3>
            <Stars rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </Card>
  );
};

const DoctorReviewsPage: React.FC = () => {
  const { data: reviews = [], isLoading, isError } = useReviews();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6 pb-12">
        <div className="page-header">
          <h1>Patient Reviews</h1>
          <p>Unable to load reviews</p>
        </div>
        <Card>
          <EmptyState
            icon={<Star className="w-8 h-8 text-danger-500" />}
            title="Failed to load reviews"
            description="An error occurred while fetching your reviews. Please try again."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Patient Reviews</h1>
        <p>Feedback and ratings from your patients</p>
      </div>

      {reviews.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{avgRating}</div>
              <Stars rating={Math.round(Number(avgRating))} />
              <p className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Overall Rating</span>
              <p className="text-xs text-slate-400">Based on patient feedback over time.</p>
            </div>
          </div>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="w-8 h-8" />}
            title="No Reviews Yet"
            description="You haven't received any patient reviews yet."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorReviewsPage;
