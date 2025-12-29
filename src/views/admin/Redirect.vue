<template>
  <div class="admin-redirect">
    <div class="redirect-content">
      <h2>管理员入口</h2>
      <p>正在检查您的权限...</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn as checkIsLoggedIn, getCurrentUser } from '@/utils/auth.js'

export default {
  name: 'AdminRedirect',
  setup() {
    const router = useRouter()

    onMounted(async () => {
      // 检查用户是否已登录
      if (!checkIsLoggedIn()) {
        router.push('/login')
        return
      }

      try {
        // 获取用户信息
        const user = await getCurrentUser()
        if (user) {
          // 检查用户角色是否为管理员
          if (user.role === 2) { // 2 是管理员角色
            router.push('/admin/dashboard')
          } else {
            // 非管理员用户重定向到首页
            router.push('/')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('检查管理员权限失败:', error)
        router.push('/login')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.admin-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.redirect-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.redirect-content h2 {
  margin-bottom: 16px;
  color: #333;
}

.redirect-content p {
  color: #666;
}
</style>