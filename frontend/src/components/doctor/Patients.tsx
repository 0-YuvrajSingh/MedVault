import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { appointmentAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { User, Calendar, FileText, Phone, Mail, Search } from 'lucide-react';
import type { Appointment } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSummary {
  id:                    number;
  name:                  string;
  email:                 string;
  phone:                 string;
  lastVisit:             string;
  totalAppointments:     number;
  completedAppointments: number;
}

function buildPatientMap(appointments: Appointment[]): PatientSummary[] {
  const map = new Map<number, PatientSummary>();
  for (const apt of appointments) {
    if (!map.has(apt.patientId)) {
      map.set(apt.patientId, {
        id:                    apt.patientId,
        name:                  apt.patientName,
        email:                 (apt as any).patientEmail ?? 'N/A',
        phone:                 (apt as any).patientPhone ?? 'N/A',
        lastVisit:             apt.date,
        totalAppointments:     1,
        completedAppointments: apt.status === 'COMPLETED' ? 1 : 0,
      });
    } else {
      const p = map.get(apt.patientId)!;
      p.totalAppointments++;
      if (apt.status === 'COMPLETED') p.completedAppointments++;
      if (new Date(apt.date) > new Date(p.lastVisit)) p.lastVisit = apt.date;
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Patients() {
  const { user } = useAuth();
  const [patients,  setPatients]  = useState<PatientSummary[]>([]);
  const [filtered,  setFiltered]  = useState<PatientSummary[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [expanded,  setExpanded]  = useState<number | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await appointmentAPI.getByDoctor(user.id);
      if (res.data.success) setPatients(buildPatientMap(res.data.data ?? []));
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    if (!search) { setFiltered(patients); return; }
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q)
    ));
  }, [patients, search]);

  const totalVisits    = patients.reduce((s, p) => s + p.totalAppointments,     0);
  const totalCompleted = patients.reduce((s, p) => s + p.completedAppointments, 0);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Patients</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: 'Total Patients',      value: patients.length, icon: User,     color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Total Appointments',  value: totalVisits,      icon: Calendar, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Completed',           value: totalCompleted,   icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ] as const).map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={s.color} size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(patient => {
          const completionRate = patient.totalAppointments > 0
            ? Math.round((patient.completedAppointments / patient.totalAppointments) * 100)
            : 0;
          const isExpanded = expanded === patient.id;

          return (
            <div key={patient.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {patient.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">{patient.name}</p>
                    <p className="text-xs text-neutral-500">ID: {patient.id}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Mail size={14} className="text-blue-500 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Phone size={14} className="text-blue-500 flex-shrink-0" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Calendar size={14} className="text-blue-500 flex-shrink-0" />
                    Last visit: {formatDate(patient.lastVisit)}
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">{patient.totalAppointments}</p>
                    <p className="text-xs text-neutral-500">Total</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-green-600">{patient.completedAppointments}</p>
                    <p className="text-xs text-neutral-500">Done</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : patient.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-medium text-neutral-500 mb-2">Completion Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{completionRate}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <User size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No Patients Found</p>
            <p className="text-sm text-neutral-500">
              {search ? 'Try adjusting your search' : 'Patients appear once you have appointments'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
