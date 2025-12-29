<template>
  <div class="job-review-page">
    <div class="page-header">
      <h1 class="page-title">职位审核</h1>
      <div class="page-subtitle">当前共有 {{ totalJobs }} 个职位等待审核 · {{ currentDate }} 实时更新</div>
    </div>

    <div class="page-controls">
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索职位名称、公司或关键词..." 
          :prefix-icon="Search"
          @keyup.enter="searchJobs"
        />
      </div>
      <el-select v-model="filterStatus" placeholder="状态筛选" @change="filterJobs" clearable>
        <el-option label="待审核" :value="0"></el-option>
        <el-option label="已发布" :value="1"></el-option>
        <el-option label="已驳回" :value="2"></el-option>
      </el-select>
      <el-button class="filter-btn" @click="resetFilter">重置</el-button>
    </div>

    <div class="review-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell job-info">职位信息</div>
          <div class="table-cell company-info">公司信息</div>
          <div class="table-cell salary-info">薪资范围/要求</div>
          <div class="table-cell time-info">提交时间</div>
          <div class="table-cell action-info">审核操作</div>
        </div>
      </div>

      <div class="table-body">
        <div 
          v-for="job in jobs" 
          :key="job.id" 
          class="table-row"
        >
          <div class="table-cell job-info">
            <div class="job-info-content">
              <div class="job-title">{{ job.title }}</div>
              <div class="job-type">
                <el-tag 
                  :type="job.type === 0 ? 'primary' : 'success'"
                  size="small"
                >
                  {{ job.type === 0 ? '全职' : '实习' }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="table-cell company-info">
            <div class="company-name">{{ job.companyName }}</div>
            <div class="company-address">{{ job.companyAddress }}</div>
          </div>
          
          <div class="table-cell salary-info">
            <div class="salary">{{ formatSalary(job.salaryMin, job.salaryMax) }}</div>
            <div class="requirements">
              <span class="education">{{ job.education || '不限' }}</span>
              <span class="experience">{{ job.experience || '不限' }}</span>
            </div>
          </div>
          
          <div class="table-cell time-info">
            <div class="submit-time">{{ formatDateTime(job.createdAt) }}</div>
          </div>
          
          <div class="table-cell action-info">
            <el-button 
              v-if="job.status === 0"
              type="success" 
              size="small"
              :loading="loadingStates[job.id] === 'approve'"
              @click="approveJob(job.id)"
            >
              通过审核
            </el-button>
            <el-button 
              v-if="job.status === 0"
              type="danger"
              plain
              size="small"
              :loading="loadingStates[job.id] === 'reject'"
              @click="rejectJob(job.id)"
            >
              驳回
            </el-button>
            <el-button 
              v-if="job.status === 1"
              type="warning"
              plain
              size="small"
              :loading="loadingStates[job.id] === 'revoke'"
              @click="revokeJob(job.id)"
            >
              下架
            </el-button>
            <el-button 
              type="info" 
              size="small"
              @click="viewJobDetails(job.id)"
            >
              查看
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="totalJobs"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 职位详情对话框 -->
    <el-dialog
      v-model="showJobDetailDialog"
      title="职位详情"
      width="600px"
      :before-close="closeJobDetailDialog"
    >
      <div v-if="selectedJob" class="job-detail-content">
        <div class="job-header">
          <h3 class="job-title-detail">{{ selectedJob.title }}</h3>
          <el-tag :type="getStatusType(selectedJob.status)">
            {{ getStatusText(selectedJob.status) }}
          </el-tag>
        </div>
        
        <div class="job-basic-info">
          <div class="info-item">
            <label>公司名称：</label>
            <span>{{ selectedJob.companyName }}</span>
          </div>
          <div class="info-item">
            <label>公司地址：</label>
            <span>{{ selectedJob.companyAddress }}</span>
          </div>
          <div class="info-item">
            <label>薪资范围：</label>
            <span>{{ formatSalary(selectedJob.salaryMin, selectedJob.salaryMax) }}</span>
          </div>
          <div class="info-item">
            <label>工作类型：</label>
            <span>{{ selectedJob.type === 0 ? '全职' : '实习' }}</span>
          </div>
          <div class="info-item">
            <label>学历要求：</label>
            <span>{{ selectedJob.education || '不限' }}</span>
          </div>
          <div class="info-item">
            <label>经验要求：</label>
            <span>{{ selectedJob.experience || '不限' }}</span>
          </div>
        </div>
        
        <div class="job-description">
          <label>职位描述：</label>
          <div class="description-content">{{ selectedJob.description || '暂无描述' }}</div>
        </div>
        
        <div class="job-benefits">
          <label>福利待遇：</label>
          <div class="benefits-content">{{ selectedJob.benefits || '暂无福利信息' }}</div>
        </div>
      </div>
        <span class="dialog-footer">
          <el-button @click="closeJobDetailDialog">关闭</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { 
  ElInput, ElButton, ElPagination, ElTag, ElSelect, ElOption, 
  ElDialog, ElMessage 
} from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getJobsForReview, reviewJob, getJobDetail } from '@/axios/modules/jobAdmin.js'

