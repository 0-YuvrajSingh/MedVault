import { useQuery } from '@tanstack/react-query';
import { patientAPI } from '../api/patient';
import type { PageResponse, MedicalRecord, DoctorInfo } from '../types';

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
