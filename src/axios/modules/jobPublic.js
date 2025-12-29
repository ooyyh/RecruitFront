// 公开职位相关接口
import { get, post } from '@/axios/api.js';

// 获取公开职位列表（已通过审核的）
export function getPublicJobs(params) {
  return get('/job/list', params);
}

// 获取职位详情
export function getPublicJobDetail(id) {
  return get(`/job/detail/${id}`);
}

// 申请职位
export function applyJob(jobId) {
  return post(`/application/apply/${jobId}`);
}

// 保存/收藏职位
export function saveJob(jobId) {
  return post(`/job/save/${jobId}`);
}

// 获取已保存的职位列表
export function getSavedJobs() {
  return get('/job/saved');
}