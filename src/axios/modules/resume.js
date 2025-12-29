// 简历相关接口
import { get, post, put, del } from '@/axios/api.js';

// 获取当前用户的简历
export function getMyResume() {
  return get('/resume/my');
}

// 保存简历
export function saveResume(data) {
  return post('/resume/save', data);
}

// 删除当前用户的简历
export function deleteResume() {
  return del('/resume/delete');
}