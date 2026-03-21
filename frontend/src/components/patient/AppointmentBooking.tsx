import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Calendar, Clock, Search, User } from 'lucide-react';
import { appointmentAPI, doctorAPI, slotAPI } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import type { Doctor, Slot } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifiedDoctor extends Doctor {
  specialization?: string;
}

interface AvailableSlot extends Slot {
  slotDate?: string;
  time?:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentBooking() {
  const { user } = useAuth();

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors,        setDoctors]        = useState<VerifiedDoctor[]>([]);
  const [search,         setSearch]         = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<VerifiedDoctor | null>(null);
  const [slots,          setSlots]          = useState<AvailableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [reason,         setReason]         = useState('');
  const [booking,        setBooking]        = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const res   = await doctorAPI.getAllVerified();
      const list  = res?.data?.data ?? res?.data ?? [];
      setDoctors(Array.isArray(list) ? list : []);
    } catch (err) {
      logger.error('Failed to fetch doctors', err);
      toast.error('Unable to load doctors right now.');
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.specialization ?? '').toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const loadSlots = async (doctor: VerifiedDoctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlotId('');
    try {
      const res  = await slotAPI.getAvailable(doctor.id);
      const list = res?.data?.data ?? res?.data?.slots ?? res?.data ?? [];
      setSlots(Array.isArray(list) ? list.filter((s: AvailableSlot) => s.available !== false) : []);
    } catch (err) {
      logger.error('Failed to fetch slots', err);
      setSlots([]);
      toast.error('Unable to load available slots.');
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlotId || !reason.trim()) {
      toast.error('Select a doctor, a slot, and describe your reason.');
      return;
    }
    try {
      setBooking(true);
      await appointmentAPI.create({
        doctorId:  selectedDoctor.id,
        slotId:    Number(selectedSlotId),
        patientId: (user as any)?.patientId ?? user?.id,
        notes:     reason.trim(),
      });
      toast.success('Appointment booked successfully.');
      setReason('');
      setSelectedSlotId('');
      await loadSlots(selectedDoctor);
    } catch (err) {
      logger.error('Failed to book appointment', err);
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const inputCls = 'w-full border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Book Appointment</h1>

      {/* Search */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">Find a Doctor</label>
        <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
            placeholder="Search by name or specialization…"
          />
        </div>
      </div>

      {/* Doctor + Slots grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Doctors */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Doctors</h2>
          {loadingDoctors ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4 text-center">No doctors found.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredDoctors.map(doctor => (
                <button key={doctor.id} onClick={() => loadSlots(doctor)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}>
                  <p className="font-medium text-neutral-900 dark:text-white text-sm">{doctor.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{doctor.specialization ?? 'General Medicine'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slots */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Available Slots</h2>
          {!selectedDoctor ? (
            <p className="text-sm text-neutral-400 py-4 text-center">Select a doctor first.</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4 text-center">No slots available for this doctor.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {slots.map(slot => (
                <label key={slot.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSlotId === String(slot.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}>
                  <input type="radio" name="slot" value={slot.id}
                    checked={selectedSlotId === String(slot.id)}
                    onChange={() => setSelectedSlotId(String(slot.id))}
                    className="accent-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {slot.date ?? (slot as any).slotDate ?? 'Date TBD'}
                    </p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {slot.startTime ?? (slot as any).time ?? 'Time TBD'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reason + Book */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          <User className="w-3.5 h-3.5" /> Consultation Reason
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className={`${inputCls} p-3 resize-none`}
          placeholder="Describe your symptoms or reason for the appointment…"
        />
        <button
          onClick={handleBook}
          disabled={booking || !selectedDoctor || !selectedSlotId || !reason.trim()}
          className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {booking ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
