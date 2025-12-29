import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // API的base_url
  timeout: 15000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;
    
    // 根据后端返回的状态码进行处理
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000,
      });
      
      // 一些特定错误码的处理
      if (res.code === 401 || res.code === 403) {
        // token过期或未授权，跳转到登录页
        ElMessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        });
      }
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return response.data;
    }
  },
  (error) => {
    // 对响应错误做点什么
    console.error('响应错误:', error);
    let message = '请求失败';
    
    if (error.response) {
      // 根据响应状态码处理
      switch (error.response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求地址不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `连接错误${error.response.status}`;
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接';
    } else {
      message = error.message;
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000,
    });
    
    return Promise.reject(error);
  }
);

export default service;