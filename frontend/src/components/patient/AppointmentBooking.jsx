import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Search, User } from "lucide-react";
import { appointmentAPI, doctorAPI, slotAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import logger from "../../utils/logger";
import Navbar from "../Navbar";
import PatientSidebar from "./PatientSidebar";

export default function AppointmentBooking() {
  const { user } = useAuth();
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorAPI.getAllVerified();
      const payload = response?.data?.data ?? response?.data ?? [];
      setDoctors(Array.isArray(payload) ? payload : []);
    } catch (error) {
      logger.error("Failed to fetch doctors", error);
      showToast.error("Unable to load doctors right now.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return doctors;
    }
    return doctors.filter((doctor) => {
      const name = (doctor.name || "").toLowerCase();
      const specialization = (doctor.specialization || "").toLowerCase();
      return name.includes(q) || specialization.includes(q);
    });
  }, [doctors, search]);

  const loadSlots = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlotId("");
    try {
      const response = await slotAPI.getAvailable(doctor.id);
      const payload = response?.data?.data ?? response?.data?.slots ?? response?.data ?? [];
      const available = Array.isArray(payload)
        ? payload.filter((slot) => slot.available !== false)
        : [];
      setSlots(available);
    } catch (error) {
      logger.error("Failed to fetch slots", error);
      setSlots([]);
      showToast.error("Unable to load available slots.");
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlotId || !reason.trim()) {
      showToast.error("Select a doctor, slot, and consultation reason.");
      return;
    }

    try {
      setBooking(true);
      await appointmentAPI.create({
        doctorId: selectedDoctor.id,
        slotId: selectedSlotId,
        patientId: user?.patientId || user?.id,
        reason: reason.trim(),
      });
      showToast.success("Appointment booked successfully.");
      setReason("");
      setSelectedSlotId("");
      await loadSlots(selectedDoctor);
    } catch (error) {
      logger.error("Failed to book appointment", error);
      showToast.error("Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="min-h-screen bg-slate-50 p-6 pt-24 ml-64">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="text-sm font-medium text-slate-700">Find Doctor</label>
            <div className="mt-2 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm"
                placeholder="Search by doctor name or specialization"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold text-slate-900 mb-3">Doctors</h2>
              {loadingDoctors ? (
                <p className="text-sm text-slate-500">Loading doctors...</p>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-sm text-slate-500">No doctors found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => loadSlots(doctor)}
                      className={`w-full text-left p-3 rounded-lg border ${
                        selectedDoctor?.id === doctor.id
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-medium text-slate-900">{doctor.name}</p>
                      <p className="text-sm text-slate-600">{doctor.specialization || "General"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold text-slate-900 mb-3">Available Slots</h2>
              {!selectedDoctor ? (
                <p className="text-sm text-slate-500">Select a doctor first.</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-500">No slots available.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <label
                      key={slot.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot.id}
                        checked={selectedSlotId === String(slot.id)}
                        onChange={() => setSelectedSlotId(String(slot.id))}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {slot.date || slot.slotDate || "Date"}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {slot.time || slot.startTime || "Time"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <User className="w-4 h-4" /> Consultation Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full min-h-24 border border-slate-200 rounded-lg p-3 outline-none focus:border-cyan-500"
              placeholder="Describe your symptoms or consultation reason"
            />
            <button
              onClick={handleBook}
              disabled={booking}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
