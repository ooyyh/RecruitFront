// 管理员职位审核相关接口
import { get, post } from '@/axios/api.js';

// 获取待审核职位列表
export function getJobsForReview(params) {
  return get('/admin/job/list', params);
}

// 审核职位
export function reviewJob(id, data) {
  return post(`/admin/job/review/${id}`, data);
}

// 获取职位详情
export function getJobDetail(id) {
  return get(`/admin/job/detail/${id}`);
}