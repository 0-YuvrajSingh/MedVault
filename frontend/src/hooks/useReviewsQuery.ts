import { useQuery } from '@tanstack/react-query';
import { reviewsAPI } from '../api/reviews';
import type { ReviewItem } from '../api/reviews';

export function useReviews() {
  return useQuery<ReviewItem[]>({
    queryKey: ['doctor', 'reviews'],
    queryFn: () => reviewsAPI.getReviews().then(r => r.data),
  });
}
