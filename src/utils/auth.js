// 认证相关的工具函数

import { getUserInfo } from '@/axios/modules/user.js'

// 获取当前用户信息
export const getCurrentUser = async () => {
  try {
    const response = await getUserInfo()
    if (response.code === 200) {
      const user = response.data
      // 格式化用户信息
      return {
        id: user.id,
        name: user.username || '',
        avatar: user.username ? user.username.charAt(0).toUpperCase() : '用',
        role: user.role,
        email: user.email || '',
        phone: user.phone || '',
        status: user.status // 0-待审核，1-正常，2-禁用
      }
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 检查用户是否已登录
export const isLoggedIn = () => {
  const token = localStorage.getItem('token')
  return !!token
}

// 登出
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('userType')
}

// 获取用户角色文本
export const getUserRoleText = (role) => {
  switch(role) {
    case 0: return '求职者'
    case 1: return '招聘者'
    case 2: return '管理员'
    default: return '用户'
  }
}

// 检查用户角色是否匹配
export const hasRole = (requiredRole) => {
  const userType = localStorage.getItem('userType')
  return userType === String(requiredRole)
}