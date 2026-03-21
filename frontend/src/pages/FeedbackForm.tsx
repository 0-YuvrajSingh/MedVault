import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewAPI } from '@/api';
import { toast } from '@/utils/toast';
import { Star, Send, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackState {
  doctorId: string;
  message:  string;
  rating:   number;
}

const DEFAULT: FeedbackState = { doctorId: '', message: '', rating: 5 };

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeedbackForm() {
  const { user }   = useAuth();
  const [form,     setForm]       = useState<FeedbackState>(DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const inputCls = 'w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorId.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewAPI.create({
        patientId: (user as any)?.patientId ?? user?.id,
        doctorId:  Number(form.doctorId),
        comment:   form.message,
        rating:    form.rating,
      });
      toast.success('Feedback submitted!');
      setSubmitted(true);
      setForm(DEFAULT);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-7">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Submit Feedback</h1>
        <p className="text-sm text-neutral-500 mb-6">Share your experience with your doctor</p>

        {submitted && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-5">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">Feedback submitted successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Doctor ID</label>
            <input type="text" required value={form.doctorId}
              onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
              className={inputCls} placeholder="Enter doctor's ID" />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                  className="transition-transform hover:scale-110">
                  <Star size={28} className={s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Message</label>
            <textarea required value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className={`${inputCls} min-h-28 resize-none`}
              placeholder="Describe your experience…" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send size={15} />
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
