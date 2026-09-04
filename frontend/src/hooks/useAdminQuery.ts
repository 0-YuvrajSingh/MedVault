import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/admin';
import type { UserResponse, AssignmentResponse, AuditLogEntry, PageResponse, MedicalRecord, PlatformAuditLog } from '../types';

export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.getUsers().then(r => r.data),
  });
}

export function useDoctors() {
  return useQuery<UserResponse[]>({
    queryKey: ['admin', 'doctors'],
    queryFn: () => adminAPI.getDoctors().then(r => r.data),
  });
}

export function useAdminPatients() {
  return useQuery<UserResponse[]>({
    queryKey: ['admin', 'patients'],
    queryFn: () => adminAPI.getPatients().then(r => r.data),
  });
}

export function useAssignments() {
  return useQuery<AssignmentResponse[]>({
    queryKey: ['admin', 'assignments'],
    queryFn: () => adminAPI.getAssignments().then(r => r.data),
  });
}

export function useApproveDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.approveDoctor(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useRejectDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.rejectDoctor(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useDeactivateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deactivateDoctor(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'doctors'] });
    },
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { patientId: string; doctorId: string }) =>
      adminAPI.createAssignment(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments'] });
    },
  });
}

export function useReassignPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, newDoctorId }: { assignmentId: string; newDoctorId: string }) =>
      adminAPI.reassignPatient(assignmentId, newDoctorId).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments'] });
    },
  });
}

export function useUnassignPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => adminAPI.unassignPatient(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments'] });
    },
  });
}

export function usePlatformAuditLogs(page = 0, size = 20) {
  return useQuery<PageResponse<PlatformAuditLog>>({
    queryKey: ['admin', 'platform-audit', page],
    queryFn: () => adminAPI.getPlatformAuditLogs(page, size).then(r => r.data),
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
