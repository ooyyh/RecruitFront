// 收藏相关接口
import { get, post, del } from '@/axios/api.js';

// 添加收藏
export function addFavorite(jobId) {
  return post(`/favorite/add/${jobId}`);
}

// 取消收藏
export function removeFavorite(jobId) {
  return del(`/favorite/remove/${jobId}`);
}

// 检查是否已收藏
export function checkFavorite(jobId) {
  return get(`/favorite/check/${jobId}`);
}

// 获取收藏列表
export function getFavoriteList() {
  return get('/favorite/list');
}