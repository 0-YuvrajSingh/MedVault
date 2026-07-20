import { useQuery } from '@tanstack/react-query';
import { healthAPI } from '../api/health';
import type { SystemHealth } from '../types';

export function useHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['health'],
    queryFn: () => healthAPI.getHealth().then(r => r.data),
    refetchInterval: 30000,
  });
}
