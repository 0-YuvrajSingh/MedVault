// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { medicalRecordAPI, accessRequestAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { FileText, User, Calendar, Eye, Lock, Search, Share2 } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';
import { AppointmentListSkeleton, StatCardSkeleton } from '../ui/Skeleton';

export default function DoctorMedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, [user]);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordAPI.getByDoctor(user.id);
      if (response.data.success) {
        const recordsList = response.data.data || [];
        recordsList.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        setRecords(recordsList);
      }
    } catch (err) {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }
    
    const filtered = records.filter(record => 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const handleRequestAccess = async (patientId) => {
    try {
      const response = await accessRequestAPI.create({
        patientId: patientId,
        doctorId: user.id,
        reason: 'Request access to medical records for consultation'
      });
      
      if (response.data.success) {
        toast.success('Access request sent successfully');
        setShowAccessModal(false);
      }
    } catch (err) {
      toast.error('Failed to send access request');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Medical Records</h1>
          <div className="mb-6">
            <StatCardSkeleton count={3} />
          </div>
          <AppointmentListSkeleton />
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Medical Records</h1>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by patient name, diagnosis, or treatment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{records.length}</p>
            </div>
            <FileText className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unique Patients</p>
              <p className="text-3xl font-bold text-green-600">
                {new Set(records.map(r => r.patientId)).size}
              </p>
            </div>
            <User className="text-green-600" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-3xl font-bold text-purple-600">
                {records.filter(r => {
                  const recordDate = new Date(r.createdDate);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="text-purple-600" size={40} />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{record.patientName}</h3>
                  <p className="text-sm text-gray-600">Patient ID: {record.patientId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{formatDate(record.createdDate)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Diagnosis</p>
                <p className="text-gray-800 font-semibold">{record.diagnosis}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Treatment</p>
                <p className="text-gray-800 font-semibold">{record.treatment}</p>
              </div>
            </div>

            {record.prescription && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Prescription:</p>
                <p className="text-gray-700">{record.prescription}</p>
              </div>
            )}

            {record.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
                <p className="text-gray-700">{record.notes}</p>
              </div>
            )}

            {record.followUpDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-blue-600" />
                <span>Follow-up: {formatDate(record.followUpDate)}</span>
              </div>
            )}
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <FileText size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Medical Records Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Medical records will appear here'}
            </p>
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
}
