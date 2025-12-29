<template>
  <div class="common-layout">
    <!-- 使用现有的MainNav组件 -->
    <MainNav />

    <!-- 主体内容 -->
    <div class="common-main">
      <!-- 侧边栏 -->
      <aside class="common-sidebar" v-if="menuItems && menuItems.length > 0">
        <div class="sidebar-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path" 
            class="sidebar-item"
            :class="{ active: $route.path === item.path }"
          >
            <Icon :icon="item.icon" class="sidebar-icon" />
            <span class="sidebar-text">{{ item.title }}</span>
          </router-link>
        </div>
      </aside>

      <!-- 内容区域 -->
      <main class="common-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getCurrentUser, isLoggedIn as checkIsLoggedIn } from '@/utils/auth.js'
import MainNav from '@/components/Layout/MainNav.vue'

export default {
  name: 'CommonLayout',
  components: {
    Icon,
    MainNav
  },
  setup() {
    const router = useRouter()
    
    // 菜单项 - 根据用户角色动态设置
    const menuItems = ref([])
    
    // 根据当前路径设置菜单项
    const setMenuItems = (userRole) => {
      if (userRole === 2) { // 管理员
        menuItems.value = [
          { path: '/admin/dashboard', title: '仪表盘', icon: 'ri:dashboard-line' },
          { path: '/admin/company-review', title: '企业审核', icon: 'ri:shield-check-line' },
          { path: '/admin/job-review', title: '职位审核', icon: 'ri:file-check-line' },
          { path: '/admin/user-review', title: '用户审核', icon: 'ri:group-line' }
        ]
      } else if (userRole === 1) { // 招聘者
        menuItems.value = [
          { path: '/recruiter/dashboard', title: '招聘看板', icon: 'ri:dashboard-line' },
          { path: '/recruiter/job-posting', title: '职位发布', icon: 'ri:file-add-line' },
          { path: '/recruiter/resume-review', title: '简历审核', icon: 'ri:user-search-line' },
          { path: '/recruiter/profile', title: '机构信息', icon: 'ri:building-line' }
        ]
      }
    }

    // 检查用户登录状态和权限
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
          // 根据当前路径确定用户角色和菜单
          const currentPath = router.currentRoute.value.path
          let userRole = user.role
          
          // 如果当前路径是管理员相关路径，验证用户角色
          if (currentPath.startsWith('/admin')) {
            if (user.role !== 2) {
              router.push('/')
              return
            }
            userRole = 2
          } 
          // 如果当前路径是招聘者相关路径，验证用户角色
          else if (currentPath.startsWith('/recruiter')) {
            if (user.role !== 1) {
              router.push('/')
              return
            }
            userRole = 1
          }
          
          // 设置菜单项
          setMenuItems(userRole)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('检查用户权限失败:', error)
        router.push('/login')
      }
    })
    
    return {
      menuItems
    }
  }
}
</script>

<style scoped>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}


main{
  max-width: none !important;
}

.common-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 64px; /* 为顶部导航栏留出空间 */
  margin-left: 5%;
}

.common-sidebar {
  width: 15%;
  background-color:  #FFFFFF;
  border-right: 1px solid #F0F0F0;
  padding: 24px 0;
  height: calc(100vh - 64px);
  position: fixed;
  top: 64px;
  left: 0;
  overflow-y: auto;
  z-index: 90;
  flex-shrink: 0;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  text-decoration: none;
  color: #595959;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background-color: #e6f7ff;
  color: #1890FF;
}

.sidebar-item.active {
  background-color: #e6f7ff;
  color: #1890FF;
  border-left: 3px solid #1890FF;
}

.sidebar-icon {
  font-size: 18px;
  margin-right: 12px;
}

.sidebar-text {
  font-size: 14px;
  font-weight: 500;
}

:deep(.main){
  width: 100%;
}

.common-content {
  flex: 1;
  margin-left: 200px;
  padding: 24px;
  overflow-y: auto;
  margin-bottom:1%;
}
</style>