<template>
  <nav class="main-nav">
    <div class="nav-left">
      <div class="logo-container">
        <Icon icon="ri:sparkling-2-fill" class="logo-icon" />
        <span class="logo-text">智聘 2025</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/jobs" class="nav-link">探索职位</router-link>
      </div>
    </div>
    <div class="nav-right">
      
      <div class="user-info">
        <Icon icon="ri:notification-3-line" class="notification-icon" v-if="isLoggedIn" />
        <!-- 未登录状态显示登录按钮 -->
        <router-link v-if="!isLoggedIn" to="/login" class="login-btn">登录</router-link>
        <!-- 登录状态显示用户信息和下拉菜单 -->
        <el-dropdown v-else trigger="click" @command="handleDropdownCommand">
          <div class="profile-container">
            <div class="avatar">{{ currentUser.avatar }}</div>
            <span class="username">{{ currentUser.name }}</span>
            <Icon icon="ri:arrow-down-s-line" class="arrow-down" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="dashboard">工作台</el-dropdown-item>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </nav>
</template>

<script>
import { Icon } from '@iconify/vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { getCurrentUser, isLoggedIn as checkIsLoggedIn, logout as authLogout, getUserRoleText } from '@/utils/auth.js'

export default {
  name: 'MainNav',
  components: {
    Icon,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const isLoggedIn = ref(false)
    const currentUser = ref({
      id: null,
      name: '',
      avatar: '用',
      userType: 'jobSeeker', // 默认求职者类型
      role: 0 // 用户角色
    })
    const currentUserType = ref('jobSeeker') // 默认求职者类型
    
    
    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          currentUser.value = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            userType: getUserRoleText(user.role),
            role: user.role
          }
          // 存储用户类型到本地
          localStorage.setItem('userType', user.role)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取失败，清空登录状态
        doLogout()
      }
    }
    
    // 检查用户登录状态
    const checkLoginStatus = async () => {
      isLoggedIn.value = checkIsLoggedIn()
      if (isLoggedIn.value && !currentUser.value.id) {
        // 如果已登录但用户信息为空，获取用户信息
        await fetchUserInfo()
      }
    }
    
    // 下拉菜单命令处理
    const handleDropdownCommand = (command) => {
      switch (command) {
        case 'dashboard':
          goToDashboard()
          break
        case 'profile':
          goToProfile()
          break
        case 'logout':
          doLogout()
          break
      }
    }
    
    // 跳转到工作台
    const goToDashboard = () => {
      // 根据用户角色跳转到不同的工作台
      const userType = localStorage.getItem('userType') || '0'
      let path = '/'
      switch(userType) {
        case '0': // 求职者
          path = '/job-seeker/profile'
          break
        case '1': // 招聘者
          path = '/recruiter/dashboard'
          break
        case '2': // 管理员
          path = '/admin/dashboard'
          break
      }
      router.push(path)
    }
    
    // 跳转到个人资料页
    const goToProfile = () => {
      // 根据用户角色跳转到不同的个人资料页面
      const userType = localStorage.getItem('userType') || '0'
      let path = '/profile'
      switch(userType) {
        case '0': // 求职者
          path = '/job-seeker/profile'
          break
        case '1': // 招聘者
          path = '/recruiter/profile'
          break
        case '2': // 管理员
          path = '/admin/profile'
          break
      }
      router.push(path)
    }
    
      // 登出功能
      const doLogout = () => {
        console.log('执行登出操作')
        authLogout() // 使用工具函数登出
        isLoggedIn.value = false
        currentUser.value = {
          id: null,
          name: '',
          avatar: '用',
          userType: 'jobSeeker',
          role: 0
        }
        router.push('/')
      }    
    // 切换用户类型
    const switchUserType = (userType) => {
      currentUserType.value = userType
    }
    
    // 监听用户信息更新事件
    const handleUserUpdated = async (event) => {
      const user = event.detail
      currentUser.value = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        userType: getUserRoleText(user.role),
        role: user.role
      }
      isLoggedIn.value = true
      localStorage.setItem('userType', user.role)
    }
    
    onMounted(async () => {
      await checkLoginStatus()
      window.addEventListener('user-updated', handleUserUpdated)
    })
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('user-updated', handleUserUpdated)
    })
    
    return {
      isLoggedIn,
      currentUser,
      currentUserType,
      handleDropdownCommand,
      goToDashboard,
      goToProfile,
      doLogout,
      switchUserType
    }
  }
}
</script>

<style scoped>
/* 顶部导航栏样式 */
.main-nav {
  position: fixed;
  top: 0;
  width: 96%;
  background-color: white;
  border-bottom: 1px solid #F0F0F0;
  z-index: 50;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  color: #1890FF;
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: -0.02em;
  color: #1890FF;
}

.nav-links {
  display: none;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
    gap: 32px;
    font-size: 15px;
    font-weight: 500;
  }
}

.nav-link {
  text-decoration: none;
  color: #595959;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #1890FF;
}

.nav-link.router-link-exact-active,
.nav-link.active {
  color: #1890FF;
  border-bottom: 2px solid #1890FF;
  padding-bottom: 20px;
  margin-top: 1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* 用户类型选择器样式 */
.user-type-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  border-right: 1px solid #F0F0F0;
  padding-right: 24px;
  font-size: 14px;
}

.user-type-selector button {
  background: none;
  border: none;
  cursor: pointer;
  color: #8C8C8C;
  transition: color 0.3s;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-type-selector button:hover {
  color: #1890FF;
}

.user-type-selector button.active {
  color: #1890FF;
  background-color: rgba(24, 144, 255, 0.1);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.login-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #1890FF;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #40a9ff;
}

.notification-icon {
  font-size: 20px;
  color: #595959;
  cursor: pointer;
  transition: color 0.3s;
}

.notification-icon:hover {
  color: #1890FF;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1890FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 0 0 2px white;
}

.username {
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.username:hover {
  color: #1890FF;
}

.arrow-down {
  color: #8C8C8C;
}

/* Element Plus下拉菜单的自定义样式将在全局CSS中处理 */
</style>