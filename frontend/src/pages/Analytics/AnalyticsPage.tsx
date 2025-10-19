import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useToast } from '../../components/common/Toast';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsStats, TaskTrend } from '../../types/analytics.types';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import './AnalyticsPage.css';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [trends, setTrends] = useState<TaskTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, trendsData] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getTrends(),
      ]);

      setStats(statsData);
      setTrends(trendsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data with useMemo (must be before any conditional returns)
  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'To Do', value: stats.byStatus['todo'] || 0, color: '#94a3b8' },
      { name: 'In Progress', value: stats.byStatus['in_progress'] || 0, color: '#3b82f6' },
      { name: 'Completed', value: stats.byStatus['completed'] || 0, color: '#22c55e' },
    ];
  }, [stats]);

  const priorityData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Low', value: stats.byPriority['low'] || 0, color: '#94a3b8' },
      { name: 'Medium', value: stats.byPriority['medium'] || 0, color: '#0ea5e9' },
      { name: 'High', value: stats.byPriority['high'] || 0, color: '#f97316' },
      { name: 'Critical', value: stats.byPriority['critical'] || 0, color: '#ef4444' },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.map((t) => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: t.created,
      completed: t.completed,
    }));
  }, [trends]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      await analyticsService.exportAnalytics(format);
      toast.success(`Analytics exported as ${format.toUpperCase()}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen text="Loading analytics..." />
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <ErrorMessage message={error || 'No data available'} onRetry={loadAnalytics} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="analytics-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Insights and trends for your tasks</p>
          </div>
          <div className="export-buttons">
            <Button
              variant="secondary"
              onClick={() => handleExport('csv')}
              loading={exporting}
              disabled={exporting}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                <path
                  d="M14 10V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V10M11 7L8 10M8 10L5 7M8 10V2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('json')}
              loading={exporting}
              disabled={exporting}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                <path
                  d="M14 10V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V10M11 7L8 10M8 10L5 7M8 10V2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export JSON
            </Button>
          </div>
        </div>

        <div className="stats-overview">
          <Card><div className="stat-box"><h3>Total Tasks</h3><p className="stat-number">{stats.total}</p></div></Card>
          <Card><div className="stat-box"><h3>Completed</h3><p className="stat-number success">{stats.completed}</p></div></Card>
          <Card><div className="stat-box"><h3>In Progress</h3><p className="stat-number info">{stats.byStatus['in_progress'] || 0}</p></div></Card>
          <Card><div className="stat-box"><h3>Overdue</h3><p className="stat-number danger">{stats.overdue}</p></div></Card>
        </div>

        <div className="charts-grid">
          <Card>
            <h2 className="chart-title">Tasks by Status</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="chart-title">Tasks by Priority</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Tasks"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="chart-title">Tasks Trend (Last 30 Days)</h2>
          <div className="chart-container-large">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#22c55e' }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
