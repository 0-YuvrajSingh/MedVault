import api from './axios';
import type { MedicalRecord, DoctorInfo, PageResponse } from '../types';

export const patientAPI = {
  getRecords: (page = 0, size = 10) => api.get<PageResponse<MedicalRecord>>(`/patient/records?page=${page}&size=${size}`),
  getRecordById: (recordId: string) => api.get<MedicalRecord>(`/patient/records/${recordId}`),
  getMyDoctor: () => api.get<DoctorInfo>('/patient/my-doctor'),
};
