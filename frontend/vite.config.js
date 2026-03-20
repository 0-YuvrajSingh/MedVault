import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [react()],

  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // Data fetching
          "vendor-query": ["@tanstack/react-query"],

          // UI / styling utilities
          "vendor-ui": ["axios"],

          // Admin chunk — lazy load separately
          "chunk-admin": [
            "./src/components/admin/AdminDashboard.jsx",
            "./src/components/admin/ManageDoctors.jsx",
            "./src/components/admin/ManagePatients.jsx",
            "./src/components/admin/ManageUsers.jsx",
            "./src/components/admin/SystemReports.jsx",
            "./src/components/admin/AdminDocumentVerification.jsx",
          ],

          // Doctor chunk
          "chunk-doctor": [
            "./src/components/doctor/DoctorDashboard.jsx",
            "./src/components/doctor/AppointmentManagement.jsx",
            "./src/components/doctor/DoctorMedicalRecords.jsx",
            "./src/components/doctor/DoctorProfile.jsx",
            "./src/components/doctor/Patients.jsx",
          ],

          // Patient chunk
          "chunk-patient": [
            "./src/components/patient/PatientDashboard.jsx",
            "./src/components/patient/AppointmentBooking.jsx",
            "./src/components/patient/MedicalRecords.jsx",
            "./src/components/patient/MyAppointments.jsx",
            "./src/components/patient/MyProfile.jsx",
            "./src/components/patient/DocumentPermissions.jsx",
          ],
        },
      },
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      define: { global: "globalThis" },
      plugins: [
        NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
      ],
    },
  },
});
