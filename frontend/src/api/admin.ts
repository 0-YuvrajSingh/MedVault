import api from './axios';
import type { UserResponse, AssignmentResponse, AuditLogEntry, PageResponse, PlatformAuditLog } from '../types';

export const adminAPI = {
  // User listings
  getUsers: () => api.get<UserResponse[]>('/admin/users'),
  getDoctors: () => api.get<UserResponse[]>('/admin/doctors'),
  getPatients: () => api.get<UserResponse[]>('/admin/patients'),

  // Doctor workflow
  approveDoctor: (id: string) => api.post<UserResponse>(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id: string) => api.post<UserResponse>(`/admin/doctors/${id}/reject`),
  deactivateDoctor: (id: string) => api.post<UserResponse>(`/admin/doctors/${id}/deactivate`),

  // Assignment management
  createAssignment: (data: { patientId: string; doctorId: string }) =>
    api.post<AssignmentResponse>('/admin/assignments', data),
  reassignPatient: (assignmentId: string, newDoctorId: string) =>
    api.put<AssignmentResponse>(`/admin/assignments/${assignmentId}`, { newDoctorId }),
  unassignPatient: (assignmentId: string) =>
    api.delete(`/admin/assignments/${assignmentId}`),
  getAssignments: () => api.get<AssignmentResponse[]>('/admin/assignments'),

  // Audit
  getPlatformAuditLogs: (page = 0, size = 20) =>
    api.get<PageResponse<PlatformAuditLog>>(`/admin/audit-logs?page=${page}&size=${size}`),
  getAuditLog: (recordId: string) => api.get<AuditLogEntry[]>(`/admin/records/${recordId}/audit`),
};
