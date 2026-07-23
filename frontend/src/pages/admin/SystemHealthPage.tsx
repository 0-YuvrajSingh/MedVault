import React from 'react';
import { Card } from '../../components/ui/Card';
import { Activity, Server, Database, HardDrive } from 'lucide-react';
import { useHealth } from '../../hooks/useHealthQuery';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const SystemHealthPage: React.FC = () => {
  const { data: health, isLoading, isError } = useHealth();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>System Health</h1>
        <p>Real-time monitoring of infrastructure and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-700">API Status</h3>
          </div>
          <div className={`text-xl font-bold ${isError ? 'text-red-600' : 'text-slate-900'}`}>
            {isError ? 'Offline' : health?.apiStatus || 'Unknown'}
          </div>
          <p className="text-xs text-slate-400">
            {health ? `${Math.floor(health.uptimeMs / 3600000)}h ${Math.floor((health.uptimeMs % 3600000) / 60000)}m uptime` : 'N/A'}
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server className="w-4 h-4" /></div>
            <h3 className="text-sm font-medium text-slate-700">CPU</h3>
          </div>
          <div className="text-xl font-bold text-slate-900">{health ? `${health.cpuCores} cores` : 'N/A'}</div>
          <p className="text-xs text-slate-400">Available processors on this application instance</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><HardDrive className="w-4 h-4" /></div>
            <h3 className="text-sm font-medium text-slate-700">Memory</h3>
          </div>
          <div className="text-xl font-bold text-slate-900">{health ? `${health.usedMemoryMB} MB` : 'N/A'}</div>
          <p className="text-xs text-slate-400">
            {health ? `${Math.round(health.usedMemoryMB / health.totalMemoryMB * 100)}% of ${health.totalMemoryMB} MB` : 'N/A'}
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${health?.database === 'Connected' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-700">Database</h3>
          </div>
          <div className="text-xl font-bold text-slate-900">{health?.database || 'Unknown'}</div>
          <Badge variant={health?.database === 'Connected' ? 'success' : 'danger'} dot>
            {health?.database === 'Connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthPage;
