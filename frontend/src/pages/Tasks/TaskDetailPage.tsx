import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import { FileUpload } from '../../components/tasks/FileUpload';
import { MarkdownEditor } from '../../components/common/MarkdownEditor';
import { MarkdownPreview } from '../../components/common/MarkdownPreview';
import { taskService } from '../../services/taskService';
import { commentService } from '../../services/commentService';
import { fileService } from '../../services/fileService';
import { Task } from '../../types/task.types';
import { Comment } from '../../types/comment.types';
import { FileMetadata } from '../../types/file.types';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import './TaskDetailPage.css';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadTaskData();
    }
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showStatusDropdown && !target.closest('.status-dropdown-wrapper')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskData, commentsData, filesData] = await Promise.all([
        taskService.getTaskById(id!),
        commentService.getCommentsByTaskId(id!),
        fileService.getFilesByTaskId(id!),
      ]);

      setTask(taskData);
      setComments(commentsData);
      setFiles(filesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const comment = await commentService.createComment(id!, {
        task_id: id!,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  const handleFileUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadedFiles = await fileService.uploadFiles(id!, selectedFiles);
      setFiles((prev) => [...prev, ...uploadedFiles]);
      toast.success(`${selectedFiles.length} file(s) uploaded!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      await fileService.downloadFile(fileId, fileName);
      toast.success('File download started!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download file');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      toast.success('File deleted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete file');
    }
  };

  const handleDeleteTask = async () => {
    try {
      setDeleting(true);
      await taskService.deleteTask(id!);
      toast.success('Task deleted successfully!');
      navigate('/tasks');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      setShowStatusDropdown(false);
      const updatedTask = await taskService.updateTask(id!, { status: newStatus as any });
      setTask(updatedTask);
      toast.success(`Status updated to ${newStatus}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen text="Loading task..." />
      </Layout>
    );
  }

  if (error || !task) {
    return (
      <Layout>
        <ErrorMessage
          message={error || 'Task not found'}
          onRetry={loadTaskData}
        />
      </Layout>
    );
  }

  const isCreator = (task.created_by as any)._id === (user as any)?._id;

  return (
    <Layout>
      <div className="task-detail-page">
        <div className="page-header-detail">
          <div className="header-left">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/tasks')}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginRight: '6px' }}>
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Tasks
            </Button>
          </div>
          <div className="page-actions">
            {/* Status Update Dropdown */}
            <div className="status-dropdown-wrapper">
              <Button
                variant="primary"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updatingStatus}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                  <path
                    d="M14 9L13 14L8 11.5L3 14L2 9M8 10V1M8 1L11 4M8 1L5 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
              {showStatusDropdown && (
                <div className="status-dropdown-menu">
                  <button
                    className={`status-option ${task.status === 'todo' ? 'active' : ''}`}
                    onClick={() => handleStatusUpdate('todo')}
                    disabled={task.status === 'todo'}
                  >
                    <span className="status-indicator todo"></span>
                    To Do
                  </button>
                  <button
                    className={`status-option ${task.status === 'in_progress' ? 'active' : ''}`}
                    onClick={() => handleStatusUpdate('in_progress')}
                    disabled={task.status === 'in_progress'}
                  >
                    <span className="status-indicator in_progress"></span>
                    In Progress
                  </button>
                  <button
                    className={`status-option ${task.status === 'completed' ? 'active' : ''}`}
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={task.status === 'completed'}
                  >
                    <span className="status-indicator completed"></span>
                    Completed
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                <path
                  d="M7 2H2C1.44772 2 1 2.44772 1 3V14C1 14.5523 1.44772 15 2 15H13C13.5523 15 14 14.5523 14 14V9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 1L15 3L8 10H6V8L13 1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </Button>
            {isCreator && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
                  <path
                    d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M13 4V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Task Details */}
        <Card>
          <div className="task-header">
            <h1 className="task-title">{task.title}</h1>
            <div className="task-badges">
              <Badge status={task.status}>{task.status}</Badge>
              <Badge priority={task.priority}>{task.priority}</Badge>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta-grid">
            <div className="task-meta-item">
              <span className="meta-label">Created By</span>
              <span className="meta-value">{task.created_by.name}</span>
            </div>
            <div className="task-meta-item">
              <span className="meta-label">Created</span>
              <span className="meta-value">{formatDateTime(task.createdAt)}</span>
            </div>
            {task.assigned_to && (
              <div className="task-meta-item">
                <span className="meta-label">Assigned To</span>
                <span className="meta-value">{task.assigned_to.name}</span>
              </div>
            )}
            {task.due_date && (
              <div className="task-meta-item">
                <span className="meta-label">Due Date</span>
                <span className="meta-value">{formatDate(task.due_date)}</span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="task-meta-item">
                <span className="meta-label">Tags</span>
                <div className="task-tags">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="task-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Files */}
        <Card>
          <h2 className="section-title">Files ({files.length})</h2>

          <FileUpload onFilesSelected={handleFileUpload} />

          {uploadingFiles && (
            <div className="upload-progress">
              <Loader text="Uploading files..." />
            </div>
          )}

          {files.length > 0 && (
            <div className="files-list">
              {files.map((file) => (
                <div key={file._id} className="file-item">
                  <div className="file-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 21H17C18.1046 21 19 20.1046 19 19V9L13 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 3V9H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="file-info">
                    <p className="file-name">{file.original_name}</p>
                    <p className="file-meta">
                      {(file.size / 1024).toFixed(2)} KB • {formatDateTime(file.createdAt)}
                    </p>
                  </div>
                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      onClick={() => handleFileDownload(file._id, file.original_name)}
                    >
                      Download
                    </button>
                    <button
                      className="file-action-btn delete"
                      onClick={() => handleFileDelete(file._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Comments */}
        <Card>
          <h2 className="section-title">Comments ({comments.length})</h2>

          <form onSubmit={handleAddComment} className="comment-form">
            <MarkdownEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Write a comment... (Markdown supported)"
              disabled={submittingComment}
              minHeight="120px"
            />
            <Button type="submit" loading={submittingComment} disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </form>

          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <strong>{comment.user_id.name}</strong>
                      <span className="comment-date">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    {(comment.user_id as any)._id === (user as any)?._id && (
                      <button
                        className="comment-delete"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="comment-content">
                    <MarkdownPreview content={comment.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteTask}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
        />
      </div>
    </Layout>
  );
};
