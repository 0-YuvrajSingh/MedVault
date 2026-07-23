import React from 'react';
import { Card } from '../../components/ui/Card';
import { Calendar, Stethoscope, FileText, Clock } from 'lucide-react';
import { useTimelineEvents } from '../../hooks/useTimelineQuery';
import type { TimelineEvent } from '../../api/timeline';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const eventConfig: Record<string, { icon: React.ReactNode; color: string; badge: 'info' | 'success' | 'warning' | 'neutral' }> = {
  APPOINTMENT: { icon: <Stethoscope className="w-4 h-4" />, color: 'text-blue-600', badge: 'info' },
  RECORD_CREATED: { icon: <FileText className="w-4 h-4" />, color: 'text-green-600', badge: 'success' },
  RECORD_UPDATED: { icon: <FileText className="w-4 h-4" />, color: 'text-amber-600', badge: 'warning' },
  OTHER: { icon: <Clock className="w-4 h-4" />, color: 'text-slate-600', badge: 'neutral' },
};

const TimelineEntry: React.FC<{ event: TimelineEvent }> = ({ event }) => {
  const config = eventConfig[event.eventType] || eventConfig.OTHER;
  const isUpcoming = new Date(event.eventDate) > new Date();

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white z-10 ${isUpcoming ? 'bg-blue-500' : 'bg-slate-300'}`} />
      <div className="absolute left-[0.45rem] top-4 bottom-0 w-px bg-slate-100 last:hidden" />
      <Card className={`p-4 ${isUpcoming ? 'border-blue-100 bg-blue-50/30' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${config.color}`}>
              {config.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
              {event.description && <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>}
            </div>
          </div>
          <div className="shrink-0">
            {isUpcoming ? (
              <Badge variant="info" dot>Upcoming</Badge>
            ) : (
              <span className="text-xs text-slate-400">{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const DoctorTimelinePage: React.FC = () => {
  const { data: events = [], isLoading, isError } = useTimelineEvents('doctor');

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6 pb-12">
        <div className="page-header">
          <h1>Timeline</h1>
          <p>Unable to load events</p>
        </div>
        <Card>
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-danger-500" />}
            title="Failed to load timeline"
            description="An error occurred while fetching the timeline. Please try again."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Timeline</h1>
        <p>{events.length} events recorded</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title="No Upcoming Events"
            description="Your schedule is currently clear."
          />
        </Card>
      ) : (
        <div className="ml-2">
          {events.map(e => (
            <TimelineEntry key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorTimelinePage;
