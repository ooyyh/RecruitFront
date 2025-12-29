// 公司相关接口
import { get, post } from '@/axios/api.js';

// 获取当前招聘者的公司信息
export function getCompanyInfo() {
  return get('/company/my-company');
}

// 保存或更新公司信息
export function saveCompanyInfo(data) {
  return post('/company/save-info', data);
}