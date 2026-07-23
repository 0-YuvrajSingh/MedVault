import React from 'react';
import { useUsers, useAssignments, useCreateAssignment } from '../../hooks/useAdminQuery';
import type { AssignmentResponse } from '../../types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

const schema = yup.object().shape({
  patientId: yup.string().required('Please select a patient').uuid('Invalid patient format'),
  doctorId: yup.string().required('Please select a doctor').uuid('Invalid doctor format'),
});

type AssignFormData = yup.InferType<typeof schema>;

const AssignmentsPage: React.FC = () => {
  const { data: users = [] } = useUsers();
  const { data: assignments = [], isLoading } = useAssignments();
  const createAssignment = useCreateAssignment();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AssignFormData>({
    resolver: yupResolver(schema)
  });

  const patients = users.filter(u => u.role === 'ROLE_PATIENT');
  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR' && u.active);

  const onSubmit = async (data: AssignFormData) => {
    try {
      await createAssignment.mutateAsync(data);
      showToast('success', 'Assignment created', 'Patient-doctor relationship established.');
      reset();
    } catch (e: any) {
      showToast('error', 'Assignment failed', e.response?.data?.message || 'System error');
    }
  };

  const columns: Column<AssignmentResponse>[] = [
    { header: 'Patient', accessor: (a) => <span className="font-medium text-slate-900">{a.patientName}</span> },
    { header: 'Doctor', accessor: (a) => <span className="text-slate-600">Dr. {a.doctorName}</span> },
    { header: 'Assigned', accessor: (a) => <span className="text-slate-500 text-sm">{new Date(a.assignedAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Care Assignments</h1>
        <p>Manage ongoing patient-doctor relationships. Appointments are scheduled separately.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Assign a Care Doctor</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <Select
            label="Patient"
            error={errors.patientId?.message}
            placeholder="Select a patient..."
            options={patients.map(p => ({ value: p.id, label: p.fullName }))}
            {...register('patientId')}
          />
          <Select
            label="Doctor"
            error={errors.doctorId?.message}
            placeholder="Select a doctor..."
            options={doctors.map(d => ({ value: d.id, label: `Dr. ${d.fullName}` }))}
            {...register('doctorId')}
          />
          <div className="flex flex-col justify-end h-full pt-[26px]">
            <Button type="submit" loading={isSubmitting} className="w-full">
              Save Care Assignment
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Relationships ({assignments.length})</h2>
        </div>
        <DataTable columns={columns} data={assignments} keyExtractor={(a) => a.id} loading={isLoading} emptyMessage="No assignments yet." />
      </div>
    </div>
  );
};

export default AssignmentsPage;
