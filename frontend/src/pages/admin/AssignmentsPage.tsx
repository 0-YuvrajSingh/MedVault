import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse, AssignmentResponse } from '../../types';

const AssignmentsPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [u, a] = await Promise.all([adminAPI.getUsers(), adminAPI.getAssignments()]);
      setUsers(u.data);
      setAssignments(a.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const patients = users.filter(u => u.role === 'ROLE_PATIENT');
  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR' && u.active);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedPatient || !selectedDoctor) { setError('Select both patient and doctor'); return; }
    setAssigning(true);
    try {
      await adminAPI.createAssignment({ patientId: selectedPatient, doctorId: selectedDoctor });
      setSuccess('Assignment created successfully');
      setSelectedPatient(''); setSelectedDoctor('');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Assignments</h1>
        <p className="text-sm text-text-muted mt-1">Assign doctors to patients</p>
      </div>

      {/* Assign form */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Create Assignment</h2>
        {error && <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-md">{error}</div>}
        {success && <div className="mb-4 p-3 bg-success-50 border border-success-400 text-success-700 text-sm rounded-md">{success}</div>}
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Patient</label>
            <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Doctor</label>
            <select className="input" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={assigning} className="btn-primary w-full">
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing assignments */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Active Assignments ({assignments.length})</h2>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Created</th></tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td className="font-medium">{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td className="text-text-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td colSpan={3} className="text-center text-text-muted py-8">No assignments yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
