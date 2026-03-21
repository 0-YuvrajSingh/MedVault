// @ts-nocheck
import React,{ useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, reviewAPI, slotAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Calendar, Clock, User, X, Star, Trash2, RefreshCw, FileText } from 'lucide-react';
import Navbar from '../Navbar';
import PatientSidebar from './PatientSidebar';
import { AppointmentListSkeleton } from '../ui/Skeleton';

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getMyAppointments();
      if (response.data.success) {
        setAppointments(response.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    // Optimistic Update: Immediately update UI to show cancelled status
    const previousAppointments = [...appointments];
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
    ));

    try {
      const response = await appointmentAPI.cancel(appointmentId);
      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        // Optional: fetchAppointments() to sync fully, but UI is already correct
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (err) {
      // Rollback on error
      setAppointments(previousAppointments);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleSubmitReview = async () => {
    if (!review.rating || !review.comment.trim()) {
      toast.error('Please provide rating and comment');
      return;
    }

    try {
      const response = await reviewAPI.create({
        patientId: user.id,
        doctorId: selectedAppointment.doctorId,
        appointmentId: selectedAppointment.id,
        rating: review.rating,
        comment: review.comment.trim()
      });

      if (response.data.success) {
        toast.success('Review submitted successfully');
        setShowReviewModal(false);
        setReview({ rating: 5, comment: '' });
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  const handleReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    
    try {
      const response = await slotAPI.getAvailable(appointment.doctorId);
      const slotsData = response.data.slots || response.data.data || response.data || [];
      const availableSlotsFiltered = Array.isArray(slotsData) 
        ? slotsData.filter(slot => slot.available !== false && new Date(slot.endTime) > new Date())
        : [];
      setAvailableSlots(availableSlotsFiltered);
    } catch (err) {
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) {
      toast.error('Please select a new time slot');
      return;
    }

    try {
      const response = await appointmentAPI.update(selectedAppointment.id, {
        slotId: selectedSlot.id,
        appointmentDate: new Date(selectedSlot.startTime).toISOString().split('T')[0],
        appointmentTime: new Date(selectedSlot.startTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        rescheduleReason: rescheduleReason.trim()
      });

      if (response.data) {
        toast.success('Appointment rescheduled successfully');
        setShowRescheduleModal(false);
        setSelectedSlot(null);
        setRescheduleReason('');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <PatientSidebar />
        <div className="ml-64 pt-16 min-h-screen bg-slate-50">
          <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
            <AppointmentListSkeleton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>

          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">Dr. {appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialization}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center"><Calendar size={16} className="mr-1" />{formatDate(appointment.appointmentDate)}</span>
                        <span className="flex items-center"><Clock size={16} className="mr-1" />{appointment.appointmentTime}</span>
                      </div>
                      {appointment.reason && <p className="text-sm text-gray-600 mt-2">Reason: {appointment.reason}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    
                    {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                      <>
                        <button 
                          onClick={() => handleReschedule(appointment)} 
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                        >
                          <RefreshCw size={16} className="mr-1" />Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(appointment.id)} 
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <X size={16} className="mr-1" />Cancel
                        </button>
                      </>
                    )}

                    {appointment.prescription && (
                      <button 
                        onClick={() => { setSelectedAppointment(appointment); setShowPrescriptionModal(true); }} 
                        className="text-green-600 hover:text-green-700 text-sm flex items-center"
                      >
                        <FileText size={16} className="mr-1" />View Prescription
                      </button>
                    )}

                    {appointment.status === 'COMPLETED' && !appointment.reviewed && (
                      <button 
                        onClick={() => { setSelectedAppointment(appointment); setShowReviewModal(true); }} 
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                      >
                        <Star size={16} className="mr-1" />Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No appointments found</p>
              </div>
            )}
          </div>

          {/* Review Modal */}
          {showReviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setReview({ ...review, rating: star })} className={`text-2xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Share your experience..." />
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmitReview} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Reschedule Appointment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select New Time Slot</label>
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {availableSlots.length === 0 ? (
                        <p className="col-span-3 text-center text-gray-500 py-8">No available slots</p>
                      ) : (
                        availableSlots.map((slot, index) => (
                          <button
                            key={slot.id || index}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-lg border-2 text-sm ${
                              selectedSlot?.id === slot.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rescheduling</label>
                    <textarea 
                      value={rescheduleReason} 
                      onChange={(e) => setRescheduleReason(e.target.value)} 
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="Please provide a reason..." 
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => { setShowRescheduleModal(false); setSelectedSlot(null); setRescheduleReason(''); }} 
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleConfirmReschedule} 
                      disabled={!selectedSlot}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Modal */}
          {showPrescriptionModal && selectedAppointment?.prescription && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Prescription</h3>
                  <button onClick={() => setShowPrescriptionModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Doctor: Dr. {selectedAppointment.doctorName}</p>
                    <p className="text-sm text-gray-600">Date: {formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Prescription Details</h4>
                    <p className="whitespace-pre-wrap text-gray-700">{selectedAppointment.prescription}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
