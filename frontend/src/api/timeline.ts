import api from './axios';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'appointment' | 'record' | 'other';
}

export const timelineAPI = {
  getEvents: (role: string) => api.get<TimelineEvent[]>(`/${role}/timeline`),
};
