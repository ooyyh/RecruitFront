<template>
  <div class="job-seeker-dashboard">
    <!-- 顶部导航栏 - 重用 MainNav 组件 -->
    <MainNav />

    <!-- 主体内容 -->
    <div class="main-container">
      <!-- 左侧悬浮面板 -->
      <div class="left-panel">
        <div class="profile-card">
          <div class="avatar">
            <span>{{ userInfo.avatar }}</span>
          </div>
          <div class="name">{{ userInfo.name || '求职者' }}</div>
          <div class="job-title">{{ userInfo.jobTitle || '职位未设置' }} · {{ userInfo.experience || '经验未设置' }} · {{ userInfo.location || '地点未设置' }}</div>
          <div class="stats">
            <div><span>{{ applicationCount }}</span>已投递</div>
            <div><span>{{ interviewCount }}</span>面试</div>
            <div><span>{{ savedCount }}</span>收藏</div>
          </div>
        </div>

        <div class="menu-card">
          <div 
            class="menu-item" 
            :class="{ active: currentRoute === '/job-seeker/profile' }"
            @click="handleSideMenuSelect('/job-seeker/profile')"
          >
            个人信息
          </div>
          <div 
            class="menu-item" 
            :class="{ active: currentRoute === '/job-seeker/resume' }"
            @click="handleSideMenuSelect('/job-seeker/resume')"
          >
            简历管理
          </div>
          <div 
            class="menu-item" 
            :class="{ active: currentRoute === '/job-seeker/application-history' }"
            @click="handleSideMenuSelect('/job-seeker/application-history')"
          >
            投递历史
          </div>
          <div 
            class="menu-item" 
            :class="{ active: currentRoute === '/job-seeker/saved-jobs' }"
            @click="handleSideMenuSelect('/job-seeker/saved-jobs')"
          >
            职位收藏
          </div>
        </div>
      </div>

      <!-- 中间内容区域 - 插槽，用于渲染子页面 -->
      <div class="center-panel">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentUser } from '@/utils/auth.js';
import { getUserInfo } from '@/axios/modules/user.js';
import { getSeekerApplications } from '@/axios/modules/application.js';
import { getFavoriteList } from '@/axios/modules/favorite.js';
import MainNav from './MainNav.vue';

export default {
  name: 'JobSeekerLayout',
  components: {
    MainNav
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentRoute = ref(route.path);
    const userInfo = ref({
      name: '',
      jobTitle: '',
      experience: '',
      location: '',
      avatar: 'U'
    });
    
    // 统计数据
    const applicationCount = ref(0);
    const interviewCount = ref(0);
    const savedCount = ref(0);

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const response = await getUserInfo();
          if (response.code === 200) {
            const data = response.data;
            userInfo.value = {
              name: data.username || '',
              jobTitle: data.jobTitle || '',
              experience: data.experience || '',
              location: data.location || '',
              avatar: user.avatar
            };
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    // 获取统计数据
    const fetchStats = async () => {
      try {
        // 获取所有投递记录
        const applicationsResponse = await getSeekerApplications();
        if (applicationsResponse.code === 200) {
          const applications = applicationsResponse.data;
          applicationCount.value = applications.length;
          // 筛选出状态为2（面试邀请）的记录数量
          interviewCount.value = applications.filter(app => app.status === 2).length;
        }

        // 获取收藏数量
        const favoritesResponse = await getFavoriteList();
        if (favoritesResponse.code === 200) {
          savedCount.value = favoritesResponse.data.length;
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    // 侧边菜单选择
    const handleSideMenuSelect = (index) => {
      router.push(index);
    };

    // 监听路由变化
    watch(
      () => route.path,
      (newPath) => {
        currentRoute.value = newPath;
      }
    );

    onMounted(() => {
      fetchUserInfo();
      fetchStats();
    });

    return {
      currentRoute,
      userInfo,
      applicationCount,
      interviewCount,
      savedCount,
      handleSideMenuSelect
    };
  }
};
</script>

<style scoped>
.job-seeker-dashboard {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
  padding-top: 64px; /* 为固定定位的导航栏留出空间 */
}

.main-container {
  width: 90%;
  max-width: 1400px;
  margin: 1.5% auto;
  display: flex;
  gap: 2%;
}

/* ========== 左侧悬浮面板 ========== */
.left-panel {
  width: 20%;
  min-width: 220px;
  max-width: 280px;
}

.profile-card {
  background: #fff;
  border-radius: 10px;
  padding: 3%;
  text-align: center;
  margin-bottom: 3%;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.job-title {
  font-size: 14px;
  color: #606266;
  margin: 5px 0 15px;
}

.stats {
  display: flex;
  justify-content: space-around;
  font-size: 14px;
  color: #374151;
}

.stats span {
  display: block;
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.menu-card {
  background: #fff;
  border-radius: 10px;
  padding: 4%;
}

.menu-item {
  padding: 3% 2%;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  margin-bottom: 2%;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.active {
  background: #eef4ff;
  color: #409eff;
  font-weight: bold;
}

/* ========== 中间内容区域 ========== */
.center-panel {
  flex: 1;
  min-width: 50%;
  max-width: 60%;
  background: #fff;
  border-radius: 10px;
  padding: 25px;
  position: relative;
  margin-left: 2%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-panel {
    width: 25%;
    min-width: 200px;
  }
  
  .main-container {
    gap: 3%;
  }
}

@media (max-width: 992px) {
  .main-container {
    width: 95%;
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
    max-width: none;
  }
  
  .center-panel {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-container {
    margin: 2% auto;
  }
  
  .profile-card {
    padding: 4%;
  }
  
  .center-panel {
    padding: 15px;
  }
  }
</style>