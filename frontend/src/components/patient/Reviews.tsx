// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';
import { Star, Edit, Trash2, User } from 'lucide-react';
import Navbar from '../Navbar';
import PatientSidebar from './PatientSidebar';
import { CardSkeleton } from '../ui/Skeleton';

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editData, setEditData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getByPatient(user.id);
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review.id);
    setEditData({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async (reviewId) => {
    if (!editData.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    // Optimistic Update
    const previousReviews = [...reviews];
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, ...editData } : r
    ));
    setEditingReview(null);

    try {
      const response = await reviewAPI.update(reviewId, editData);
      if (response.data.success) {
        toast.success('Review updated successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      // Rollback
      setReviews(previousReviews);
      setEditingReview(reviewId);
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    // Optimistic Update
    const previousReviews = [...reviews];
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    try {
      const response = await reviewAPI.delete(reviewId);
      if (response.data.success) {
        toast.success('Review deleted successfully');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      // Rollback
      setReviews(previousReviews);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating, editable = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => editable && onChange && onChange(star)}
            disabled={!editable}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <PatientSidebar />
        <div className="ml-64 pt-16 min-h-screen bg-slate-50">
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reviews</h1>
            <CardSkeleton count={3} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reviews</h1>

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Dr. {review.doctorName}</h3>
                  <p className="text-sm text-gray-600">{review.specialization}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {editingReview !== review.id && (
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(review)} className="text-blue-600 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {editingReview === review.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  {renderStars(editData.rating, true, (rating) => setEditData({ ...editData, rating }))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={editData.comment}
                    onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingReview(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdate(review.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {renderStars(review.rating)}
                <p className="text-gray-700 mt-3">{review.comment}</p>
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Star size={48} className="mx-auto mb-4 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-sm mt-2">Complete an appointment to leave a review</p>
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
}
