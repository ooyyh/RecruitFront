// 路由守卫相关工具函数
import { getCurrentUser } from '@/utils/auth.js'

// 更新全局用户信息
export const updateGlobalUserInfo = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      // 更新全局状态或触发事件，通知导航栏组件更新用户信息
      window.dispatchEvent(new CustomEvent('user-updated', { detail: user }))
    }
  } catch (error) {
    console.error('更新全局用户信息失败:', error)
  }
}