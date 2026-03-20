import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { slotAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';
import { Clock, Plus, Trash2 } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';

export default function CreateSlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, [user]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotAPI.getMy();
      if (response.data.success) setSlots(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all fields');
      return;
    }

    // Combine date and time into ISO strings for backend
    const startTime = `${formData.date}T${formData.startTime}:00`;
    const endTime = `${formData.date}T${formData.endTime}:00`;

    try {
      const response = await slotAPI.create({
        doctorId: user.id,
        date: formData.date,
        startTime,
        endTime
      });
      if (response.data.success) {
        toast.success('Slot created successfully');
        setShowForm(false);
        setFormData({ date: '', startTime: '', endTime: '' });
        fetchSlots();
      }
    } catch (err) {
      toast.error('Failed to create slot');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const response = await slotAPI.delete(slotId);
      if (response.data.success) {
        toast.success('Slot deleted');
        fetchSlots();
      }
    } catch (err) {
      toast.error('Failed to delete slot');
    }
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
        <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Slots</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          {!showForm && <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancel' : 'Create Slot'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label><input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">End Time</label><input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <button type="submit" className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create Slot</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map(slot => (
          <div key={slot.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="text-blue-600" size={24} /></div>
              <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:text-red-700"><Trash2 size={18} /></button>
            </div>
            <p className="font-semibold text-gray-800">{formatDate(slot.date)}</p>
            <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${slot.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{slot.available ? 'Available' : 'Booked'}</span>
          </div>
        ))}
        {slots.length === 0 && <div className="col-span-full text-center py-12 text-gray-500"><Clock size={48} className="mx-auto mb-4 opacity-50" /><p>No slots created</p></div>}
      </div>
        </div>
      </div>
    </>
  );
}
