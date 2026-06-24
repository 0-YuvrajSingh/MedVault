import React, { useState } from 'react';
import api from '../../api/axios';

interface MedicalRecord {
    id: string;
    diagnosis: string;
    treatmentPlan: string;
    notes: string;
    createdAt: string;
}

const DoctorDashboard: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [viewingPatient, setViewingPatient] = useState(false);
    
    const [diagnosis, setDiagnosis] = useState('');
    const [treatmentPlan, setTreatmentPlan] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.get(`/doctor/patients/${patientId}/records`);
            setRecords(response.data);
            setViewingPatient(true);
        } catch (error: any) {
            const message = error.response?.data?.message || "Error fetching records. Verify the UUID and assignment.";
            alert(message);
            setViewingPatient(false);
        }
    };

    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post('/doctor/records', {
                patientId,
                diagnosis,
                treatmentPlan,
                notes
            });
            setRecords([...records, response.data]);
            setDiagnosis('');
            setTreatmentPlan('');
            setNotes('');
            alert("Medical record securely appended.");
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create record.";
            alert(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h2 className="text-lg font-bold mb-4">Locate Patient</h2>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient UUID</label>
                            <input 
                                type="text" 
                                value={patientId} 
                                onChange={(e) => setPatientId(e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                            Access Records
                        </button>
                    </form>
                </div>

                {viewingPatient && (
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h2 className="text-lg font-bold mb-4">Append New Record</h2>
                        <form onSubmit={handleCreateRecord} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                                <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
                                <textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} className="mt-1 block w-full border rounded p-2 h-24" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full border rounded p-2 h-24" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50">
                                {isSubmitting ? 'Appending...' : 'Save & Sign Record'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[500px]">
                    <h2 className="text-xl font-bold mb-6">Patient Medical History</h2>
                    {!viewingPatient ? (
                        <div className="text-gray-500 text-center mt-20">Enter a Patient UUID to view authorized records.</div>
                    ) : records.length === 0 ? (
                        <div className="text-gray-500 text-center mt-20">No existing records found for this patient.</div>
                    ) : (
                        <div className="space-y-4">
                            {records.map(record => (
                                <div key={record.id} className="border-l-4 border-blue-600 pl-4 py-2 mb-6">
                                    <div className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleString()}</div>
                                    <h4 className="text-lg font-bold text-gray-800">{record.diagnosis}</h4>
                                    <p className="text-gray-700 mt-2"><span className="font-semibold">Plan:</span> {record.treatmentPlan}</p>
                                    <p className="text-gray-600 mt-1"><span className="font-semibold">Notes:</span> {record.notes || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
