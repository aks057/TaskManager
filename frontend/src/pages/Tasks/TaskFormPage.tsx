import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { TaskStatus, TaskPriority } from '../../types/task.types';
import { UserListItem } from '../../types/user.types';
import './TaskFormPage.css';

export const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
    tags: '',
    assigned_to: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
    if (isEditing) {
      loadTask();
    }
  }, [id]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const userList = await userService.getAllUsers();
      setUsers(userList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadTask = async () => {
    try {
      setLoading(true);
      const task = await taskService.getTaskById(id!);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        tags: task.tags?.join(', ') || '',
        assigned_to: task.assigned_to?.id || '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const data: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        assigned_to: formData.assigned_to || undefined,
      };

      if (isEditing) {
        await taskService.updateTask(id!, data);
        toast.success('Task updated successfully!');
      } else {
        const newTask = await taskService.createTask(data);
        toast.success('Task created successfully!');
        navigate(`/tasks/${newTask._id}`);
        return;
      }

      navigate(`/tasks/${id}`);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen text="Loading task..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="task-form-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEditing ? 'Edit Task' : 'Create Task'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update task details below' : 'Fill in the details to create a new task'}
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="task-form">
            <Input
              label="Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              placeholder="Enter task title"
              required
              fullWidth
              autoFocus
            />

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={6}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={formData.assigned_to}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                  disabled={loadingUsers}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="Tags"
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g. frontend, bug, urgent"
                fullWidth
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(isEditing ? `/tasks/${id}` : '/tasks')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {isEditing ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
