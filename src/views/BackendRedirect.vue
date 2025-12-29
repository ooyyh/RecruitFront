<template>
  <div class="backend-redirect">
    <div class="redirect-content">
      <h2>后台入口</h2>
      <p>正在检查您的权限...</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn as checkIsLoggedIn, getCurrentUser } from '@/utils/auth.js'

export default {
  name: 'BackendRedirect',
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
          // 根据用户角色重定向到对应的后台
          if (user.role === 2) { // 管理员
            router.push('/admin/dashboard')
          } else if (user.role === 1) { // 招聘者
            router.push('/recruiter/dashboard')
          } else { // 求职者或其他角色
            router.push('/')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('检查后台权限失败:', error)
        router.push('/login')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.backend-redirect {
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