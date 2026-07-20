import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/admin';
import type { UserResponse, AssignmentResponse, AuditLogEntry, PageResponse, MedicalRecord } from '../types';

export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.getUsers().then(r => r.data),
  });
}

export function useAssignments() {
  return useQuery<AssignmentResponse[]>({
    queryKey: ['admin', 'assignments'],
    queryFn: () => adminAPI.getAssignments().then(r => r.data),
  });
}

export function useActivateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.activateDoctor(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeactivateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deactivateDoctor(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { patientId: string; doctorId: string }) =>
      adminAPI.createAssignment(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function usePatientRecords(patientId: string, page: number) {
  return useQuery<PageResponse<MedicalRecord>>({
    queryKey: ['admin', 'patient-records', patientId, page],
    queryFn: () => adminAPI.getPatientRecords(patientId, page, 10).then(r => r.data),
    enabled: !!patientId,
  });
}

export function useAuditLog(recordId: string) {
  return useQuery<AuditLogEntry[]>({
    queryKey: ['admin', 'audit-log', recordId],
    queryFn: () => adminAPI.getAuditLog(recordId).then(r => r.data),
    enabled: !!recordId,
  });
}
