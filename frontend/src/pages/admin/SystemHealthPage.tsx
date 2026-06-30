import React from 'react';
import { Card } from '../../components/ui/Card';
import { Activity, Server, Database, HardDrive, Network } from 'lucide-react';

const SystemHealthPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Health</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time monitoring of infrastructure and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">API Status</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">Operational</div>
          <p className="text-xs text-slate-500 font-medium">99.9% uptime (last 30 days)</p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Server className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">CPU Usage</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">14.2%</div>
          <p className="text-xs text-slate-500 font-medium">Stable across 4 instances</p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><HardDrive className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">Memory</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">4.1 GB</div>
          <p className="text-xs text-slate-500 font-medium">51% of 8.0 GB provisioned</p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg"><Database className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">Database</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">Connected</div>
          <p className="text-xs text-slate-500 font-medium">Replication lag: 12ms</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Recent Service Events</h2>
          <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Network className="w-4 h-4" /> Live
          </span>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Automated Backup Complete</h3>
                <p className="text-xs text-slate-500 mt-1">Database snapshot created and stored securely.</p>
              </div>
              <div className="ml-auto text-xs font-semibold text-slate-400">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SystemHealthPage;
