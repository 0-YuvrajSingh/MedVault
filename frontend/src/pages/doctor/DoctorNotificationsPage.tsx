import React from 'react';
import { Card } from '../../components/ui/Card';
import { Bell } from 'lucide-react';

const DoctorNotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">Updates on your patients and system alerts</p>
      </div>

      <Card className="p-8 text-center border-dashed">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Bell className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up</h3>
        <p className="text-slate-500">You have no unread notifications at this time.</p>
      </Card>
    </div>
  );
};

export default DoctorNotificationsPage;
