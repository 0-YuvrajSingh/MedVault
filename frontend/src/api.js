import axios from "axios";
import config from "./utils/config";
import errorLogger from "./utils/errorLogger";
import { logger } from "./utils/logger";

const BASE_URL = config.apiBaseUrl;

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to all requests
// NOTE: Token must be injected from AuthContext for each request
// Remove localStorage usage
// Example usage: set token in axios defaults from AuthContext after login

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Check if response has ApiResponse wrapper
    if (response.data && typeof response.data === "object") {
      // Return the actual data or the whole response
      return response;
    }
    return response;
  },
  (error) => {
    // Log API errors to error logging service
    errorLogger.logApiError(
      error,
      error.config?.url || "unknown",
      error.config?.method?.toUpperCase() || "GET"
    );

    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      // Only redirect to login if we're not already on login/register pages
      if (error.response.status === 401) {
        const currentPath = window.location.pathname;
        logger.log("401 Error detected:", {
          path: currentPath,
          url: error.config?.url,
        });
        if (
          !currentPath.includes("/login") &&
          !currentPath.includes("/register") &&
          currentPath !== "/"
        ) {
          logger.log("Redirecting to login due to 401 error");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        // Access forbidden - handled by frontend routes
      }

      // Extract error message from ApiResponse
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    }
    return Promise.reject(error);
  }
);

// Auth utilities

