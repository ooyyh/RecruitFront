// 管理员企业审核相关接口
import { get, post } from '@/axios/api.js';

// 获取企业列表
export function getCompanies(params) {
  return get('/admin/company/list', params);
}

// 审核企业
export function reviewCompany(id, data) {
  return post(`/admin/company/review/${id}`, data);
}

// 获取企业详情
export function getCompanyDetail(id) {
  return get(`/admin/company/detail/${id}`);
}