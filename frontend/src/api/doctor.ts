import api from './axios';
import type { UserResponse, MedicalRecord, CreateRecordData } from '../types';

export const doctorAPI = {
  getPatients: () => api.get<UserResponse[]>('/doctor/patients'),
  getPatientRecords: (patientId: string) =>
    api.get<MedicalRecord[]>(`/doctor/patients/${patientId}/records`),
  createRecord: (patientId: string, data: CreateRecordData) =>
    api.post<MedicalRecord>(`/doctor/patients/${patientId}/records`, data),
};
