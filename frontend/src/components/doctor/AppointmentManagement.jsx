import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate, formatTime, formatDateTime } from '../../utils/dateUtils';
import { Calendar, Clock, CheckCircle, XCircle, Filter, User, Search } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';
import { AppointmentListSkeleton } from '../ui/Skeleton';

export default function AppointmentManagement() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getByDoctor(user.id);
      if (response.data.success) {
        const appts = response.data.data || [];
        // Sort by date descending
        appts.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        setAppointments(appts);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentDate?.includes(searchTerm)
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;
    
    try {
      const response = await appointmentAPI.updateStatus(appointmentId, newStatus);
      if (response.data.success) {
        toast.success(`Appointment ${newStatus.toLowerCase()}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointment Management</h1>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointment Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.status === 'PENDING').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'CONFIRMED').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-600">Patient ID: {appointment.patientId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-blue-600" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-blue-600" />
                    <span>{appointment.appointmentTime}</span>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-gray-600">{appointment.reason}</p>
                  </div>
                )}
              </div>

              {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                <div className="flex flex-col gap-2 ml-4">
                  {appointment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'CONFIRMED')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle size={18} />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={18} />
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>
    </div>
      </div>
    </>
  );
}
