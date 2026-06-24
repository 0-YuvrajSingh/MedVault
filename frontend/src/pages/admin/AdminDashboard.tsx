import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    active: boolean;
}

const AdminDashboard = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [patients, setPatients] = useState<User[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const docRes = await api.get('/admin/users?role=ROLE_DOCTOR');
            const patRes = await api.get('/admin/users?role=ROLE_PATIENT');
            setDoctors(docRes.data);
            setPatients(patRes.data);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await api.patch(`/admin/doctors/${id}/activate`);
            fetchUsers();
        } catch (err) {
            console.error("Failed to activate", err);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/assignments', {
                doctorId: selectedDoctorId,
                patientId: selectedPatientId
            });
            alert('Assignment successful');
            setSelectedDoctorId('');
            setSelectedPatientId('');
        } catch (err) {
            console.error("Failed to assign", err);
            alert('Assignment failed');
        }
    };

    const pendingDoctors = doctors.filter(doc => !doc.active);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Doctors Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Doctors</h2>
                    {pendingDoctors.length === 0 ? (
                        <p className="text-gray-500">No pending doctors.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingDoctors.map(doc => (
                                        <tr key={doc.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{doc.fullName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.email}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleActivate(doc.id)}
                                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    Activate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Assignment Form Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Assign Doctor to Patient</h2>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient</label>
                            <select
                                required
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            >
                                <option value="">Select a patient...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Doctor</label>
                            <select
                                required
                                value={selectedDoctorId}
                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            >
                                <option value="">Select an active doctor...</option>
                                {doctors.filter(d => d.active).map(d => (
                                    <option key={d.id} value={d.id}>{d.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Assign Doctor
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
