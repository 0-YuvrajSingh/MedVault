import { useQuery } from '@tanstack/react-query';
import { timelineAPI } from '../api/timeline';
import type { TimelineEvent } from '../api/timeline';

export function useTimelineEvents(role: string) {
  return useQuery<TimelineEvent[]>({
    queryKey: [role, 'timeline'],
    queryFn: () => timelineAPI.getEvents(role).then(r => r.data),
  });
}
