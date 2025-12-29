<template>
  <div class="job-list-page">
    <MainNav />

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-container">
      <div class="search-box">
        <div class="search-input-container">
          <Icon icon="ri:search-line" class="search-icon" />
          <input 
            class="search-input" 
            placeholder="搜索职位、公司或关键词..." 
            type="text"
            v-model="searchQuery"
          />
        </div>
        <button class="search-button" @click="performSearch">
          <span>搜索</span>
        </button>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">地区:</span>
          <div class="filter-options">
            <button 
              v-for="city in cities" 
              :key="city" 
              :class="['filter-btn', { active: selectedCity === city }]"
              @click="selectCity(city)"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">薪资:</span>
          <div class="filter-options">
            <button 
              v-for="salary in salaryRanges" 
              :key="salary.value" 
              :class="['filter-btn', { active: selectedSalary === salary.value }]"
              @click="selectSalary(salary.value)"
            >
              {{ salary.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">类型:</span>
          <div class="filter-options">
            <button 
              v-for="jobType in jobTypes" 
              :key="jobType.value" 
              :class="['filter-btn', { active: selectedJobType === jobType.value }]"
              @click="selectJobType(jobType.value)"
            >
              {{ jobType.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 职位列表 -->
    <main class="job-list-main">
      <div class="list-header">
        <div class="results-info">
          <span v-if="!loading">共找到 {{ totalJobs }} 个职位</span>
          <span v-else>加载中...</span>
        </div>
        <div class="sort-options">
          <button 
            v-for="sortOption in sortOptions" 
            :key="sortOption.value"
            :class="['sort-btn', { active: currentSort === sortOption.value }]"
            @click="changeSort(sortOption.value)"
          >
            {{ sortOption.label }}
          </button>
        </div>
      </div>
      
      <div class="job-list">
        <div 
          v-for="job in jobs" 
          :key="job.id" 
          class="job-card"
          @click="viewJobDetails(job.id)"
        >
          <div class="job-header">
            <div class="job-info">
              <div class="company-logo-container">
                <div class="company-logo-placeholder">公司</div>
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
            <button class="action-button">立即沟通</button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-placeholder">
          <div class="job-card" v-for="i in 5" :key="'loading-' + i">
            <div class="job-header">
              <div class="job-info">
                <div class="company-logo-container">
                  <div class="company-logo skeleton"></div>
                </div>
                <div class="job-details">
                  <h3><div class="skeleton-text"></div></h3>
                  <p><div class="skeleton-text short"></div></p>
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
        
        <!-- 无数据状态 -->
        <div v-if="!loading && jobs.length === 0" class="no-data">
          <p>暂无符合条件的职位</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </main>
    <MainFooter />
  </div>
</template>    
    <script>
    import { Icon } from '@iconify/vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainNav from '@/components/Layout/MainNav.vue'
import MainFooter from '@/components/Layout/MainFooter.vue'
import { getPublicJobs } from '@/axios/modules/jobPublic.js'
import { getCurrentUser } from '@/utils/auth.js'
export default {
  name: 'JobList',
  components: {
    Icon,
    MainNav,
    MainFooter
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 用户类型选择器数据
    const userTypes = [
      { value: 'jobSeeker', label: '求职者' },
      { value: 'recruiter', label: '招聘者' },
      { value: 'admin', label: '管理员' }
    ]
    
    // 排序选项
    const sortOptions = [
      { value: 'default', label: '默认' },
      { value: 'salary', label: '薪资' },
      { value: 'time', label: '最新' }
    ]
    
    // 职位数据
    const jobs = ref([])
    const loading = ref(true)
    
    // 城市筛选选项
    const cities = ['全国', '北京', '上海', '深圳', '武汉','杭州', '广州', '成都']
    
    // 薪资范围筛选选项
    const salaryRanges = [
      { value: 'all', label: '不限' },
      { value: '5000-10000', label: '5k-10k' },
      { value: '10000-20000', label: '10k-20k' },
      { value: '20000-30000', label: '20k-30k' },
      { value: '30000+', label: '30k以上' }
    ]
    
    // 职位类型筛选选项
    const jobTypes = [
      { value: 'all', label: '不限' },
      { value: 'tech', label: '技术' },
      { value: 'product', label: '产品' },
      { value: 'design', label: '设计' },
      { value: 'marketing', label: '市场' }
    ]
    
    // 响应式数据
    const isLoggedIn = ref(false)
    const showDropdown = ref(false)
    const currentUser = ref(null)
    const currentUserType = ref('')
    const searchQuery = ref('')
    const selectedCity = ref('全国')
    const selectedSalary = ref('all')
    const selectedJobType = ref('all')
    const currentSort = ref('default') // 当前排序方式
    const currentPage = ref(1)
    const itemsPerPage = 10 // 每页显示的职位数量
    const totalJobs = ref(0) // 总职位数
    
    // 获取职位列表
    const fetchJobs = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          size: itemsPerPage,
          keyword: searchQuery.value,
          city: selectedCity.value !== '全国' ? selectedCity.value : '',
          salaryRange: selectedSalary.value !== 'all' ? selectedSalary.value : '',
          jobType: selectedJobType.value !== 'all' ? selectedJobType.value : '',
          sortBy: currentSort.value
        }
        const response = await getPublicJobs(params)
        jobs.value = response.data.data || []
        totalJobs.value = response.data.total || 0
      } catch (error) {
        console.error('获取职位列表失败:', error)
        // 如果接口出错，使用模拟数据
        jobs.value = []
        totalJobs.value = 0
      } finally {
        loading.value = false
      }
    }
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(totalJobs.value / itemsPerPage)
    })
    
    // 检查用户登录状态
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      isLoggedIn.value = !!token
      if (token) {
        // 获取当前用户信息
        const user = getCurrentUser()
        if (user) {
          currentUser.value = user
          currentUserType.value = user.userType
        }
      }
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
      if (currentUserType.value === 'admin') {
        router.push('/admin/dashboard')
      } else if (currentUserType.value === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else {
        router.push('/job-seeker/dashboard') // 假设求职者工作台路由
      }
      showDropdown.value = false
    }
    
    // 登出功能
    const logout = () => {
      console.log('执行登出操作')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      isLoggedIn.value = false
      showDropdown.value = false
      currentUser.value = null
      currentUserType.value = ''
      checkLoginStatus()
    }
    
    // 切换用户类型
    const switchUserType = (userType) => {
      currentUserType.value = userType
      // 根据用户类型跳转到相应的工作台
      if (userType === 'admin') {
        router.push('/admin/dashboard')
      } else if (userType === 'recruiter') {
        router.push('/recruiter/dashboard')
      } else if (userType === 'jobSeeker') {
        router.push('/job-seeker/dashboard') // 假设求职者工作台路由
      }
    }
    
    // 搜索功能
    const performSearch = () => {
      currentPage.value = 1 // 重置到第一页
      fetchJobs()
    }
    
    // 选择城市
    const selectCity = (city) => {
      selectedCity.value = city
      currentPage.value = 1 // 重置到第一页
      fetchJobs()
    }
    
    // 选择薪资范围
    const selectSalary = (salary) => {
      selectedSalary.value = salary
      currentPage.value = 1 // 重置到第一页
      fetchJobs()
    }
    
    // 选择职位类型
    const selectJobType = (jobType) => {
      selectedJobType.value = jobType
      currentPage.value = 1 // 重置到第一页
      fetchJobs()
    }
    
    // 更改页码
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchJobs()
      }
    }
    
    // 更改排序方式
    const changeSort = (sortValue) => {
      currentSort.value = sortValue
      currentPage.value = 1 // 排序后回到第一页
      fetchJobs()
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
    
    onMounted(() => {
      checkLoginStatus()
      
      // 检查路由参数中是否有关键词
      if (route.query.keyword) {
        searchQuery.value = route.query.keyword
      }
      
      fetchJobs()
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
      currentUser,
      currentUserType,
      userTypes,
      jobs,
      totalJobs,
      loading,
      searchQuery,
      selectedCity,
      selectedSalary,
      selectedJobType,
      currentSort,
      sortOptions,
      cities,
      salaryRanges,
      jobTypes,
      currentPage,
      totalPages,
      toggleDropdown,
      goToDashboard,
      logout,
      switchUserType,
      performSearch,
      selectCity,
      selectSalary,
      selectJobType,
      changeSort,
      changePage,
      viewJobDetails,
      formatDate
    }
  }
}
</script>