// Inject token from React context into Axios headers
export function injectAxiosToken(token) {
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        delete config.headers["Authorization"];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export function logout() {
  window.location.href = "/login";
}

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  registerPatient: (userData) =>
    api.post("/auth/register", { ...userData, role: "PATIENT" }),
  registerDoctor: (userData) =>
    api.post("/auth/register", { ...userData, role: "DOCTOR" }),
  getCurrentUser: () => api.get("/auth/me"),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
  // Accepts optional { startDate, endDate } as params
  getUsers: (params) => api.get("/admin/users", { params }),
  getUnverifiedDoctors: () => api.get("/admin/doctors/unverified"),
  verifyDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/verify`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getNotificationAnalytics: () => api.get("/admin/analytics/notifications"),
  getEngagementAnalytics: () => api.get("/admin/analytics/engagement"),
  getUserEngagement: (userId) =>
    api.get(`/admin/analytics/engagement/${userId}`),
  getTodayActivity: () => api.get("/admin/analytics/activity/today"),
};

// ============================================
// APPOINTMENT API
// ============================================
export const appointmentAPI = {
  create: (appointmentData) => api.post("/appointments", appointmentData),
  getAll: () => api.get("/appointments"),
  getById: (id) => api.get(`/appointments/${id}`),
  // Use this function and always pass a valid patientId (UUID)
  getPatientAppointments: (patientId) =>
    api.get(`/appointments/patient/${patientId}`),
  getDoctorAppointments: () => api.get("/appointments/doctor/my"),
  getMyAppointments: () => api.get("/appointments/patient/my"),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getPendingByDoctor: (doctorId) =>
    api.get(`/appointments/doctor/${doctorId}/pending`),
  getByStatus: (status) => api.get(`/appointments/status/${status}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) =>
    api.patch(`/appointments/${id}/status`, { status: "CANCELLED" }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// ============================================
// ACCESS REQUEST API
// ============================================
export const accessRequestAPI = {
  create: (requestData) => api.post("/doctor/access-request", requestData),
  getAll: () => api.get("/access-requests"),
  getById: (id) => api.get(`/access-requests/${id}`),
  getByPatient: () => api.get(`/patient/access-requests`),
  getByDoctor: () => api.get(`/doctor/access-requests`),
  getByStatus: (status) => api.get(`/access-requests/status/${status}`),
  approve: (id) =>
    api.put(`/patient/access-request/${id}/respond`, { approve: true }),
  reject: (id) =>
    api.put(`/patient/access-request/${id}/respond`, { approve: false }),
  delete: (id) => api.delete(`/access-requests/${id}`),
};

// ============================================
// DOCUMENT API
// ============================================
export const documentAPI = {
  create: (documentData) => api.post("/documents", documentData),
  getAll: () => api.get("/documents"),
  getById: (id) => api.get(`/documents/${id}`),
  getByPatient: (patientId) => api.get(`/documents/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/documents/doctor/${doctorId}`),
  getByType: (type) => api.get(`/documents/type/${type}`),
  getUnverified: () => api.get("/documents/unverified"),
  verify: (id) => api.put(`/documents/${id}/verify`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ============================================
// DOCUMENT PERMISSION API
// ============================================
export const documentPermissionAPI = {
  create: (permissionData) => api.post("/document-permissions", permissionData),
  getAll: () => api.get("/document-permissions"),
  getById: (id) => api.get(`/document-permissions/${id}`),
  getByDocument: (documentId) =>
    api.get(`/document-permissions/document/${documentId}`),
  getByDoctor: (doctorId) =>
    api.get(`/document-permissions/doctor/${doctorId}`),
  getByPatient: (patientId) =>
    api.get(`/document-permissions/patient/${patientId}`),
  update: (id, data) => api.put(`/document-permissions/${id}`, data),
  delete: (id) => api.delete(`/document-permissions/${id}`),
};

// ============================================
// DOCTOR API
// ============================================
export const doctorAPI = {
  create: (doctorData) => api.post("/doctors", doctorData),
  createProfile: (profileData) => api.post("/doctors/profile", profileData),
  getById: (id) => api.get(`/doctors/${id}`),
  getByUser: (userId) => api.get(`/doctors/user/${userId}`),
  getAll: () => api.get("/doctors"),
  getAllVerified: () => api.get("/doctors/verified"),
  getBySpecialization: (specialization) =>
    api.get(`/doctors/specialization/${specialization}`),
  getMyPatients: () => api.get("/doctors/my-patients"),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
};

// ============================================
// FILE UPLOAD API
// ============================================
export const fileAPI = {
  upload: (file, userId, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("fileType", fileType);
    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadProfilePicture: (file, userId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    return api.post("/files/upload/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMedicalDocument: (file, patientId, documentType, description) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);
    formData.append("documentType", documentType);
    if (description) formData.append("description", description);
    return api.post("/files/upload/medical-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  download: (fileId) =>
    api.get(`/files/download/${fileId}`, { responseType: "blob" }),
};

// ============================================
// MEDICAL RECORD API
// ============================================
export const medicalRecordAPI = {
  create: (recordData) => api.post("/medical-records", recordData),
  getAll: () => api.get("/medical-records"),
  getById: (id) => api.get(`/medical-records/${id}`),
  getPatientRecords: () => api.get("/medical-records/my"),
  getDoctorRecords: () => api.get("/medical-records/doctor/my"),
  getByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/medical-records/doctor/${doctorId}`),
  update: (id, data) => api.put(`/medical-records/${id}`, data),
  delete: (id) => api.delete(`/medical-records/${id}`),
};

// ============================================
// NOTIFICATION API
// ============================================
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  getUnread: () => api.get("/notifications/unread"),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  create: (notificationData) => api.post("/notifications", notificationData),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getStats: () => api.get("/notifications/analytics/stats"),
  getByType: () => api.get("/notifications/analytics/by-type"),
  getRecentActivity: () => api.get("/notifications/analytics/recent-activity"),
};

// ============================================
// PATIENT API
// ============================================
export const patientAPI = {
  create: (patientData) => api.post("/patients", patientData),
  getById: (id) => api.get(`/patients/${id}`),
  getByUser: (userId) => api.get(`/patients/user/${userId}`),
  getAll: () => api.get("/patients"),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// ============================================
// REVIEW API
// ============================================
export const reviewAPI = {
  create: (reviewData) => api.post("/reviews", reviewData),
  getAll: () => api.get("/reviews"),
  getById: (id) => api.get(`/reviews/${id}`),
  getByPatient: (patientId) => api.get(`/reviews/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
  getByRating: (rating) => api.get(`/reviews/rating/${rating}`),
  getDoctorAverageRating: (doctorId) =>
    api.get(`/reviews/doctor/${doctorId}/rating`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ============================================
// SLOT API
// ============================================
export const slotAPI = {
  create: (slotData) => api.post("/slots/create", slotData),
  getMy: () => api.get("/slots/my"),
  getDoctorSlots: (doctorId) => api.get(`/slots/doctor/${doctorId}`),
  getAvailable: (doctorId) => api.get(`/slots/available/${doctorId}`),
  getById: (slotId) => api.get(`/slots/${slotId}`),
  delete: (slotId) => api.delete(`/slots/${slotId}`),
  checkAvailability: (slotId) => api.get(`/slots/check-availability/${slotId}`),
};

export { api };
