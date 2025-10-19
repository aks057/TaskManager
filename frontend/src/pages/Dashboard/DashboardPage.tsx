import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { analyticsService } from '../../services/analyticsService';
import { taskService } from '../../services/taskService';
import { Task } from '../../types/task.types';
import { AnalyticsStats, TaskTrend } from '../../types/analytics.types';
import { formatDate } from '../../utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [trends, setTrends] = useState<TaskTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, tasksData, trendsData] = await Promise.all([
        analyticsService.getStats(),
        taskService.getTasks({ page: 1, limit: 5, sort: '-createdAt' }),
        analyticsService.getTrends('day'),
      ]);

      console.log('📊 Dashboard Stats:', statsData);
      console.log('📋 Recent Tasks:', tasksData.tasks);
      console.log('📈 Trends:', trendsData);

      setStats(statsData);
      setRecentTasks(tasksData.tasks);
      setTrends(trendsData);
    } catch (err: any) {
      console.error('❌ Dashboard Error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Recharts data format
  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'To Do', value: stats.byStatus['todo'] || 0, color: '#94a3b8' },
      { name: 'In Progress', value: stats.byStatus['in_progress'] || 0, color: '#3b82f6' },
      { name: 'Completed', value: stats.byStatus['completed'] || 0, color: '#22c55e' },
    ];
  }, [stats]);

  const priorityChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { priority: 'Low', count: stats.byPriority['low'] || 0, fill: '#10b981' },
      { priority: 'Medium', count: stats.byPriority['medium'] || 0, fill: '#f59e0b' },
      { priority: 'High', count: stats.byPriority['high'] || 0, fill: '#f97316' },
      { priority: 'Critical', count: stats.byPriority['critical'] || 0, fill: '#ef4444' },
    ];
  }, [stats]);

  const trendsChartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: trend.created,
      completed: trend.completed,
    }));
  }, [trends]);

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen text="Loading dashboard..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} onRetry={loadDashboardData} />
      </Layout>
    );
  }

  if (!stats || statusChartData.length === 0) {
    return (
      <Layout>
        <ErrorMessage message="No data available" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your tasks and progress</p>
          </div>
          <Button onClick={() => navigate('/tasks')} variant="primary">
            View All Tasks
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            color="primary"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            color="success"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <StatCard
            title="In Progress"
            value={stats.byStatus['in_progress'] || 0}
            color="info"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            color="danger"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <Card>
            <h2 className="chart-title">Tasks by Status</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {statusChartData.map((entry, index) => (
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
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Trends Chart - New! */}
        {trendsChartData.length > 0 && (
          <Card>
            <h2 className="chart-title">Task Trends (Last 30 Days)</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsChartData}>
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
        )}

        {/* Recent Tasks */}
        <Card>
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/tasks')}
            >
              View All
            </Button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Create your first task to get started!</p>
              <Button onClick={() => navigate('/tasks')}>Create Task</Button>
            </div>
          ) : (
            <div className="recent-tasks-list">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="task-item"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  <div className="task-item-main">
                    <h3 className="task-item-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-item-description">
                        {task.description.substring(0, 100)}
                        {task.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="task-item-meta">
                    <Badge status={task.status}>{task.status}</Badge>
                    <Badge priority={task.priority}>{task.priority}</Badge>
                    {task.due_date && (
                      <span className="task-due-date">
                        Due: {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};
