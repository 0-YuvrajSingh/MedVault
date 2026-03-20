import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardCharts({ days = 7 }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Polling for real-time chart updates every 10 seconds
  const intervalRef = useRef();
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/series?days=${days}`);
        if (!res.ok) throw new Error('Failed to load series');
        const data = await res.json();
        const list = Object.entries(data.series).map(([date, count]) => ({ date, count }));
        if (isMounted) setSeries(list);
      } catch (e) { if (isMounted) setError(e.message); } finally { if (isMounted) setLoading(false); }
    };
    load();
    intervalRef.current = setInterval(load, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalRef.current);
    };
  }, [days]);

  if (loading) return <div className="text-sm text-gray-500">Loading chart...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
