import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorAPI } from '../api/doctor';
import type { UserResponse, MedicalRecord, CreateRecordData, PageResponse } from '../types';

export function useDoctorPatients() {
  return useQuery<UserResponse[]>({
    queryKey: ['doctor', 'patients'],
    queryFn: () => doctorAPI.getPatients().then(r => r.data),
  });
}

export function usePatientRecords(patientId: string, page: number) {
  return useQuery<PageResponse<MedicalRecord>>({
    queryKey: ['doctor', 'patient-records', patientId, page],
    queryFn: () => doctorAPI.getPatientRecords(patientId, page, 10).then(r => r.data),
    enabled: !!patientId,
  });
}

export function useCreateRecord(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordData) =>
      doctorAPI.createRecord(patientId, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', 'patient-records', patientId] });
    },
  });
}
