import api from './axios';
import type { UserResponse, MedicalRecord, CreateRecordData, PageResponse } from '../types';

export const doctorAPI = {
  getPatients: () => api.get<UserResponse[]>('/doctor/patients'),
  getPatientRecords: (patientId: string, page = 0, size = 10) =>
    api.get<PageResponse<MedicalRecord>>(`/doctor/patients/${patientId}/records?page=${page}&size=${size}`),
  createRecord: (patientId: string, data: CreateRecordData) =>
    api.post<MedicalRecord>(`/doctor/patients/${patientId}/records`, data),
};
