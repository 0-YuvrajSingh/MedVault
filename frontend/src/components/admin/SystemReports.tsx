import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Download, FileText, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/api';
import logger from '@/utils/logger';
import { toast } from '@/utils/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportId = 'user-analytics' | 'appointment-stats' | 'system-health' | 'revenue-report';

interface ReportType {
  id:          ReportId;
  title:       string;
  description: string;
  icon:        React.ComponentType<{ className?: string }>;
  color:       string;
  bg:          string;
}

const REPORT_TYPES: ReportType[] = [
  { id: 'user-analytics',    title: 'User Analytics',          description: 'Detailed user registration and activity metrics',     icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'appointment-stats', title: 'Appointment Statistics',  description: 'Comprehensive appointment booking and completion data', icon: Calendar,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
  { id: 'system-health',     title: 'System Health Report',    description: 'Platform performance and health metrics',              icon: Activity,   color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { id: 'revenue-report',    title: 'Revenue Report',          description: 'Financial transactions and revenue analytics',         icon: TrendingUp, color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950/30' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SystemReports() {
  const [selected,  setSelected]  = useState<ReportId | ''>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading,   setLoading]   = useState(false);

  const handleGenerate = async () => {
    if (!selected)             { toast.error('Please select a report type'); return; }
    if (!dateRange.start || !dateRange.end) { toast.error('Please select a date range'); return; }

    try {
      setLoading(true);
      let reportData: Record<string, unknown> = {};

      switch (selected) {
        case 'user-analytics': {
          const res = await adminAPI.getUsers({ startDate: dateRange.start, endDate: dateRange.end });
          reportData = { totalUsers: res.data?.length ?? 0, dateRange, reportType: 'User Analytics', generatedAt: new Date().toISOString() };
          break;
        }
        case 'appointment-stats':
        case 'system-health': {
          const res = await adminAPI.getDashboardStats();
          reportData = { data: res.data ?? {}, dateRange, reportType: selected, generatedAt: new Date().toISOString() };
          break;
        }
        case 'revenue-report':
          toast.error('Revenue reporting coming soon');
          return;
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${selected}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (err) {
      logger.error('Report error:', err);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="text-purple-600" size={24} /> System Reports
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">Generate comprehensive analytics and reports</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Report type selection */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Select Report Type</h2>
          {REPORT_TYPES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(r.id)}
                className={`bg-white dark:bg-neutral-900 rounded-2xl border p-5 cursor-pointer transition-all ${
                  selected === r.id
                    ? 'border-purple-400 dark:border-purple-600 shadow-md ring-1 ring-purple-300 dark:ring-purple-700'
                    : 'border-neutral-200 dark:border-neutral-800 hover:shadow-md'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${r.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">{r.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{r.description}</p>
                  </div>
                  {selected === r.id && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Config panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Report Configuration</h2>
            <div className="space-y-4">
              {([
                { label: 'Start Date', key: 'start' as const },
                { label: 'End Date',   key: 'end' as const },
              ]).map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">{f.label}</label>
                  <input type="date" value={dateRange[f.key]} onChange={e => setDateRange(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <button onClick={handleGenerate} disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Download size={16} />
                {loading ? 'Generating…' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-5 text-white">
            <h3 className="font-semibold mb-3 text-sm">Quick Stats</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Reports Generated', value: '0' },
                { label: 'Last Generated',    value: 'Never' },
              ].map(i => (
                <div key={i.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/80">{i.label}</span>
                  <span className="text-sm font-bold">{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
