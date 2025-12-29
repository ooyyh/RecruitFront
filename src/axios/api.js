// API请求方法封装
import request from '@/axios/index.js';

// GET请求
export function get(url, params = {}) {
  return request({
    method: 'get',
    url,
    params,
  });
}

// POST请求
export function post(url, data = {}) {
  return request({
    method: 'post',
    url,
    data,
  });
}

// PUT请求
export function put(url, data = {}, config = {}) {
  return request({
    method: 'put',
    url,
    data,
    ...config
  });
}

// DELETE请求
export function del(url) {
  return request({
    method: 'delete',
    url,
  });
}

// 上传文件
export function upload(url, formData) {
  return request({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}