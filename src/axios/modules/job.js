// 职位相关接口
import { get, post, put } from '@/axios/api.js';

// 获取当前招聘者的职位列表
export function getMyJobs() {
  return get('/job/my-jobs');
}

// 获取职位详情
export function getJobDetail(id) {
  return get(`/job/detail/${id}`);
}

// 发布职位
export function createJob(data) {
  return post('/job/post', data);
}

// 更新职位
export function updateJob(data) {
  return put('/job/update', data);
}

// 撤销职位
export function revokeJob(id) {
  return post(`/job/revoke/${id}`);
}