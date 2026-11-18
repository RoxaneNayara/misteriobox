import type { MissionCatalogItem } from '../types/api';
import { apiRequest } from './client';

export const missionsApi = {
  list(): Promise<MissionCatalogItem[]> {
    return apiRequest('/missions');
  },
};
