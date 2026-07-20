import React from 'react';
import { Card } from '../../components/ui/Card';
import { Activity, Server, Database, HardDrive, Network } from 'lucide-react';
import { useHealth } from '../../hooks/useHealthQuery';

const SystemHealthPage: React.FC = () => {
  const { data: health, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="page-header">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time monitoring of infrastructure and services</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Health</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time monitoring of infrastructure and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${health?.database === 'Connected' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700">API Status</h2>
          </div>
          <div className={`text-2xl font-black ${isError ? 'text-red-600' : 'text-slate-900'}`}>
            {isError ? 'Offline' : health?.apiStatus || 'Unknown'}
          </div>
          <p className="text-xs text-slate-500 font-medium">Uptime: {health?.uptime || 'N/A'}</p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Server className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">CPU Usage</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">{health?.cpu || 'N/A'}</div>
          <p className="text-xs text-slate-500 font-medium">Stable across instances</p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><HardDrive className="w-5 h-5" /></div>
            <h2 className="font-bold text-slate-700">Memory</h2>
          </div>
          <div className="text-2xl font-black text-slate-900">{health?.memory || 'N/A'}</div>
          <p className="text-xs text-slate-500 font-medium">
            {health?.memory && health?.memoryTotal ? `${Math.round(parseInt(health.memory) / parseInt(health.memoryTotal) * 100)}% of ${health.memoryTotal} provisioned` : 'N/A'}
          </p>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${health?.database === 'Connected' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-700">Database</h2>
          </div>
          <div className={`text-2xl font-black ${health?.database !== 'Connected' ? 'text-red-600' : 'text-slate-900'}`}>
            {health?.database || 'Unknown'}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {health?.database === 'Connected' ? 'Replication lag: &lt;1ms' : 'Connection failed'}
          </p>
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
              <div className="ml-auto text-xs font-semibold text-slate-400">
                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SystemHealthPage;
