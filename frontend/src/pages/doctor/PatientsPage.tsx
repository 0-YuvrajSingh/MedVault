import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse } from '../../types';
import { useNavigate } from 'react-router-dom';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    doctorAPI.getPatients().then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading patients...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Patients</h1>
        <p>{patients.length} assigned patients</p>
      </div>

      <div className="card">
        {patients.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No patients assigned. An admin must create assignments first.</div>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.fullName}</td>
                    <td className="text-text-secondary">{p.email}</td>
                    <td>
                      <button onClick={() => navigate(`/doctor/patients/${p.id}/records`)} className="btn-primary btn-sm">
                        View Records
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
