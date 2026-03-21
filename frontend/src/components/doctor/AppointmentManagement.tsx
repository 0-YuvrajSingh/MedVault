import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { appointmentAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { Calendar, Clock, CheckCircle, XCircle, Filter, User, Search } from 'lucide-react';
import { AppointmentListSkeleton } from '@/components/ui/Skeleton';
import type { Appointment, AppointmentStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = AppointmentStatus | 'ALL';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100   text-blue-800',
  COMPLETED: 'bg-green-100  text-green-800',
  CANCELLED: 'bg-red-100    text-red-800',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentManagement() {
  const { user } = useAuth();
  const [appointments, setAppointments]           = useState<Appointment[]>([]);
  const [filteredAppointments, setFiltered]       = useState<Appointment[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [statusFilter, setStatusFilter]           = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm]               = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await appointmentAPI.getByDoctor(user.id);
      if (res.data.success) {
        const appts: Appointment[] = (res.data.data ?? []).sort(
          (a: Appointment, b: Appointment) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAppointments(appts);
      }
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    let list = [...appointments];
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a =>
        a.patientName?.toLowerCase().includes(q) || a.date?.includes(searchTerm)
      );
    }
    setFiltered(list);
  }, [appointments, statusFilter, searchTerm]);

  const handleUpdateStatus = async (id: number, newStatus: AppointmentStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;
    try {
      const res = await appointmentAPI.updateStatus(id, newStatus);
      if (res.data.success) {
        toast.success(`Appointment ${newStatus.toLowerCase()}`);
        fetchAppointments();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Appointment Management</h1>
      <AppointmentListSkeleton />
    </div>
  );

  const counts: Record<AppointmentStatus, number> = {
    PENDING:   appointments.filter(a => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Appointment Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total',     value: appointments.length, color: 'text-neutral-900 dark:text-white' },
          { label: 'Pending',   value: counts.PENDING,      color: 'text-yellow-600' },
          { label: 'Confirmed', value: counts.CONFIRMED,    color: 'text-blue-600' },
          { label: 'Completed', value: counts.COMPLETED,    color: 'text-green-600' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient name or date…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neutral-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredAppointments.map(appt => (
          <div key={appt.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{appt.patientName}</p>
                    <p className="text-xs text-neutral-500">ID: {appt.patientId}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" />{formatDate(appt.date)}</span>
                  {appt.time && <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" />{appt.time}</span>}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>

                {appt.notes && (
                  <div className="mt-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Notes: </span>{appt.notes}
                  </div>
                )}
              </div>

              {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {appt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle size={15} /> Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                        className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={15} /> Cancel
                      </button>
                    </>
                  )}
                  {appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={15} /> Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <Calendar size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-500">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
