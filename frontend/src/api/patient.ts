import api from './axios';
import type { MedicalRecord } from '../types';

export const patientAPI = {
  getRecords: () => api.get<MedicalRecord[]>('/patient/records'),
  getRecordById: (recordId: string) => api.get<MedicalRecord>(`/patient/records/${recordId}`),
};
