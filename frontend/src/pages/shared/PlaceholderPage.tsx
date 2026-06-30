import React from 'react';
import { Card } from '../../components/ui/Card';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/').pop()?.replace('-', ' ') || 'Page';
  
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="page-header flex flex-col mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 capitalize">{pathName}</h1>
        <p className="text-slate-500">This section is currently under development.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-24 text-center border-dashed">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
          <Construction className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-slate-500 max-w-md">
          The <span className="font-semibold capitalize">{pathName}</span> feature is currently being built by our engineering team. Check back later for updates.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
