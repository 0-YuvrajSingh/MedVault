// ─── Auth & User ─────────────────────────────────────────────────────────────

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: Role;
  name: string;
  profilePicture?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// ─── Patient ─────────────────────────────────────────────────────────────────

export interface Patient {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  profilePicture?: string;
}

// ─── Doctor ──────────────────────────────────────────────────────────────────

export interface Doctor {
  id: number;
  userId: number;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience?: number;
  phone?: string;
  profilePicture?: string;
  rating?: number;
  verified: boolean;
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  time?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface AppointmentRequest {
  doctorId: number;
  date: string;
  slotId: number;
  notes?: string;
}

// ─── Slot ────────────────────────────────────────────────────────────────────

export interface Slot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

// ─── Medical Record ───────────────────────────────────────────────────────────

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  title: string;
  description: string;
  diagnosis?: string;
  prescription?: string;
  severity: SeverityLevel;
  recordDate: string;
  createdAt: string;
  documents?: Document[];
}

// ─── Document ────────────────────────────────────────────────────────────────

export type DocumentType = 'PRESCRIPTION' | 'LAB_REPORT' | 'SCAN' | 'CERTIFICATE' | 'OTHER';

export interface Document {
  id: number;
  patientId: number;
  title: string;
  type: DocumentType;
  fileUrl: string;
  uploadedAt: string;
  permissions?: DocumentPermission[];
}

export interface DocumentPermission {
  id: number;
  documentId: number;
  doctorId: number;
  doctorName?: string;
  accessLevel: 'READ' | 'WRITE';
  grantedAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'APPOINTMENT' | 'RECORD' | 'SYSTEM' | 'ALERT';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  pendingAppointments?: number;
  totalRecords?: number;
  unreadNotifications?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';
