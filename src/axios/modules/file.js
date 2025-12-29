// 文件上传相关接口
import { post } from '@/axios/api.js';

// 上传简历照片
export function uploadResumePhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  return post('/file/upload/resume-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}