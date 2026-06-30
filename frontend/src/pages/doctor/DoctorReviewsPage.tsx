import React from 'react';
import { Card } from '../../components/ui/Card';
import { Star } from 'lucide-react';

const DoctorReviewsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Feedback and ratings from your patients</p>
      </div>

      <Card className="p-8 text-center border-dashed">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <Star className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Reviews Yet</h3>
        <p className="text-slate-500">You haven't received any patient reviews yet.</p>
      </Card>
    </div>
  );
};

export default DoctorReviewsPage;
