import api from './axios';
import type { UserResponse, AssignmentResponse, AuditLogEntry } from '../types';

export const adminAPI = {
  getUsers: () => api.get<UserResponse[]>('/admin/users'),
  activateDoctor: (id: string) => api.patch<UserResponse>(`/admin/doctors/${id}/activate`),
  deactivateDoctor: (id: string) => api.patch<UserResponse>(`/admin/doctors/${id}/deactivate`),
  createAssignment: (data: { patientId: string; doctorId: string }) =>
    api.post('/admin/assignments', data),
  getAssignments: () => api.get<AssignmentResponse[]>('/admin/assignments'),
  getAuditLog: (recordId: string) => api.get<AuditLogEntry[]>(`/admin/records/${recordId}/audit`),
};
