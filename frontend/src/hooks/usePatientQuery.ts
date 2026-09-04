import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../api/patient';
import type { PageResponse, MedicalRecord, DoctorInfo, CreateReviewData, ReviewResponse } from '../types';

export function usePatientRecords(page: number) {
  return useQuery<PageResponse<MedicalRecord>>({
    queryKey: ['patient', 'records', page],
    queryFn: () => patientAPI.getRecords(page, 10).then(r => r.data),
  });
}

export function useMyDoctor() {
  return useQuery<DoctorInfo>({
    queryKey: ['patient', 'my-doctor'],
    queryFn: () => patientAPI.getMyDoctor().then(r => r.data),
    retry: false,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation<ReviewResponse, Error, CreateReviewData>({
    mutationFn: (data: CreateReviewData) => patientAPI.submitReview(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', 'my-doctor'] });
      qc.invalidateQueries({ queryKey: ['patient', 'timeline'] });
    },
  });
}
