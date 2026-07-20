import api from './axios';

export interface ReviewItem {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const reviewsAPI = {
  getReviews: () => api.get<ReviewItem[]>('/doctor/reviews'),
};
