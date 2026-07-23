import React, { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useDoctorPatients, usePatientRecords, useCreateRecord } from '../../hooks/useDoctorQuery';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FileText, Search, Stethoscope, Activity, Calendar, User, ChevronLeft, ChevronRight, Clock, Plus, CheckCircle } from 'lucide-react';
import { formatRelativeTime } from '../../utils/date';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

const schema = yup.object().shape({
  diagnosis: yup.string().required('Diagnosis is required').min(3, 'Diagnosis must be at least 3 characters'),
  prescription: yup.string().required('Prescription is required').min(3, 'Prescription must be at least 3 characters'),
  notes: yup.string().optional(),
});

type RecordFormData = yup.InferType<typeof schema>;

const RecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = patientId || searchParams.get('patientId') || '';

  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId);
  const [page, setPage] = useState(0);
  const [apiError, setApiError] = useState('');

  const { data: patients = [] } = useDoctorPatients();
  const { data: recordsData, isLoading: recordsLoading } = usePatientRecords(selectedPatientId, page);
  const createRecord = useCreateRecord(selectedPatientId);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RecordFormData>({
    resolver: yupResolver(schema)
  });

  const records = recordsData?.content ?? [];
  const totalPages = recordsData?.totalPages ?? 0;
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const onSubmit = async (data: RecordFormData) => {
    setApiError('');
    try {
      await createRecord.mutateAsync(data);
      setPage(0);
      reset();
      showToast('success', 'Record created', 'Medical record securely created and audit logged.');
    } catch (e: any) {
      setApiError(e.response?.data?.message || e.message || 'Failed to create record');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>Manage and review patient clinical histories</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Select Patient
            </label>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer"
                value={selectedPatientId}
                onChange={e => { setSelectedPatientId(e.target.value); setApiError(''); }}
              >
                <option value="" disabled>Select a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedPatient && (
            <Badge variant="info" dot>Active: {selectedPatient.fullName}</Badge>
          )}
        </div>
      </Card>

      {!selectedPatientId ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">No Patient Selected</h2>
          <p className="text-sm text-slate-500 text-center max-w-md">Select a patient from the dropdown above to view their medical history or add a new record.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-4 sticky top-6 space-y-4">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-600" />
                  New Clinical Record
                </h2>
              </div>
              <div className="p-5">
                {apiError && (
                  <div className="mb-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700">{apiError}</div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Diagnosis"
                    error={errors.diagnosis?.message}
                    icon={<Activity className="w-4 h-4" />}
                    placeholder="e.g. Acute Bronchitis"
                    {...register('diagnosis')}
                  />
                  <Textarea
                    label="Prescription / Treatment"
                    error={errors.prescription?.message}
                    placeholder="e.g. Amoxicillin 500mg, 3x daily"
                    {...register('prescription')}
                  />
                  <Textarea
                    label="Clinical Notes"
                    error={errors.notes?.message}
                    placeholder="Patient reports mild fever and persistent cough..."
                    {...register('notes')}
                  />
                  <Button type="submit" loading={isSubmitting} className="w-full" icon={<Plus className="w-4 h-4" />}>
                    {isSubmitting ? '' : 'Save Record'}
                  </Button>
                  <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Audit trail generated
                  </p>
                </form>
              </div>
            </Card>
          </div>

          <div className="xl:col-span-8">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Clinical History</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Records for {selectedPatient?.fullName}</p>
                </div>
                <Badge variant="neutral">{records.length} records</Badge>
              </div>

              {recordsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-slate-400">Loading records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">No Historical Records</h3>
                  <p className="text-xs text-slate-500">This patient's file is currently empty.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {records.map((r) => (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3 pb-3 border-b border-slate-50">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{r.diagnosis}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(r.createdAt)}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant="success" dot>Verified</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="p-2 bg-primary-50 rounded-lg h-fit text-primary-600">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Treatment</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.prescription}</p>
                          </div>
                        </div>
                        {r.notes && (
                          <div className="flex gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg h-fit text-slate-500">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{r.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="w-4 h-4" />}>
                        Previous
                      </Button>
                      <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                      <Button variant="secondary" size="sm" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
