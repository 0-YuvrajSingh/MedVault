import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse, MedicalRecord } from '../../types';
import {
  FileText,
  Search,
  Stethoscope,
  Activity,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/date';

const RecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = patientId || searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<UserResponse[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    doctorAPI.getPatients().then(r => setPatients(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setLoading(true);
      doctorAPI.getPatientRecords(selectedPatientId).then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
    } else {
      setRecords([]);
    }
  }, [selectedPatientId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await doctorAPI.createRecord(selectedPatientId, { diagnosis, prescription, notes });
      setRecords(prev => [res.data, ...prev]);
      setDiagnosis(''); setPrescription(''); setNotes('');
      setSuccess('Medical record securely created and audit logged.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to create record');
    } finally { setSubmitting(false); }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[var(--role-color)] to-blue-600 rounded-xl p-8 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Medical Records</h1>
            <p className="text-blue-100 font-medium">Manage and review patient clinical histories</p>
          </div>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="card-elevated p-6 border-l-4 border-l-[var(--role-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--role-color)]" />
              Select Patient Context
            </label>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-slate-200 rounded-xl text-text-primary font-medium focus:ring-2 focus:ring-[var(--role-color)] focus:border-transparent transition-all appearance-none cursor-pointer"
                value={selectedPatientId}
                onChange={e => { setSelectedPatientId(e.target.value); setError(''); setSuccess(''); }}
              >
                <option value="" disabled>Select a patient to view or add records...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id.substring(0, 8)}...)</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {selectedPatient && (
            <div className="sm:ml-auto px-6 py-3 bg-[var(--role-tint)] rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--role-color)] animate-pulse" />
              <span className="text-[var(--role-text)] font-semibold">Active Context: {selectedPatient.fullName}</span>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        /* Empty State */
        <div className="card-elevated flex flex-col items-center justify-center p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-8 border-slate-200">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No Patient Selected</h2>
          <p className="text-text-secondary max-w-md">
            Please select a patient from the dropdown above to view their medical history or to securely log a new medical record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Left Column: Create Form */}
          <div className="xl:col-span-4 sticky top-6">
            <div className="card-elevated overflow-hidden border-t-4 border-t-[var(--role-color)]">
              <div className="p-6 bg-gray-50 border-b border-border">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[var(--role-color)]" />
                  New Clinical Record
                </h2>
                <p className="text-sm text-text-secondary mt-1">Append securely to {selectedPatient?.fullName}'s file.</p>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{success}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-text-muted" /> Diagnosis
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g. Acute Bronchitis"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-text-muted" /> Prescription / Treatment
                    </label>
                    <textarea
                      className="input w-full min-h-[100px] resize-y"
                      placeholder="e.g. Amoxicillin 500mg, 3x daily"
                      value={prescription}
                      onChange={e => setPrescription(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-text-muted" /> Clinical Notes
                    </label>
                    <textarea
                      className="input w-full min-h-[100px] resize-y"
                      placeholder="Patient reports mild fever and persistent cough..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base rounded-xl mt-4 flex items-center justify-center gap-2 transition-all">
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {submitting ? 'Encrypting & Saving...' : 'Save & Sign Record'}
                  </button>
                  <p className="text-center text-xs text-text-muted font-medium mt-3 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Audit Trail Generated
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="xl:col-span-8">
            <div className="card-elevated">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Clinical History</h2>
                  <p className="text-sm text-text-secondary mt-1">Chronological medical records for {selectedPatient?.fullName}</p>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-text-secondary">
                  {records.length} Records
                </div>
              </div>

              <div className="p-8 bg-gray-50/50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--role-color)] rounded-full animate-spin mb-4" />
                    <p className="text-text-muted font-medium">Decrypting records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">No Historical Records</h3>
                    <p className="text-text-secondary">This patient's file is currently empty.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gray-200 rounded-full" />

                    <div className="space-y-8 relative">
                      {records.map((r, i) => (
                        <div key={r.id} className="relative flex items-start gap-6 group">
                          {/* Timeline Dot */}
                          <div className="w-16 flex-shrink-0 flex justify-end relative z-10 pt-1.5">
                            <div className="w-4 h-4 rounded-full bg-[var(--role-color)] ring-4 ring-white shadow-sm group-hover:scale-125 transition-transform duration-300" />
                          </div>

                          {/* Record Card */}
                          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                              <div>
                                <h3 className="text-lg font-bold text-text-primary">{r.diagnosis}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted mt-1 font-medium">
                                  <span className="flex items-center gap-1.5 font-bold text-[var(--role-color)]"><Clock className="w-4 h-4" /> {formatRelativeTime(r.createdAt)}</span>
                                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                              <div className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 border border-green-100">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <div className="p-2.5 bg-blue-50 rounded-xl h-fit text-blue-600">
                                  <Stethoscope className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Prescription & Treatment</h4>
                                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{r.prescription}</p>
                                </div>
                              </div>

                              {r.notes && (
                                <div className="flex gap-4">
                                  <div className="p-2.5 bg-purple-50 rounded-xl h-fit text-purple-600">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Clinical Notes</h4>
                                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{r.notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RecordsPage;
