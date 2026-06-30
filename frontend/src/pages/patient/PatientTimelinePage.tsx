import React from 'react';
import { Card } from '../../components/ui/Card';
import { Calendar } from 'lucide-react';

const PatientTimelinePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Timeline</h1>
        <p className="text-sm text-slate-500 mt-1">Your upcoming appointments and health timeline</p>
      </div>

      <Card className="p-8 text-center border-dashed">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Upcoming Events</h3>
        <p className="text-slate-500">You don't have any appointments scheduled.</p>
      </Card>
    </div>
  );
};

export default PatientTimelinePage;
