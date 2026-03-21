import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { slotAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { Clock, Plus, Trash2, X } from 'lucide-react';
import type { Slot } from '@/types';

interface SlotForm {
  date: string;
  startTime: string;
  endTime: string;
}

const DEFAULT_FORM: SlotForm = { date: '', startTime: '', endTime: '' };

export default function CreateSlots() {
  const { user } = useAuth();
  const [slots, setSlots]         = useState<Slot[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState<SlotForm>(DEFAULT_FORM);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await slotAPI.getMy();
      if (res.data.success) setSlots(res.data.data ?? []);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await slotAPI.create({
        doctorId:  user!.id,
        date:      formData.date,
        startTime: `${formData.date}T${formData.startTime}:00`,
        endTime:   `${formData.date}T${formData.endTime}:00`,
      });
      if (res.data.success) {
        toast.success('Slot created');
        setShowForm(false);
        setFormData(DEFAULT_FORM);
        fetchSlots();
      }
    } catch {
      toast.error('Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const res = await slotAPI.delete(id);
      if (res.data.success) { toast.success('Slot deleted'); fetchSlots(); }
    } catch {
      toast.error('Failed to delete slot');
    }
  };

  const field = (label: string, type: 'date' | 'time', key: keyof SlotForm) => (
    <div>
      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={formData[key]}
        onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Slots</h1>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create Slot</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {field('Date', 'date', 'date')}
            {field('Start Time', 'time', 'startTime')}
            {field('End Time', 'time', 'endTime')}
            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-3 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Slot'}
            </button>
          </form>
        </div>
      )}

      {/* Slots Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map(slot => (
            <div key={slot.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete slot"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white mb-0.5">{formatDate(slot.date)}</p>
              <p className="text-sm text-neutral-500">{slot.startTime} – {slot.endTime}</p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                slot.available
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
              }`}>
                {slot.available ? 'Available' : 'Booked'}
              </span>
            </div>
          ))}

          {slots.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Clock size={36} className="mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-500">No slots created yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
