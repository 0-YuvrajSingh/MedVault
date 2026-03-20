import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';
import { AppointmentListSkeleton } from '../ui/Skeleton';

export default function BookingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingRequests();
  }, [user]);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getPendingByDoctor(user.id);
      if (response.data.success) {
        const pendingRequests = response.data.data || [];
        // Sort by date
        pendingRequests.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        setRequests(pendingRequests);
      }
    } catch (err) {
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      const response = await appointmentAPI.updateStatus(appointmentId, 'CONFIRMED');
      if (response.data.success) {
        toast.success('Appointment confirmed successfully');
        fetchBookingRequests();
      }
    } catch (err) {
      toast.error('Failed to confirm appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    
    try {
      const response = await appointmentAPI.updateStatus(appointmentId, 'CANCELLED');
      if (response.data.success) {
        toast.success('Appointment cancelled');
        fetchBookingRequests();
      }
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Booking Requests</h1>
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
        <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
          {requests.length} Pending
        </div>
      </div>

      <div className="space-y-4">
        {requests.map(request => (
          <div key={request.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-800">{request.patientName}</h3>
                    <p className="text-sm text-gray-600">Patient ID: {request.patientId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-semibold text-gray-800">{formatDate(request.appointmentDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <Clock size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="font-semibold text-gray-800">{request.appointmentTime}</p>
                    </div>
                  </div>
                </div>

                {request.reason && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Reason for Visit:</p>
                    <p className="text-gray-600">{request.reason}</p>
                  </div>
                )}

                {request.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes:</p>
                    <p className="text-gray-600">{request.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                <button
                  onClick={() => handleConfirm(request.id)}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <CheckCircle size={20} />
                  Confirm
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">All booking requests have been processed</p>
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
}
