import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface MedicalRecord {
    id: string;
    diagnosis: string;
    treatmentPlan: string;
    notes: string;
    createdAt: string;
}

const PatientDashboard: React.FC = () => {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await api.get('/patient/records');
                setRecords(response.data);
            } catch (error) {
                console.error("Failed to fetch records", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    if (loading) return <div className="p-8 flex justify-center">Loading medical history...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">My Medical Records</h1>
            {records.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-gray-500 text-center">
                    No medical records found on file.
                </div>
            ) : (
                <div className="space-y-6">
                    {records.map(record => (
                        <div key={record.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="text-sm font-semibold text-blue-600 mb-2">
                                Date: {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{record.diagnosis}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="block font-semibold text-gray-700 uppercase text-xs tracking-wider mb-1">Treatment Plan</span>
                                    <p className="text-gray-600 whitespace-pre-wrap">{record.treatmentPlan}</p>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-700 uppercase text-xs tracking-wider mb-1">Doctor's Notes</span>
                                    <p className="text-gray-600 whitespace-pre-wrap">{record.notes || "None"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