<style scoped>
/* 导航栏样式已在全局CSS中定义 */
.job-list-page {
  background-color: #F5F5F5;
  min-height: 100vh;
}

/* 搜索和筛选区域 - 居中占80% */
.search-filter-container {
  background-color: white;
  border-bottom: 1px solid #F0F0F0;
  max-width: 60%;
  margin: 80px auto 0;
  padding-left: 10%;
  padding-right: 10%;
  padding-top: 50px;
}

.search-box {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.search-input-container {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 16px;
  gap: 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
  height: 48px;
}

.search-icon {
  color: #8C8C8C;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 0;
  outline: none;
  border: none;
  font-size: 16px;
  background-color: transparent;
}

.search-button {
  background-color: #1890FF;
  color: white;
  padding: 0 32px;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-left: 16px;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #40a9ff;
}

.filter-section {
  padding: 24px 0;
  border-top: 1px solid #F0F0F0;
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.filter-label {
  width: 60px;
  font-weight: 500;
  color: #262626;
  margin-right: 16px;
  font-size: 14px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #F0F0F0;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #595959;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #1890FF;
  color: #1890FF;
}

.filter-btn.active {
  background-color: #1890FF;
  color: white;
  border-color: #1890FF;
}

/* 主要内容区域 - 与搜索区域对齐 */
.job-list-main {
  padding: 40px 0;
  max-width: 80%;
  margin: 0 auto;
  padding-left: 10%;
  padding-right: 10%;
}

/* 列表头部 - 职位数量和排序选项 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  border-bottom: 1px solid #F0F0F0;
}

.results-info {
  color: #8C8C8C;
  font-size: 14px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid #F0F0F0;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #595959;
  transition: all 0.3s;
}

.sort-btn:hover {
  border-color: #1890FF;
  color: #1890FF;
}

.sort-btn.active {
  background-color: #1890FF;
  color: white;
  border-color: #1890FF;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: -70px;
}

/* 职位卡片已在全局CSS中定义，这里添加一些特定样式 */
.job-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #F0F0F0;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890FF;
  color: #1890FF;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #595959;
  font-size: 14px;
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

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #8C8C8C;
  font-size: 16px;
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
  font-size: 14px;
  color: #8c8c8c;
  font-weight: bold;
}
</style>