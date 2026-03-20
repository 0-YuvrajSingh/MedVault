import React, { useEffect, useState } from 'react';
import DashboardCharts from '../components/DashboardCharts';

export default function PatientDashboard() {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    fetch('/api/dashboard/summary').then(r => r.json()).then(setSummary).catch(()=>{});
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Patient Dashboard</h1>
      {!summary && <div>Loading...</div>}
      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {['appointments','documents','files','feedback'].map(k => (
              <div key={k} className="border rounded p-4 bg-white shadow">
                <div className="text-sm uppercase tracking-wide text-gray-500">{k}</div>
                <div className="text-2xl font-bold mt-1">{summary[k]}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">My Appointment Trend</h2>
            <DashboardCharts days={7} />
          </div>
        </>
      )}
    </div>
  );
}
