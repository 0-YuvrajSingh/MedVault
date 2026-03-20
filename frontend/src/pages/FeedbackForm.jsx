import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function FeedbackForm() {
  const { token, user } = useAuth();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          patientId: user?.patientId || user?.id,
          doctorId,
          message,
          rating
        })
      });
      if (!res.ok) throw new Error('Failed to submit');
      const data = await res.json();
      setStatus({ ok: true, msg: 'Feedback submitted', data });
      setMessage('');
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Submit Feedback</h1>
      <form onSubmit={submitFeedback} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doctor ID</label>
          <input
            type="text"
            required
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="UUID of doctor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="Write your feedback"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
      {status && (
        <div className={`mt-4 p-3 rounded ${status.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status.msg}</div>
      )}
    </div>
  );
}
