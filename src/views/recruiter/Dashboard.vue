<template>
  <div class="recruiter-dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">招聘看板</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon bg-blue">
            <Icon icon="ri:file-text-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ activeJobs.length }}</div>
            <div class="stat-label">在招职位</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green">
            <Icon icon="ri:file-copy-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ resumeCount }}</div>
            <div class="stat-label">收到简历</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange">
            <Icon icon="ri:user-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ interviewCount }}</div>
            <div class="stat-label">面试邀请</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple">
            <Icon icon="ri:check-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingResumes.length }}</div>
            <div class="stat-label">待处理简历</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-rows">
        <div class="dashboard-row">
          <div class="dashboard-card">
            <div class="card-header">
              <h3>职位管理</h3>
              <router-link to="/recruiter/job-posting" class="view-all">发布职位</router-link>
            </div>
            <div class="card-content">
              <div class="job-item" v-for="job in activeJobs.slice(0, 3)" :key="job.id">
              <div class="job-info">
                <div class="job-title">{{ job.title }}</div>
                <div class="job-meta">
                  <span class="job-salary">{{ job.salary }}</span>
                  <span class="job-location">{{ job.location }}</span>
                </div>
              </div>
              <div class="job-status">
                <span :class="['status', job.status === 1 ? 'active' : 'paused']">
                  {{ job.status === 1 ? '招聘中' : '暂停' }}
                </span>
              </div>
            </div>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h3>简历审核</h3>
              <router-link to="/recruiter/resume-review" class="view-all">查看全部</router-link>
            </div>
            <div class="card-content">
              <div v-if="pendingResumes.length > 0">
              <div class="resume-item" v-for="resume in pendingResumes" :key="resume.id">
                <div class="resume-info">
                  <div class="resume-name">{{ resume.seekerName || '未知求职者' }}</div>
                  <div class="resume-position">{{ resume.jobTitle || '未知职位' }}</div>
                </div>
                <div class="resume-status">
                  <span class="status-pending">待处理</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>暂无待处理简历</p>
            </div>
            </div>
          </div>
        </div>

        <div class="dashboard-row">
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>近期动态</h3>
            </div>
            <div class="card-content">
              <div class="activity-list">
                <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                  <div class="activity-icon">
                    <Icon :icon="activity.icon" />
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.text }}</div>
                    <div class="activity-time">{{ activity.formattedTime }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { getMyJobs } from '@/axios/modules/job.js'
import { getRecruiterApplications } from '@/axios/modules/application.js'

export default {
  name: 'RecruiterDashboard',
  components: {
    Icon
  },
  setup() {
    // 响应式数据
    const activeJobs = ref([]) // 在招职位
    const resumeCount = ref(0) // 收到简历数
    const interviewCount = ref(0) // 面试邀请数
    const pendingResumes = ref([]) // 待处理简历
    const recentActivities = ref([]) // 近期动态

    // 格式化时间
    const formatTime = (timeStr) => {
      const now = new Date()
      const time = new Date(timeStr)
      const diff = now - time
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 30) return `${days}天前`
      
      return time.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 获取招聘者数据
    const fetchDashboardData = async () => {
      try {
        // 获取在招职位
        const jobsRes = await getMyJobs()
        activeJobs.value = jobsRes.data || []
        
        // 获取收到的简历
        const resumesRes = await getRecruiterApplications()
        resumeCount.value = resumesRes.data.length
        
        // 待处理简历（状态为0的）
        pendingResumes.value = resumesRes.data.filter(r => r.status === 0).slice(0, 4)
        
        // 面试邀请数（状态为2的）
        interviewCount.value = resumesRes.data.filter(r => r.status === 2).length
        
        // 生成近期动态
        const activities = []
        
        // 1. 职位相关事件
        jobsRes.data.forEach(job => {
          // 发布职位事件
          activities.push({
            id: `job-${job.id}-create`,
            icon: 'ri:file-text-line',
            text: `发布了新职位 "${job.title}"`,
            time: job.createdAt || job.updatedAt,
            formattedTime: formatTime(job.createdAt || job.updatedAt)
          })
          
          // 职位通过审核事件
          if (job.status === 1) {
            activities.push({
              id: `job-${job.id}-approved`,
              icon: 'ri:file-check-line',
              text: `职位 "${job.title}" 通过了审核`,
              time: job.updatedAt || job.createdAt,
              formattedTime: formatTime(job.updatedAt || job.createdAt)
            })
          }
        })
        
        // 2. 简历投递相关事件
        resumesRes.data.forEach(r => {
          // 简历投递事件
          activities.push({
            id: `app-${r.id}-apply`,
            icon: 'ri:user-line',
            text: `${r.seekerName || '求职者'} 投递了 ${r.jobTitle || '职位'}`,
            time: r.appliedAt || r.createdAt || r.updatedAt, // 投递时间
            formattedTime: formatTime(r.appliedAt || r.createdAt || r.updatedAt)
          })
          
          // 根据状态添加相应事件
          if (r.status === 1) {
            // 简历驳回（status=1）
            activities.push({
              id: `app-${r.id}-reject`,
              icon: 'ri:close-line',
              text: `驳回了 ${r.seekerName || '求职者'} 的简历`,
              time: r.updatedAt, // 驳回时间
              formattedTime: formatTime(r.updatedAt)
            })
          } else if (r.status === 2) {
            // 发送面试邀请（status=2）
            activities.push({
              id: `app-${r.id}-interview`,
              icon: 'ri:mail-line',
              text: `向 ${r.seekerName || '求职者'} 发送了面试邀请`,
              time: r.updatedAt, // 发送面试邀请时间
              formattedTime: formatTime(r.updatedAt)
            })
          }
        })
        
        // 按时间倒序排序
        activities.sort((a, b) => new Date(b.time) - new Date(a.time))
        
        // 只展示前5条
        recentActivities.value = activities.slice(0, 5)
        
      } catch (error) {
        console.error('获取招聘数据失败:', error)
      }
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      activeJobs,
      resumeCount,
      interviewCount,
      pendingResumes,
      recentActivities
    }
  }
}
</script>

<style scoped>
.recruiter-dashboard {
  background-color: #f5f5f5;
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 16px;
}

.bg-blue {
  background-color: #1890FF;
}

.bg-green {
  background-color: #52C41A;
}

.bg-orange {
  background-color: #FA8C16;
}

.bg-purple {
  background-color: #722ED1;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.dashboard-content {
  background-color: #f5f5f5;
}

.dashboard-rows {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #eee;
  overflow: hidden;
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.view-all {
  color: #1890FF;
  text-decoration: none;
  font-size: 14px;
}

.view-all:hover {
  text-decoration: underline;
}

.card-content {
  padding: 20px;
}

.job-item, .resume-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.job-item:last-child, .resume-item:last-child {
  border-bottom: none;
}

.job-info {
  display: flex;
  flex-direction: column;
}

.job-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.job-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.job-salary {
  color: #fa8c16;
}

.job-location {
  color: #666;
}

.job-status, .resume-status {
  display: flex;
  align-items: center;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status.paused {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-pending {
  background-color: #fffbe6;
  color: #d4b106;
  border: 1px solid #ffe58f;
}

.resume-info {
  display: flex;
  flex-direction: column;
}

.resume-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.resume-position {
  font-size: 12px;
  color: #666;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #1890FF;
  flex-shrink: 0;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-time {
  color: #999;
  font-size: 12px;
}

/* 无数据提示 */
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-top: 10px;
}
</style>