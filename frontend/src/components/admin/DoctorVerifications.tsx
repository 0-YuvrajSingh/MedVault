// @ts-nocheck
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { adminAPI } from "../../api";
import { showToast } from "../../utils/toast";
import logger from "../../utils/logger";
import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';

export default function DoctorVerifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchUnverifiedDoctors();
  }, []);

  const fetchUnverifiedDoctors = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUnverifiedDoctors();
      // Ensure doctors is always an array
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast.error("Failed to load unverified doctors");
      logger.error("Failed to load unverified doctors:", error);
      setDoctors([]); // fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await adminAPI.verifyDoctor(doctorId);
      showToast.success("Doctor verified successfully");
      fetchUnverifiedDoctors();
    } catch (error) {
      showToast.error("Failed to verify doctor");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <AdminSidebar />
        <div className="ml-64 pt-16 flex items-center justify-center min-h-screen">
          <div className="size-12 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AdminSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 mb-4 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Doctor Verifications
              </h1>
              <p className="text-slate-600">Review and verify pending doctor registrations</p>
            </div>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <UserCheck className="size-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Pending Verifications Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Pending Verifications</p>
              <p className="text-3xl font-bold text-slate-900">{doctors.length}</p>
            </div>
            <div className="size-14 rounded-xl bg-amber-50 flex items-center justify-center">
              <UserCheck className="size-7 text-amber-600" />
            </div>
          </div>
        </motion.div>

        {/* Doctors List */}
        <div className="space-y-4">
          {doctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-slate-600">No pending doctor verifications at the moment.</p>
            </motion.div>
          ) : (
            doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {doctor.name || "Unknown Doctor"}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Email:</span> {doctor.email}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Specialty:</span> {doctor.specialization || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Experience:</span> {doctor.experienceYears || 0} years
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Fees:</span> ${doctor.consultationFee || 0}
                        </p>
                      </div>
                    </div>
                    {doctor.qualifications && (
                      <p className="text-sm text-slate-600 mb-4">
                        <span className="font-medium">Qualifications:</span> {doctor.qualifications}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleVerifyDoctor(doctor.id)}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="size-5" />
                    Verify
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
