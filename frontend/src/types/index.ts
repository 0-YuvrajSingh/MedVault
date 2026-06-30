// Shared types matching the backend DTOs

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export interface MedicalRecord {
  id: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  createdAt: string;
}

export interface CreateRecordData {
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface AssignmentResponse {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  assignedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  recordId: string;
  performedBy: string;
  performedByName?: string;
  timestamp: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  userId: string;
  exp: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
