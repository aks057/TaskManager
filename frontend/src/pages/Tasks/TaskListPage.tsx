import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { taskService } from '../../services/taskService';
import { Task, TaskStatus, TaskPriority } from '../../types/task.types';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import './TaskListPage.css';

export const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(search, 500);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: 10,
        sort: '-createdAt',
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      const response = await taskService.getTasks(params);
      setTasks(response.tasks);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || priorityFilter;

  if (loading && tasks.length === 0) {
    return (
      <Layout>
        <Loader fullScreen text="Loading tasks..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="task-list-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">
              {total} {total === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          <Button onClick={() => navigate('/tasks/new')} variant="primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '4px' }}>
              <path
                d="M10 5V15M5 10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="filters-section">
            <div className="filters-grid">
              {/* Search Input with Icon */}
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 19L14.65 14.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tasks by title or description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                {search && (
                  <button
                    className="clear-search-btn"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter with Icon */}
              <div className="filter-select-wrapper">
                <svg className="filter-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4H14M4 8H12M6 12H10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as TaskStatus | '');
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter with Icon */}
              <div className="filter-select-wrapper">
                <svg className="filter-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2L10 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6L8 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <select
                  className="filter-select"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value as TaskPriority | '');
                    setPage(1);
                  }}
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                  className="clear-filters-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '4px' }}>
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <ErrorMessage message={error} onRetry={loadTasks} />
        )}

        {/* Empty State */}
        {!error && tasks.length === 0 && !loading && (
          <EmptyState
            title={hasFilters ? 'No tasks found' : 'No tasks yet'}
            message={
              hasFilters
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by creating your first task!'
            }
            action={
              hasFilters
                ? { label: 'Clear Filters', onClick: handleClearFilters }
                : { label: 'Create Task', onClick: () => navigate('/tasks/new') }
            }
          />
        )}

        {/* Tasks List */}
        {!error && tasks.length > 0 && (
          <>
            <div className="tasks-grid">
              {tasks.map((task) => (
                <Card key={task._id} className="task-card">
                  <div
                    className="task-card-content"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <div className="task-card-header">
                      <h3 className="task-card-title">{task.title}</h3>
                      <div className="task-card-badges">
                        <Badge status={task.status}>{task.status}</Badge>
                        <Badge priority={task.priority}>{task.priority}</Badge>
                      </div>
                    </div>

                    {task.description && (
                      <p className="task-card-description">
                        {task.description.substring(0, 150)}
                        {task.description.length > 150 ? '...' : ''}
                      </p>
                    )}

                    <div className="task-card-footer">
                      <div className="task-card-meta">
                        {task.due_date && (
                          <span className="task-meta-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M11 2.66667V1.33334M5 2.66667V1.33334M2.33333 6H13.6667M3 3.33334H13C13.3682 3.33334 13.6667 3.63181 13.6667 4V13.3333C13.6667 13.7015 13.3682 14 13 14H3C2.63181 14 2.33333 13.7015 2.33333 13.3333V4C2.33333 3.63181 2.63181 3.33334 3 3.33334Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {formatDate(task.due_date)}
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <span className="task-meta-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M2 7.33334L7.33333 2L14 8.66667L8.66667 14L2 7.33334Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.33333 5.33334H5.34"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {task.tags.length} {task.tags.length === 1 ? 'tag' : 'tags'}
                          </span>
                        )}
                      </div>
                      <span className="task-created-date">
                        Created {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Loading overlay when filtering */}
        {loading && tasks.length > 0 && (
          <div className="loading-overlay">
            <Loader text="Loading..." />
          </div>
        )}
      </div>
    </Layout>
  );
};
