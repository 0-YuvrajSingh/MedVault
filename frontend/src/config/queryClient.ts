// @ts-nocheck
import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 * Centralized configuration for API state management
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: how long unused data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchOnMount: false, // Don't refetch on component mount if data exists
      
      // Error handling
      throwOnError: false, // Handle errors in components
    },
    mutations: {
      // Retry failed mutations
      retry: false, // Don't retry mutations by default
      
      // Error handling
      throwOnError: false,
    },
  },
});

/**
 * Query keys for consistent cache management
 * Organized by feature/entity
 */
export const queryKeys = {
  // Auth
  auth: {
    currentUser: ['auth', 'currentUser'],
  },
  
  // Appointments
  appointments: {
    all: ['appointments'],
    list: (filters) => ['appointments', 'list', filters],
    detail: (id) => ['appointments', 'detail', id],
    patient: (patientId) => ['appointments', 'patient', patientId],
    doctor: (doctorId) => ['appointments', 'doctor', doctorId],
    byStatus: (status) => ['appointments', 'status', status],
  },
  
  // Medical Records
  records: {
    all: ['records'],
    list: (patientId) => ['records', 'list', patientId],
    detail: (id) => ['records', 'detail', id],
    byType: (type) => ['records', 'type', type],
  },
  
  // Doctors
  doctors: {
    all: ['doctors'],
    list: (filters) => ['doctors', 'list', filters],
    detail: (id) => ['doctors', 'detail', id],
    available: (date) => ['doctors', 'available', date],
    unverified: ['doctors', 'unverified'],
  },
  
  // Patients
  patients: {
    all: ['patients'],
    list: (filters) => ['patients', 'list', filters],
    detail: (id) => ['patients', 'detail', id],
  },
  
  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'],
    stats: ['admin', 'stats'],
    users: ['admin', 'users'],
    analytics: ['admin', 'analytics'],
  },
  
  // Notifications
  notifications: {
    all: ['notifications'],
    unread: ['notifications', 'unread'],
  },
  
  // Access Requests
  accessRequests: {
    all: ['accessRequests'],
    list: (filters) => ['accessRequests', 'list', filters],
    detail: (id) => ['accessRequests', 'detail', id],
  },
};

export default queryClient;
