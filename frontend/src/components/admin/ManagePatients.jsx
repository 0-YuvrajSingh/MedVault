import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, adminAPI } from '../../api';
import { toast } from '../../utils/toast';
import { Search, Users, Eye, Trash2, UserCheck, Calendar, User } from 'lucide-react';
import logger from '../../utils/logger';
import { formatDate } from '../../utils/dateUtils';
import AdminLayout from './AdminLayout';
import { TableSkeleton, StatCardSkeleton } from '../ui/Skeleton';
export default function ManagePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAll();
      if (res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      logger.error('Error fetching patients:', err);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      const res = await adminAPI.deleteUser(patientToDelete.userId);
      if (res.data.success) {
        toast.success('Patient deleted successfully');
        setShowDeleteModal(false);
        setPatientToDelete(null);
        fetchPatients();
      }
    } catch (err) {
      logger.error('Error deleting patient:', err);
      toast.error(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const openDeleteModal = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="pt-16 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="text-purple-600" size={36} />
                Manage Patients
              </h1>
              <p className="text-gray-600 mt-2">View and manage patient accounts</p>
            </div>
            <div className="mb-8">
              <StatCardSkeleton count={3} />
            </div>
            {/* Skeleton for Search Bar */}
            <div className="bg-white rounded-t-lg shadow-md p-6 border-b h-24 animate-pulse"></div>
            <div className="bg-white rounded-b-lg shadow-md p-6">
               <TableSkeleton rows={5} columns={6} />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="text-purple-600" size={36} />
              Manage Patients
            </h1>
            <p className="text-gray-600 mt-2">View and manage patient accounts</p>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{patients.length}</p>
                </div>
                <Users className="text-purple-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Patients</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {patients.filter(p => p.isActive !== false).length}
                  </p>
                </div>
                <UserCheck className="text-green-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">New This Month</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {patients.filter(p => {
                      const createdDate = new Date(p.createdAt);
                      const now = new Date();
                      return createdDate.getMonth() === now.getMonth() && 
                             createdDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="text-blue-600" size={40} />
              </div>
            </div>
          </div>
          {/* Patients Table */}
          <div className="bg-white rounded-lg shadow-md">
            {/* Search Bar */}
            <div className="p-6 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <User className="text-purple-500 bg-purple-100 rounded-full p-1" size={32} />
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{patient.phoneNumber || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {patient.dateOfBirth ? 
                              Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) 
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{patient.bloodGroup || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailsModal(patient)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(patient)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Patient"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <Users className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">No patients found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Details Modal */}
          {showDetailsModal && selectedPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Patient Details</h2>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-lg text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg text-gray-900">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-lg text-gray-900">{selectedPatient.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-lg text-gray-900">
                        {selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blood Group</label>
                      <p className="text-lg text-gray-900">{selectedPatient.bloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="text-lg text-gray-900">{selectedPatient.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-lg text-gray-900">{selectedPatient.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Medical History</label>
                    <p className="text-lg text-gray-900">{selectedPatient.medicalHistory || 'No medical history available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Allergies</label>
                    <p className="text-lg text-gray-900">{selectedPatient.allergies || 'No known allergies'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registered On</label>
                    <p className="text-lg text-gray-900">
                      {selectedPatient.createdAt ? formatDate(selectedPatient.createdAt) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && patientToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Patient</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete <strong>{patientToDelete.name}</strong>? This will permanently remove all their records. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setPatientToDelete(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeletePatient}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
