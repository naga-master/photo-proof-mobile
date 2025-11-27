import { create } from 'zustand';
import { photoService } from '@/services/api/photos';

interface NotificationsState {
  processingIssuesCount: number;
  fetchProcessingIssues: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  processingIssuesCount: 0,
  
  fetchProcessingIssues: async () => {
    try {
      const data = await photoService.getProcessingIssues();
      set({ processingIssuesCount: data.total_failed });
    } catch (error) {
      console.error('Failed to fetch processing issues:', error);
      // Don't update count on error - keep previous value
    }
  },
}));
