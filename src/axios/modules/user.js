// 用户相关接口
import { get, post, put, del } from '@/axios/api.js';

// 用户登录
export function userLogin(data) {
  return post('/user/login', data);
}

// 用户注册
export function userRegister(data) {
  return post('/user/register', data);
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info');
}

// 检查用户名是否存在
export function checkUsername(username) {
  return get('/user/check-username', { username });
}

// 管理员功能 - 获取用户列表
export function getUserList(page = 0, size = 10, keyword = null, role = null, status = null) {
  let params = { page, size };
  if (keyword) params.keyword = keyword;
  if (role !== null) params.role = role;
  if (status !== null) params.status = status;
  return get('/admin/user/list', params);
}

// 管理员功能 - 审核用户
export function reviewUser(id, data) {
  return put(`/admin/user/review/${id}`, data);
}

// 管理员功能 - 禁用用户
export function disableUser(id) {
  return put(`/admin/user/disable/${id}`);
}