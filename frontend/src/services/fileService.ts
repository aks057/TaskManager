import api from './api';
import { FileMetadata } from '../types/file.types';

export const fileService = {
  async uploadFiles(taskId: string, files: File[]): Promise<FileMetadata[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ data: FileMetadata[] }>(
      `/tasks/${taskId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async getFilesByTaskId(taskId: string): Promise<FileMetadata[]> {
    const response = await api.get<{ data: FileMetadata[] }>(`/tasks/${taskId}/files`);
    return response.data.data;
  },

  async downloadFile(id: string, filename?: string): Promise<void> {
    const response = await api.get(`/files/${id}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async deleteFile(id: string): Promise<void> {
    await api.delete(`/files/${id}`);
  },

  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
