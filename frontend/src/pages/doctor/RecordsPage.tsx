import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse, MedicalRecord } from '../../types';

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
    }
  }, [selectedPatientId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await doctorAPI.createRecord(selectedPatientId, { diagnosis, prescription, notes });
      setRecords(prev => [res.data, ...prev]);
      setDiagnosis(''); setPrescription(''); setNotes('');
      setSuccess('Record created and audit logged.');
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to create record');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Medical Records</h1>
        <p className="text-sm text-text-muted mt-1">View and create records for assigned patients</p>
      </div>

      {/* Patient selector */}
      <div className="card p-6">
        <label className="block text-sm font-medium text-text-primary mb-1.5">Select Patient</label>
        <select className="input max-w-md" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
          <option value="">Choose a patient</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
        </select>
      </div>

      {selectedPatientId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create form */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">New Record</h2>
            {error && <div className="mb-3 p-3 bg-danger-50 text-danger-700 text-sm rounded-md">{error}</div>}
            {success && <div className="mb-3 p-3 bg-success-50 text-success-700 text-sm rounded-md">{success}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Diagnosis</label>
                <input type="text" className="input" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Prescription</label>
                <textarea className="input min-h-[80px]" value={prescription} onChange={e => setPrescription(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
                <textarea className="input min-h-[80px]" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Saving...' : 'Save Record'}
              </button>
            </form>
          </div>

          {/* Record history */}
          <div className="lg:col-span-2 card">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Record History</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-text-muted">Loading records...</div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-text-muted">No records found for this patient.</div>
            ) : (
              <div className="p-5 space-y-4">
                {records.map(r => (
                  <div key={r.id} className="border-l-4 border-primary-500 pl-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text-primary">{r.diagnosis}</h3>
                      <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary"><strong>Rx:</strong> {r.prescription}</p>
                    {r.notes && <p className="text-sm text-text-muted mt-1">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
