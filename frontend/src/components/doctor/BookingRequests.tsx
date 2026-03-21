import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { appointmentAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { AppointmentListSkeleton } from '@/components/ui/Skeleton';
import type { Appointment } from '@/types';

export default function BookingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await appointmentAPI.getPendingByDoctor(user.id);
      if (res.data.success) {
        const pending: Appointment[] = (res.data.data ?? []).sort(
          (a: Appointment, b: Appointment) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setRequests(pending);
      }
    } catch {
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleConfirm = async (id: number) => {
    try {
      const res = await appointmentAPI.updateStatus(id, 'CONFIRMED');
      if (res.data.success) { toast.success('Appointment confirmed'); fetchRequests(); }
    } catch { toast.error('Failed to confirm appointment'); }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject this appointment?')) return;
    try {
      const res = await appointmentAPI.updateStatus(id, 'CANCELLED');
      if (res.data.success) { toast.success('Appointment rejected'); fetchRequests(); }
    } catch { toast.error('Failed to reject appointment'); }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Booking Requests</h1>
      <AppointmentListSkeleton />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Booking Requests</h1>
        <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-4 py-1.5 rounded-full text-sm font-semibold">
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-neutral-900 dark:text-white">{req.patientName}</p>
                    <p className="text-xs text-neutral-500">Patient ID: {req.patientId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl">
                    <Calendar size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-neutral-500">Date</p>
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm">{formatDate(req.date)}</p>
                    </div>
                  </div>
                  {req.time && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl">
                      <Clock size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-neutral-500">Time</p>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm">{req.time}</p>
                      </div>
                    </div>
                  )}
                </div>

                {req.notes && (
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Reason: </span>{req.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleConfirm(req.id)}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} /> Confirm
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <Calendar size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No Pending Requests</p>
            <p className="text-sm text-neutral-500">All booking requests have been processed</p>
          </div>
        )}
      </div>
    </div>
  );
}
