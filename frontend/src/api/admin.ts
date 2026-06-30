import api from './axios';
import type { UserResponse, AssignmentResponse, AuditLogEntry, MedicalRecord, PageResponse } from '../types';

export const adminAPI = {
  getUsers: () => api.get<UserResponse[]>('/admin/users'),
  activateDoctor: (id: string) => api.patch<UserResponse>(`/admin/doctors/${id}/activate`),
  deactivateDoctor: (id: string) => api.patch<UserResponse>(`/admin/doctors/${id}/deactivate`),
  createAssignment: (data: { patientId: string; doctorId: string }) =>
    api.post('/admin/assignments', data),
  getAssignments: () => api.get<AssignmentResponse[]>('/admin/assignments'),
  getPatientRecords: (patientId: string, page = 0, size = 10) => api.get<PageResponse<MedicalRecord>>(`/admin/patients/${patientId}/records?page=${page}&size=${size}`),
  getAuditLog: (recordId: string) => api.get<AuditLogEntry[]>(`/admin/records/${recordId}/audit`),
};
