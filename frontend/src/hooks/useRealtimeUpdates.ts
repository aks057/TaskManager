import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Task } from '../types/task.types';
import { Comment } from '../types/comment.types';
import { FileMetadata } from '../types/file.types';

interface UseRealtimeUpdatesProps {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onCommentAdded?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onFileUploaded?: (file: FileMetadata) => void;
  onFileDeleted?: (fileId: string) => void;
}

export const useRealtimeUpdates = (props: UseRealtimeUpdatesProps = {}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Task events
    if (props.onTaskCreated) {
      socket.on('task:created', props.onTaskCreated);
    }

    if (props.onTaskUpdated) {
      socket.on('task:updated', props.onTaskUpdated);
    }

    if (props.onTaskDeleted) {
      socket.on('task:deleted', props.onTaskDeleted);
    }

    // Comment events
    if (props.onCommentAdded) {
      socket.on('comment:added', props.onCommentAdded);
    }

    if (props.onCommentDeleted) {
      socket.on('comment:deleted', props.onCommentDeleted);
    }

    // File events
    if (props.onFileUploaded) {
      socket.on('file:uploaded', props.onFileUploaded);
    }

    if (props.onFileDeleted) {
      socket.on('file:deleted', props.onFileDeleted);
    }

    // Cleanup listeners on unmount
    return () => {
      if (props.onTaskCreated) {
        socket.off('task:created', props.onTaskCreated);
      }
      if (props.onTaskUpdated) {
        socket.off('task:updated', props.onTaskUpdated);
      }
      if (props.onTaskDeleted) {
        socket.off('task:deleted', props.onTaskDeleted);
      }
      if (props.onCommentAdded) {
        socket.off('comment:added', props.onCommentAdded);
      }
      if (props.onCommentDeleted) {
        socket.off('comment:deleted', props.onCommentDeleted);
      }
      if (props.onFileUploaded) {
        socket.off('file:uploaded', props.onFileUploaded);
      }
      if (props.onFileDeleted) {
        socket.off('file:deleted', props.onFileDeleted);
      }
    };
  }, [socket, isConnected, props]);

  return { isConnected };
};

// Hook specifically for task detail page
export const useTaskRealtimeUpdates = (taskId: string | undefined) => {
  const { socket, isConnected, joinTaskRoom, leaveTaskRoom } = useSocket();

  useEffect(() => {
    if (!taskId || !socket || !isConnected) return;

    // Join task room
    joinTaskRoom(taskId);

    // Leave task room on unmount
    return () => {
      leaveTaskRoom(taskId);
    };
  }, [taskId, socket, isConnected, joinTaskRoom, leaveTaskRoom]);

  const emitTaskUpdate = useCallback(
    (task: Task) => {
      if (socket && isConnected) {
        socket.emit('task:update', task);
      }
    },
    [socket, isConnected]
  );

  return { emitTaskUpdate, isConnected };
};
