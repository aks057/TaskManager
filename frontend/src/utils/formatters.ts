import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

export const isOverdue = (dueDate: string | Date): boolean => {
  try {
    const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isPast(dateObj);
  } catch {
    return false;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatTaskStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};
