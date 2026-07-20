import api from './axios';
import type { SystemHealth } from '../types';

export const healthAPI = {
  getHealth: () => api.get<SystemHealth>('/health'),
};
