<template>
  <div>
    <MainNav />

    <!-- Hero Section -->
    <header>
      <div class="gradient-bg"></div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">连接 <span>更智能</span> 的未来，<br/>发现属于你的机遇。</h1>
          <p class="hero-subtitle">已有 24,000+ 知名字企入驻，利用 AI 算法为你精准匹配最合拍的工作环境。让每一份才华都不被辜负。</p>
          <!-- 搜索组件 -->
          <div class="search-container">
            <div class="search-input-container">
              <Icon icon="ri:search-line" class="search-icon" />
              <input class="search-input" placeholder="搜索职位、公司或关键词..." type="text" v-model="searchQuery"/>
            </div>
            <div class="divider"></div>
            <div class="location-container">
              <Icon icon="ri:map-pin-line" class="location-icon" />
              <span class="location-text">全国</span>
            </div>
            <button class="search-button" @click="performSearch">
              <span>立即搜索</span>
            </button>
          </div>
          <div class="hot-search">
            <span>热门搜索：</span>
            <a href="#">前端开发</a>
            <a href="#">产品经理</a>
            <a href="#">数据分析</a>
          </div>
        </div>
      </div>
      <!-- 数据浮层 -->
      <div class="data-card">
        <div class="data-card-content">
          <div class="success-icon-container">
            <Icon icon="ri:checkbox-circle-fill" class="success-icon" />
          </div>
          <div>
            <div class="success-count">12,482</div>
            <div class="success-text">最近成功匹配求职者</div>
          </div>
        </div>
      </div>
    </header>

    <main>
      <!-- 职位推荐 -->
      <section>
        <div class="section-header">
          <div>
            <h2 class="section-title">个性化职位推荐</h2>
            <p class="section-subtitle">基于您的技能偏好推荐的热门岗位 - <span>{{ formatDate(new Date()) }}</span></p>
          </div>
          <router-link class="view-all" to="/jobs">
            查看全部职位 <Icon icon="ri:arrow-right-line" class="arrow-right" />
          </router-link>
        </div>
        <div class="job-grid" v-if="!loading">
          <div 
            v-for="job in jobs.slice(0, 3)" 
            :key="job.id" 
            class="job-card"
            @click="viewJobDetails(job.id)"
          >
            <div class="job-header">
              <div class="job-info">
                <div class="company-logo-container">
                  <div class="company-logo-placeholder">{{ job.companyName.charAt(0) }}</div>
                </div>
                <div class="job-details">
                  <h3>{{ job.title }}</h3>
                  <p>{{ job.companyName }} · {{ job.companyAddress }} · {{ job.experience }}</p>
                </div>
              </div>
              <span class="salary">{{ job.salaryMin }}-{{ job.salaryMax }}</span>
            </div>
            <div class="tags">
              <span class="tag">{{ job.education }}</span>
              <span class="tag">{{ job.type === 0 ? '全职' : '实习' }}</span>
            </div>
            <div class="job-footer">
              <span class="post-time">{{ formatDate(job.createdAt) }}</span>
              <button class="action-button apply">投递简历</button>
            </div>
          </div>
        </div>
        <div v-else class="loading-placeholder">
          <div class="job-card" v-for="i in 3" :key="'loading-' + i">
            <div class="job-header">
              <div class="job-info">
                <div class="company-logo-container">
                  <div class="company-logo skeleton"></div>
                </div>
                <div class="job-details">
                  <h3><div class="skeleton-text"></div></h3>
                  <p><span class="skeleton-text short"></span></p>
                </div>
              </div>
              <span class="salary"><div class="skeleton-text short"></div></span>
            </div>
            <div class="tags">
              <span class="tag"><div class="skeleton-text tiny"></div></span>
              <span class="tag"><div class="skeleton-text tiny"></div></span>
            </div>
            <div class="job-footer">
              <span class="post-time"><div class="skeleton-text tiny"></div></span>
              <button class="action-button">立即沟通</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 领军企业 -->
      <section class="companies-section">
        <div class="mb-8">
          <h2 class="companies-title">领军企业入驻</h2>
          <p class="companies-subtitle">与全球知名科技巨头共筑未来</p>
        </div>
        <div class="companies-grid">
          <div class="company-card">
            <img alt="Company 1" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/38cb2c5ca8e04a50b71126f8386a12da.jpg"/>
          </div>
          <div class="company-card">
            <img alt="Company 2" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/e19b75344c4c4f29b94b0b9e698dfb6e.jpg"/>
          </div>
          <div class="company-card">
            <img alt="Company 3" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/f769c126eae9452c895111b8c5f91520.jpg"/>
          </div>
          <div class="company-card">
            <img alt="Company 4" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/c99f8529303f41089b31865bafb9cf8e.jpg"/>
          </div>
          <div class="company-card">
            <img alt="Company 5" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/b4ffdc460c6741e5974a0113acd4e384.jpg"/>
          </div>
          <div class="company-card">
            <img alt="Company 6" class="company-logo-large" src="https://modao.cc/agent-py/media/generated_images/2025-12-21/33309a2127eb45b5b357a222cb686166.jpg"/>
          </div>
        </div>
      </section>

      <!-- 平台特色 -->
      <section class="features-grid">
        <div class="feature-card job-seeker">
          <div class="relative-z">
            <h3>我是求职者</h3>
            <p>编辑简历，填写职位意向</p>
            <button class="feature-btn" @click="handleJobSeekerClick">简历优化</button>
          </div>
          <Icon icon="ri:profile-line" class="feature-icon" />
        </div>
        <div class="feature-card recruiter">
          <div class="relative-z">
            <h3>我是招聘者</h3>
            <p>发布职位，精准推荐高质量人才库，提升招聘效率</p>
            <button class="feature-btn" @click="handleRecruiterClick">发布职位</button>
          </div>
          <Icon icon="ri:building-2-line" class="feature-icon" />
        </div>
        <div class="feature-card subscription">
          <h3>智聘订阅</h3>
          <p>订阅我们的每周职场观察，掌握最新行业薪资趋势报告</p>
          <div class="subscription-form">
            <input class="subscription-input" placeholder="输入邮箱" type="email"/>
            <button class="subscription-btn">订阅</button>
          </div>
        </div>
      </section>
    </main>

    <MainFooter />
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNav from '@/components/Layout/MainNav.vue'
import MainFooter from '@/components/Layout/MainFooter.vue'
import { getPublicJobs } from '@/axios/modules/jobPublic.js'
import { getCurrentUser, isLoggedIn } from '@/utils/auth.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'Home',
  components: {
    Icon,
    MainNav,
    MainFooter
  },
  setup() {
    const router = useRouter()
    // 用户登录状态
    const isLoggedIn = ref(false)
    // 下拉菜单显示状态
    const showDropdown = ref(false)
    // 搜索关键词
    const searchQuery = ref('')
    // 职位列表数据
    const jobs = ref([])
    // 加载状态
    const loading = ref(false)
    
    // 检查用户登录状态
    const checkLoginStatus = () => {
      // 从localStorage或sessionStorage中获取登录状态
      const token = localStorage.getItem('token')
      isLoggedIn.value = !!token
    }
    
    // 切换下拉菜单
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }
    
    // 点击页面其他地方关闭下拉菜单
    const handleClickOutside = (event) => {
      const profileContainer = document.querySelector('.profile-container')
      if (profileContainer && !profileContainer.contains(event.target)) {
        showDropdown.value = false
      }
    }
    
    // 跳转到工作台
    const goToDashboard = () => {
      // TODO: 实现跳转到工作台页面的逻辑
      console.log('跳转到工作台')
      showDropdown.value = false
      // 这里可以添加跳转逻辑，例如：
      // router.push('/dashboard')
    }
    
    // 登出功能
    const logout = async () => {
      // TODO: 实现登出逻辑
      console.log('执行登出操作')
      
      // 实际的登出操作可能包括：
      // 1. 调用登出API
      // 2. 清除本地存储的token
      localStorage.removeItem('token')
      // 3. 清除用户信息
      // 4. 重定向到首页或其他页面
      isLoggedIn.value = false
      showDropdown.value = false
    }
    
    // 获取职位列表
    const fetchJobs = async () => {
      loading.value = true
      try {
        const params = {
          page: 1,
          size: 3, // 首页只显示3个职位
          keyword: '' // 默认不搜索
        }
        const response = await getPublicJobs(params)
        jobs.value = response.data.data || []
      } catch (error) {
        console.error('获取职位列表失败:', error)
        // 如果接口出错，使用模拟数据
        jobs.value = []
      } finally {
        loading.value = false
      }
    }
    
    // 搜索功能
    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ 
          path: '/jobs',
          query: { keyword: searchQuery.value.trim() }
        })
      }
    }
    
    // 查看职位详情
    const viewJobDetails = (jobId) => {
      router.push(`/job/${jobId}`)
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffMinutes < 1) {
        return '刚刚';
      } else if (diffHours < 1) {
        return `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    }
    
    // 求职者按钮点击事件
    const handleJobSeekerClick = async () => {
      const user = await getCurrentUser()
      if (!user) {
        // 未登录，跳转到登录页面
        router.push('/login')
      } else if (user.role === 1) {
        // 招聘者点击求职者按钮，显示提示
        ElMessage.warning('您当前角色为招聘者，无法访问求职者功能，请切换角色或使用招聘者功能')
      } else {
        // 已登录且角色正确，跳转到求职者工作台
        router.push('/job-seeker/profile')
      }
    }
    
    // 招聘者按钮点击事件
    const handleRecruiterClick = async () => {
      const user = await getCurrentUser()
      if (!user) {
        // 未登录，跳转到登录页面
        router.push('/login')
      } else if (user.role === 0) {
        // 求职者点击招聘者按钮，显示提示
        ElMessage.warning('您当前角色为求职者，无法访问招聘者功能，请切换角色或使用求职者功能')
      } else {
        // 已登录且角色正确，跳转到招聘者工作台
        router.push('/recruiter/dashboard')
      }
    }
    
    onMounted(() => {
      checkLoginStatus()
      fetchJobs() // 页面加载时获取职位列表
      // 监听点击事件以关闭下拉菜单
      document.addEventListener('click', handleClickOutside)
    })
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      isLoggedIn,
      showDropdown,
      searchQuery,
      jobs,
      loading,
      toggleDropdown,
      goToDashboard,
      logout,
      performSearch,
      viewJobDetails,
      formatDate,
      handleJobSeekerClick,
      handleRecruiterClick
    }
  }
}
</script>

<style scoped>
/* 为了支持Tailwind样式，我们保留动画类 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}
/* 添加grayscale滤镜样式 */
.grayscale {
  filter: grayscale(100%);
}
.opacity-60 {
  opacity: 0.6;
}
.hover\:grayscale-0:hover {
  filter: grayscale(0%);
}
.hover\:opacity-100:hover {
  opacity: 1;
}

/* 公司logo占位符 */
.company-logo-placeholder {
  width: 48px;
  height: 48px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #8c8c8c;
  font-weight: bold;
}

/* 加载状态样式 */
.loading-placeholder {
  width: 100%;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 16px;
  width: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-text.short {
  width: 70%;
}

.skeleton-text.tiny {
  width: 40%;
}
</style>