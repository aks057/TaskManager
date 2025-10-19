import api from './api';
import {
  AnalyticsStats,
  TaskTrend,
  OverviewStats,
  UserPerformance,
  TrendPeriod,
  ExportFormat,
} from '../types/analytics.types';

export const analyticsService = {
  async getStats(): Promise<AnalyticsStats> {
    const response = await api.get<{ data: AnalyticsStats }>('/analytics/overview');
    return response.data.data;
  },

  async getTrends(period: TrendPeriod = 'month'): Promise<TaskTrend[]> {
    const response = await api.get<{ data: TaskTrend[] }>('/analytics/trends', {
      params: { period },
    });
    return response.data.data;
  },

  async exportAnalytics(format: ExportFormat): Promise<void> {
    const response = await api.get('/analytics/export', {
      params: { format },
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async getOverview(): Promise<OverviewStats> {
    const response = await api.get<{ data: OverviewStats }>('/analytics/overview');
    return response.data.data;
  },

  async getUserPerformance(): Promise<UserPerformance> {
    const response = await api.get<{ data: UserPerformance }>('/analytics/user-performance');
    return response.data.data;
  },

  async exportTasks(
    format: ExportFormat,
    filters?: {
      status?: string;
      priority?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Blob> {
    const params: any = { format, ...filters };

    const response = await api.get('/analytics/export', {
      params,
      responseType: 'blob',
    });

    return response.data;
  },

  triggerExportDownload(blob: Blob, format: ExportFormat): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-export-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
