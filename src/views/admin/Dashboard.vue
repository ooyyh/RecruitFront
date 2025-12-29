<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">运营看板</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon bg-blue">
            <Icon icon="ri:user-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green">
            <Icon icon="ri:building-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalCompanies }}</div>
            <div class="stat-label">企业数量</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange">
            <Icon icon="ri:file-text-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalJobs }}</div>
            <div class="stat-label">职位数量</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-red">
            <Icon icon="ri:alert-line" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ pendingCount }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
        <div class="dashboard-rows">
          <div class="dashboard-row">
            <div class="dashboard-card">
              <div class="card-header">
                <h3>企业入驻审核</h3>
                <router-link to="/admin/company-review" class="view-all">查看全部</router-link>
              </div>
              <div class="card-content">
                <div v-if="pendingCompanies.length > 0">
                  <div class="review-item" v-for="item in pendingCompanies" :key="item.id">
                    <div class="review-company-info">
                      <div class="company-logo">{{ item.companyName.charAt(0) }}</div>
                      <div class="company-details">
                        <div class="company-name">{{ item.companyName }}</div>
                        <div class="company-industry">{{ item.industry }} / {{ item.companySize }}</div>
                      </div>
                    </div>
                    <div class="review-status">
                      <span class="status-pending">待审核</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-data">
                  暂无待审核的企业
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <h3>职位审核</h3>
                <router-link to="/admin/job-review" class="view-all">查看全部</router-link>
              </div>
              <div class="card-content">
                <div v-if="pendingJobs.length > 0">
                  <div class="review-item" v-for="item in pendingJobs" :key="item.id">
                    <div class="review-job-info">
                      <div class="job-title">{{ item.title }}</div>
                      <div class="job-company">{{ item.companyName }}</div>
                    </div>
                    <div class="review-status">
                      <span class="status-pending">待审核</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-data">
                  暂无待审核的职位
                </div>
              </div>
            </div>
          </div>

        <div class="dashboard-row">
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>近期活动</h3>
            </div>
            <div class="card-content">
                <div class="activity-list">
                  <div v-if="recentActivities.length > 0">
                    <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                      <div class="activity-icon">
                        <Icon :icon="activity.icon" />
                      </div>
                      <div class="activity-content">
                        <div class="activity-text">{{ activity.text }}</div>
                        <div class="activity-time">{{ activity.displayTime }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-data">
                    暂无近期活动
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
import { getCompanies } from '@/axios/modules/companyAdmin.js'
import { getJobsForReview } from '@/axios/modules/jobAdmin.js'
import { getUserList } from '@/axios/modules/user.js'

export default {
  name: 'AdminDashboard',
  components: {
    Icon
  },
  setup() {
    // 统计数据
    const totalUsers = ref(0)
    const totalCompanies = ref(0)
    const totalJobs = ref(0)
    const pendingCount = ref(0)

    // 待审核企业数据
    const pendingCompanies = ref([])

    // 待审核职位数据
    const pendingJobs = ref([])

    // 近期活动数据
    const recentActivities = ref([])

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        // 获取用户总数
        const userResponse = await getUserList(1, 1)
        if (userResponse.code === 200) {
          totalUsers.value = userResponse.data.total || 0
        }

        // 获取所有企业和待审核企业
        const allCompaniesResponse = await getCompanies()
        const pendingCompaniesResponse = await getCompanies({ status: 0 }) // 0表示待审核
        
        if (allCompaniesResponse.code === 200) {
          totalCompanies.value = allCompaniesResponse.data.length || 0
          
          // 生成企业审核通过的活动记录
          const approvedCompanies = allCompaniesResponse.data.filter(company => company.certificationStatus === 1)
          const companyActivities = approvedCompanies.map(company => ({
            id: `company-${company.id}`,
            icon: 'ri:shield-check-line',
            text: `${company.companyName} 通过了企业认证`,
            time: company.certificationTime,
            timestamp: new Date(company.certificationTime).getTime()
          }))
          
          // 获取职位总数和待审核职位
          const allJobsResponse = await getJobsForReview({ status: null })
          const pendingJobsResponse = await getJobsForReview({ status: 0 }) // 0表示待审核
          
          if (allJobsResponse.code === 200) {
            totalJobs.value = allJobsResponse.data.total || 0
            
            // 生成职位审核通过的活动记录
            const approvedJobs = allJobsResponse.data.data.filter(job => job.status === 1)
            const jobActivities = approvedJobs.map(job => ({
              id: `job-${job.id}`,
              icon: 'ri:file-check-line',
              text: `职位 "${job.title}" 已发布`,
              time: job.updatedAt,
              timestamp: new Date(job.updatedAt).getTime()
            }))
            
            // 合并活动记录并按时间倒序排序
            const allActivities = [...companyActivities, ...jobActivities]
            allActivities.sort((a, b) => b.timestamp - a.timestamp)
            
            // 格式化时间显示
            allActivities.forEach(activity => {
              const now = new Date().getTime()
              const diff = now - activity.timestamp
              const minutes = Math.floor(diff / (1000 * 60))
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
              
              if (minutes < 1) {
                activity.displayTime = '刚刚'
              } else if (minutes < 60) {
                activity.displayTime = `${minutes}分钟前`
              } else if (hours < 24) {
                activity.displayTime = `${hours}小时前`
              } else {
                activity.displayTime = `${days}天前`
              }
            })
            
            // 只显示最近的10条活动
            recentActivities.value = allActivities.slice(0, 10)
          }
        }
        
        if (pendingCompaniesResponse.code === 200) {
          pendingCompanies.value = pendingCompaniesResponse.data || []
        }
        
        if (pendingJobsResponse.code === 200) {
          pendingJobs.value = pendingJobsResponse.data.data || []
        }

        // 计算待审核总数
        pendingCount.value = (pendingCompanies.value?.length || 0) + (pendingJobs.value?.length || 0)
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    onMounted(() => {
      fetchStatistics()
    })

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      pendingCount,
      pendingCompanies,
      pendingJobs,
      recentActivities
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.bg-red {
  background-color: #F5222D;
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

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.review-item:last-child {
  border-bottom: none;
}

.review-company-info, .review-job-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #1890FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.company-details {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.company-industry {
  font-size: 12px;
  color: #999;
}

.job-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.job-company {
  font-size: 12px;
  color: #999;
}

.review-status {
  display: flex;
  align-items: center;
}

/* 无数据提示样式 */
.empty-data {
  text-align: center;
  color: #999;
  padding: 20px 0;
  font-size: 14px;
  background-color: #fafafa;
  border-radius: 4px;
}

.status-pending {
  background-color: #fff7e6;
  color: #fa8c16;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ffd591;
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
</style>