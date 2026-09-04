import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { UserCircle, Mail, Calendar, Star } from 'lucide-react';
import { useMyDoctor, useSubmitReview } from '../../hooks/usePatientQuery';
import { EmptyState } from '../../components/ui/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';

const MyDoctorPage: React.FC = () => {
  const { data: doctor, isLoading, isError } = useMyDoctor();
  const submitReview = useSubmitReview();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReview.mutateAsync({ rating, comment });
      showToast('success', 'Review Submitted', 'Thank you! Your feedback has been recorded.');
      setComment('');
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.response?.data?.message || 'Could not submit review');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>My Doctor</h1>
        <p>Information about your primary care provider</p>
      </div>

      {isError || !doctor ? (
        <Card>
          <EmptyState
            icon={<UserCircle className="w-8 h-8" />}
            title="No Assigned Doctor"
            description="You have not been assigned to a primary care doctor yet. Please contact administration."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                {doctor.fullName?.[0] || 'D'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{doctor.fullName}</h2>
                <p className="text-sm text-slate-500">Primary Care Physician</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Assigned on {new Date(doctor.assignedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Doctor Review</h2>
            <p className="text-sm text-slate-500 mb-4">
              Share your feedback regarding your experience with Dr. {doctor.fullName}. Submitting a new review updates your existing one.
            </p>
            <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rating (1 to 5 stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="p-1 rounded hover:bg-slate-100 transition-colors"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-medium text-slate-600 ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comments</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  rows={3}
                  placeholder="Describe your care experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <Button type="submit" loading={submitReview.isPending}>
                Submit Review
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyDoctorPage;
