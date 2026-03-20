import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, medicalRecordAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';
import { User, Calendar, FileText, Phone, Mail, Search, MapPin } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [user]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getByDoctor(user.id);
      if (response.data.success) {
        const appointments = response.data.data || [];
        
        // Extract unique patients from appointments
        const patientMap = new Map();
        appointments.forEach(apt => {
          if (!patientMap.has(apt.patientId)) {
            patientMap.set(apt.patientId, {
              id: apt.patientId,
              name: apt.patientName,
              email: apt.patientEmail || 'N/A',
              phone: apt.patientPhone || 'N/A',
              lastVisit: apt.appointmentDate,
              totalAppointments: 1,
              completedAppointments: apt.status === 'COMPLETED' ? 1 : 0
            });
          } else {
            const patient = patientMap.get(apt.patientId);
            patient.totalAppointments++;
            if (apt.status === 'COMPLETED') {
              patient.completedAppointments++;
            }
            // Update last visit if this appointment is more recent
            if (new Date(apt.appointmentDate) > new Date(patient.lastVisit)) {
              patient.lastVisit = apt.appointmentDate;
            }
          }
        });
        
        const patientsList = Array.from(patientMap.values());
        patientsList.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
        setPatients(patientsList);
      }
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }
    
    const filtered = patients.filter(patient => 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(selectedPatient?.id === patient.id ? null : patient);
  };

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Patients</h1>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
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
              <p className="text-gray-600 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
            </div>
            <User className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold text-green-600">
                {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
              </p>
            </div>
            <Calendar className="text-green-600" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-purple-600">
                {patients.reduce((sum, p) => sum + p.completedAppointments, 0)}
              </p>
            </div>
            <FileText className="text-purple-600" size={40} />
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-gray-600">ID: {patient.id}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={16} className="text-blue-600" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={16} className="text-blue-600" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar size={16} className="text-blue-600" />
                  <span>Last Visit: {formatDate(patient.lastVisit)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{patient.totalAppointments}</p>
                  <p className="text-xs text-gray-600">Total Visits</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{patient.completedAppointments}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>

              <button
                onClick={() => handleViewDetails(patient)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {selectedPatient?.id === patient.id ? 'Hide Details' : 'View Details'}
              </button>

              {selectedPatient?.id === patient.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600">Completion Rate</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(patient.completedAppointments / patient.totalAppointments) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {Math.round((patient.completedAppointments / patient.totalAppointments) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <User size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Patients Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Patients will appear here once you have appointments'}
          </p>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