export default {
  name: 'JobReview',
  components: {
    ElInput,
    ElButton,
    ElPagination,
    ElTag,
    ElSelect,
    ElOption,
    ElDialog,
    Search
  },
  setup() {
    const searchKeyword = ref('')
    const filterStatus = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalJobs = ref(0)
    
    const jobs = ref([])
    const loadingStates = ref({})
    
    // 职位详情对话框相关
    const showJobDetailDialog = ref(false)
    const selectedJob = ref(null)
    
    const currentDate = new Date().toISOString().split('T')[0]

    // 获取状态文本
    const getStatusText = (status) => {
      switch(status) {
        case 0: return '待审核'
        case 1: return '已发布'
        case 2: return '已驳回/下架'
        default: return '未知'
      }
    }

    // 获取状态类型
    const getStatusType = (status) => {
      switch(status) {
        case 0: return 'info'    // 待审核
        case 1: return 'success' // 已发布
        case 2: return 'danger'  // 已驳回
        default: return 'info'
      }
    }
    
    // 格式化薪资显示
    const formatSalary = (min, max) => {
      if (!min && !max) return '面议'
      if (min && !max) return `${min}元/月`
      if (!min && max) return `${max}元/月`
      return `${min}-${max}元/月`
    }
    
    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }

    // 加载职位列表
    const loadJobs = async () => {
      try {
        const response = await getJobsForReview({
          page: currentPage.value,
          size: pageSize.value,
          keyword: searchKeyword.value,
          status: filterStatus.value
        })
        if (response.code === 200) {
          jobs.value = response.data.data || []
          totalJobs.value = response.data.total || 0
        } else {
          ElMessage.error(response.message || '获取职位列表失败')
        }
      } catch (error) {
        console.error('获取职位列表失败:', error)
        ElMessage.error('获取职位列表失败')
      }
    }

    // 搜索职位
    const searchJobs = () => {
      currentPage.value = 1
      loadJobs()
    }

    // 审核通过
    const approveJob = async (id) => {
      loadingStates.value[id] = 'approve'
      try {
        const response = await reviewJob(id, { status: 1 })
        if (response.code === 200) {
          ElMessage.success(response.message || '职位审核通过')
          loadJobs() // 重新加载数据
        } else {
          ElMessage.error(response.message || '审核失败')
        }
      } catch (error) {
        console.error('职位审核失败:', error)
        ElMessage.error('审核失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 驳回职位
    const rejectJob = async (id) => {
      loadingStates.value[id] = 'reject'
      try {
        const response = await reviewJob(id, { status: 2 })
        if (response.code === 200) {
          ElMessage.success(response.message || '职位审核已驳回')
          loadJobs() // 重新加载数据
        } else {
          ElMessage.error(response.message || '驳回失败')
        }
      } catch (error) {
        console.error('职位驳回失败:', error)
        ElMessage.error('驳回失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 下架职位（将已发布的职位设置为已驳回状态）
    const revokeJob = async (id) => {
      loadingStates.value[id] = 'revoke'
      try {
        const response = await reviewJob(id, { status: 2 })
        if (response.code === 200) {
          ElMessage.success(response.message || '职位已下架')
          loadJobs() // 重新加载数据
        } else {
          ElMessage.error(response.message || '下架失败')
        }
      } catch (error) {
        console.error('职位下架失败:', error)
        ElMessage.error('下架失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 查看职位详情
    const viewJobDetails = async (id) => {
      try {
        const response = await getJobDetail(id)
        if (response.code === 200) {
          selectedJob.value = response.data
          showJobDetailDialog.value = true
        } else {
          ElMessage.error(response.message || '获取职位详情失败')
        }
      } catch (error) {
        console.error('获取职位详情失败:', error)
        ElMessage.error('获取职位详情失败')
      }
    }

    // 关闭职位详情对话框
    const closeJobDetailDialog = () => {
      showJobDetailDialog.value = false
      selectedJob.value = null
    }

    // 筛选职位
    const filterJobs = () => {
      currentPage.value = 1
      loadJobs()
    }

    // 重置筛选
    const resetFilter = () => {
      searchKeyword.value = ''
      filterStatus.value = null
      currentPage.value = 1
      loadJobs()
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadJobs()
    }

    // 当前页改变
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadJobs()
    }

    onMounted(() => {
      loadJobs()
    })

    return {
      Search,
      searchKeyword,
      filterStatus,
      currentPage,
      pageSize,
      totalJobs,
      jobs,
      loadingStates,
      showJobDetailDialog,
      selectedJob,
      currentDate,
      getStatusText,
      getStatusType,
      formatSalary,
      formatDateTime,
      loadJobs,
      searchJobs,
      approveJob,
      rejectJob,
      revokeJob,
      viewJobDetails,
      closeJobDetailDialog,
      filterJobs,
      resetFilter,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.job-review-page {
  background-color: #f5f5f5;
  padding: 0;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.page-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  min-width: 70%;
}

.filter-btn {
  width: 80px;
}

.review-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #eee;
  overflow: hidden;
}

.table-header {
  background-color: #fafafa;
}

.header-row {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 16px;
  border-right: 1px solid #eee;
}

.table-cell:last-child {
  border-right: none;
}

.job-info {
  flex: 2;
}

.company-info {
  flex: 1.5;
}

.salary-info {
  flex: 1.2;
}

.time-info {
  flex: 1;
}

.action-info {
  flex: 1.8;
  display: flex;
  gap: 8px;
  align-items: center;
}

.job-info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.job-title {
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.job-type {
  align-self: flex-start;
}

.company-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.company-address {
  color: #666;
  font-size: 12px;
}

.salary {
  color: #fa8c16;
  font-weight: 500;
  margin-bottom: 4px;
}

.requirements {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.education, .experience {
  padding: 2px 6px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.submit-time {
  color: #666;
  font-size: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}

/* 职位详情对话框样式 */
:deep(.el-dialog__header) {
  padding: 20px !important;
  border-bottom: 1px solid #eee;
}

.job-detail-content {
  padding: 10px 0;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.job-title-detail {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.job-basic-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.info-item span {
  flex: 1;
  color: #333;
}

.job-description, .job-benefits {
  margin-bottom: 16px;
}

.job-description label, .job-benefits label {
  display: block;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.description-content, .benefits-content {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  line-height: 1.6;
  color: #333;
}
</style>