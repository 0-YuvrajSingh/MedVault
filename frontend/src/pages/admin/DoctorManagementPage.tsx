import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse } from '../../types';

const DoctorManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => adminAPI.getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { fetchUsers(); }, []);

  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR');
  const pending = doctors.filter(d => !d.active);
  const active = doctors.filter(d => d.active);

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try { await adminAPI.activateDoctor(id); fetchUsers(); } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleDeactivate = async (id: string) => {
    setActionLoading(id);
    try { await adminAPI.deactivateDoctor(id); fetchUsers(); } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading doctors...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Doctor Management</h1>
        <p className="text-sm text-text-muted mt-1">{doctors.length} doctors total, {pending.length} pending approval</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-border bg-warning-50">
            <h2 className="text-lg font-semibold text-warning-700">Pending Approval ({pending.length})</h2>
          </div>
          <div className="table-container border-0">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
              <tbody>
                {pending.map(d => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.fullName}</td>
                    <td className="text-text-secondary">{d.email}</td>
                    <td>
                      <button onClick={() => handleActivate(d.id)} disabled={actionLoading === d.id} className="btn-primary btn-sm">
                        {actionLoading === d.id ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Doctors */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Active Doctors ({active.length})</h2>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {active.map(d => (
                <tr key={d.id}>
                  <td className="font-medium">{d.fullName}</td>
                  <td className="text-text-secondary">{d.email}</td>
                  <td><span className="badge-success">Active</span></td>
                  <td>
                    <button onClick={() => handleDeactivate(d.id)} disabled={actionLoading === d.id} className="btn-danger btn-sm">
                      {actionLoading === d.id ? '...' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {active.length === 0 && <tr><td colSpan={4} className="text-center text-text-muted py-8">No active doctors</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagementPage;
