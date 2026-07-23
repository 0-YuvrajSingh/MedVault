import api from './axios';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventType: string;
}

export const timelineAPI = {
  getEvents: (role: string) => api.get<TimelineEvent[]>(`/${role}/timeline`),
};
