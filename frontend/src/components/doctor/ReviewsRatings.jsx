import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../api';
import { toast } from '../../utils/toast';
import logger from '../../utils/logger';
import { formatDate, formatDistanceToNow } from '../../utils/dateUtils';
import { Star, User, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';

export default function ReviewsRatings() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('ALL');

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getByDoctor(user.id);
      if (response.data.success) {
        const reviewsList = response.data.data || [];
        reviewsList.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
        setReviews(reviewsList);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await reviewAPI.getDoctorAverageRating(user.id);
      if (response.data.success) {
        setAverageRating(response.data.data || 0);
      }
    } catch (err) {
      logger.error('Failed to load average rating');
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const getFilteredReviews = () => {
    if (ratingFilter === 'ALL') return reviews;
    return reviews.filter(review => review.rating === parseInt(ratingFilter));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const ratingDistribution = getRatingDistribution();
  const filteredReviews = getFilteredReviews();

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reviews & Ratings</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-4xl font-bold text-yellow-600">{Number.isFinite(averageRating) ? averageRating.toFixed(1) : 'N/A'}</p>
            </div>
            <Star className="text-yellow-400 fill-yellow-400" size={48} />
          </div>
          {renderStars(Math.round(averageRating))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reviews</p>
              <p className="text-4xl font-bold text-blue-600">{reviews.length}</p>
            </div>
            <MessageSquare className="text-blue-600" size={48} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">5-Star Reviews</p>
              <p className="text-4xl font-bold text-green-600">{ratingDistribution[5]}</p>
            </div>
            <ThumbsUp className="text-green-600" size={48} />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-semibold text-gray-700">{rating}</span>
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setRatingFilter('ALL')}
            className={`px-6 py-3 font-semibold transition-colors ${
              ratingFilter === 'ALL' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating.toString())}
              className={`px-6 py-3 font-semibold transition-colors ${
                ratingFilter === rating.toString() 
                  ? 'text-yellow-600 border-b-2 border-yellow-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {rating} ★ ({ratingDistribution[rating]})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{review.patientName}</h3>
                  <p className="text-sm text-gray-600">{formatDistanceToNow(review.reviewDate)}</p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            {review.comment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatDate(review.reviewDate)}</span>
              {review.verified && (
                <span className="flex items-center gap-1 text-green-600">
                  <ThumbsUp size={14} />
                  Verified Patient
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Star size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">
              {ratingFilter !== 'ALL' 
                ? `No ${ratingFilter}-star reviews yet` 
                : 'Reviews from patients will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Insights */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 mt-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={32} />
            <h2 className="text-2xl font-bold">Performance Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-sm opacity-90">Recommendation Rate</p>
              <p className="text-3xl font-bold">
                {reviews.length > 0 
                  ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-sm opacity-90">Recent Reviews (30d)</p>
              <p className="text-3xl font-bold">
                {reviews.filter(r => {
                  const reviewDate = new Date(r.reviewDate);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return reviewDate > thirtyDaysAgo;
                }).length}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-sm opacity-90">Patient Satisfaction</p>
              <p className="text-3xl font-bold">
                {averageRating >= 4.5 ? 'Excellent' : averageRating >= 4 ? 'Very Good' : averageRating >= 3 ? 'Good' : 'Improving'}
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
