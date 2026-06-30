import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse, AssignmentResponse } from '../../types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';

const schema = yup.object().shape({
  patientId: yup.string().required('Please select a patient').uuid('Invalid patient format'),
  doctorId: yup.string().required('Please select a doctor').uuid('Invalid doctor format'),
});

type AssignFormData = yup.InferType<typeof schema>;

const AssignmentsPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AssignFormData>({
    resolver: yupResolver(schema)
  });

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

  const onSubmit = async (data: AssignFormData) => {
    setApiError(''); setSuccess('');
    try {
      await adminAPI.createAssignment(data);
      setSuccess('Assignment securely established.');
      reset();
      fetchData();
    } catch (e: any) {
      setApiError(e.response?.data?.message || e.message || 'Assignment failed due to a system error.');
    }
  };

  const columns = [
    { key: 'patientName', label: 'Patient Name', render: (a: AssignmentResponse) => <span className="font-semibold text-slate-800">{a.patientName}</span> },
    { key: 'doctorName', label: 'Assigned Doctor', render: (a: AssignmentResponse) => <span className="text-slate-600">Dr. {a.doctorName}</span> },
    { key: 'assignedAt', label: 'Assigned Date', render: (a: AssignmentResponse) => <span className="text-slate-500 text-sm font-medium">{new Date(a.assignedAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Care Assignments</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and audit patient-doctor relationships</p>
      </div>

      <Card className="p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Create New Assignment</h2>
        {apiError && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{apiError}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Patient</label>
            <select {...register('patientId')} className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.patientId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm transition-colors outline-none`}>
              <option value="">Select a patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
            {errors.patientId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.patientId.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor</label>
            <select {...register('doctorId')} className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.doctorId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm transition-colors outline-none`}>
              <option value="">Select a doctor...</option>
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.fullName}</option>)}
            </select>
            {errors.doctorId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.doctorId.message}</p>}
          </div>

          <div className="flex flex-col justify-end h-full">
            <button type="submit" disabled={isSubmitting} className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 mt-[26px]">
              {isSubmitting ? 'Processing...' : 'Establish Assignment'}
            </button>
          </div>
        </form>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Relationships ({assignments.length})</h2>
        </div>
        <DataTable columns={columns} data={assignments} loading={loading} />
      </div>
    </div>
  );
};

export default AssignmentsPage;
