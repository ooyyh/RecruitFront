<template>
  <div class="job-posting-page">
    <div class="page-header">
      <h1 class="page-title">职位发布</h1>
      <div class="page-subtitle">发布优质职位，吸引优秀人才</div>
    </div>

    <!-- 公司认证状态提示 -->
    <div class="company-status-section" v-if="!companyInfo || companyInfo.certificationStatus !== 1">
      <div class="status-card">
        <div class="status-icon">
          <Icon icon="ri:error-warning-line" class="warning-icon" />
        </div>
        <div class="status-content">
          <h3>企业认证提示</h3>
          <p v-if="!companyInfo">您还没有关联企业信息，请先完善企业信息并提交认证</p>
          <p v-else-if="companyInfo.certificationStatus === 0">您的企业信息已提交，正在审核中，请耐心等待</p>
          <p v-else-if="companyInfo.certificationStatus === 2">您的企业认证未通过，请修改企业信息后重新提交</p>
          <el-button 
            type="primary" 
            @click="goToCompanyProfile"
            v-if="companyInfo && companyInfo.certificationStatus !== 0"
          >
            去完善企业信息
          </el-button>
        </div>
      </div>
    </div>

    <!-- 职位发布表单 -->
    <div class="job-form-section" v-if="companyInfo && companyInfo.certificationStatus === 1">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>发布新职位</span>
          </div>
        </template>
        
        <el-form 
          :model="jobForm" 
          :rules="jobRules" 
          ref="jobFormRef"
          label-width="120px"
          class="job-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="职位名称" prop="title">
                <el-input 
                  v-model="jobForm.title" 
                  placeholder="请输入职位名称"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="工作类型" prop="type">
                <el-select 
                  v-model="jobForm.type" 
                  placeholder="请选择工作类型"
                  style="width: 100%"
                >
                  <el-option label="全职" :value="0"></el-option>
                  <el-option label="实习" :value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公司名称" prop="companyName">
                <el-input 
                  v-model="jobForm.companyName" 
                  placeholder="请输入公司名称"
                  :value="companyInfo?.companyName"
                  @focus="autoFillCompanyInfo"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="公司地址" prop="companyAddress">
                <el-input 
                  v-model="jobForm.companyAddress" 
                  placeholder="请输入公司地址"
                  :value="companyInfo?.companyAddress"
                  @focus="autoFillCompanyInfo"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最低薪资" prop="salaryMin">
                <el-input 
                  v-model="jobForm.salaryMin" 
                  type="number"
                  placeholder="请输入最低薪资"
                >
                  <template #append>元/月</template>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="最高薪资" prop="salaryMax">
                <el-input 
                  v-model="jobForm.salaryMax" 
                  type="number"
                  placeholder="请输入最高薪资"
                >
                  <template #append>元/月</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学历要求" prop="education">
                <el-select 
                  v-model="jobForm.education" 
                  placeholder="请选择学历要求"
                  style="width: 100%"
                >
                  <el-option label="不限" value="不限"></el-option>
                  <el-option label="大专" value="大专"></el-option>
                  <el-option label="本科" value="本科"></el-option>
                  <el-option label="硕士" value="硕士"></el-option>
                  <el-option label="博士" value="博士"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="经验要求" prop="experience">
                <el-select 
                  v-model="jobForm.experience" 
                  placeholder="请选择经验要求"
                  style="width: 100%"
                >
                  <el-option label="不限" value="不限"></el-option>
                  <el-option label="应届毕业生" value="应届毕业生"></el-option>
                  <el-option label="1年以内" value="1年以内"></el-option>
                  <el-option label="1-3年" value="1-3年"></el-option>
                  <el-option label="3-5年" value="3-5年"></el-option>
                  <el-option label="5-10年" value="5-10年"></el-option>
                  <el-option label="10年以上" value="10年以上"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="职位描述" prop="description">
            <el-input 
              v-model="jobForm.description"
              :autosize="{ minRows: 4, maxRows: 8 }"
              type="textarea"
              placeholder="详细描述职位职责、任职要求等信息"
            />
          </el-form-item>
          
          <el-form-item label="福利待遇" prop="benefits">
            <el-input 
              v-model="jobForm.benefits"
              :autosize="{ minRows: 3, maxRows: 6 }"
              type="textarea"
              placeholder="描述公司福利、待遇等信息"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="submitJob"
              :loading="submitting"
              :disabled="!canPostJob"
            >
              发布职位
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 已发布职位列表 -->
    <div class="job-list-section" v-if="jobs.length > 0">
      <el-card class="list-card">
        <template #header>
          <div class="card-header">
            <span>已发布职位 ({{ jobs.length }})</span>
          </div>
        </template>
        
        <div class="job-list">
          <div 
            v-for="job in jobs" 
            :key="job.id" 
            class="job-item"
          >
            <div class="job-info">
              <div class="job-title-section">
                <h3 class="job-title">{{ job.title }}</h3>
                <el-tag 
                  :type="getStatusType(job.status)" 
                  size="small"
                  class="job-status"
                >
                  {{ getStatusText(job.status) }}
                </el-tag>
              </div>
              
              <div class="job-meta">
                <div class="job-company">{{ job.companyName }}</div>
                <div class="job-salary">{{ formatSalary(job.salaryMin, job.salaryMax) }}</div>
                <div class="job-type">{{ job.type === 0 ? '全职' : '实习' }}</div>
              </div>
              
              <div class="job-details">
                <div class="job-education">学历：{{ job.education || '不限' }}</div>
                <div class="job-experience">经验：{{ job.experience || '不限' }}</div>
              </div>
            </div>
            
            <div class="job-actions">
              <el-button 
                size="small" 
                @click="viewJobDetails(job.id)"
              >
                查看详情
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                plain
                @click="revokeJob(job.id)"
                :loading="revokingJobId === job.id"
                v-if="job.status !== 2" 
              >
                撤销
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, 
  ElButton, ElRow, ElCol, ElTag, ElDialog, ElMessage 
} from 'element-plus'
import { Icon } from '@iconify/vue'
import { getCompanyInfo } from '@/axios/modules/company.js'
import { getMyJobs, createJob, revokeJob, getJobDetail } from '@/axios/modules/job.js'

export default {
  name: 'JobPosting',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElButton,
    ElRow,
    ElCol,
    ElTag,
    ElDialog,
    Icon
  },
  setup() {
    const router = useRouter()
    const jobFormRef = ref()
    
    const companyInfo = ref(null)
    const jobs = ref([])
    const submitting = ref(false)
    const revokingJobId = ref(null)
    
    // 职位详情对话框相关
    const showJobDetailDialog = ref(false)
    const selectedJob = ref(null)
    
    const jobForm = reactive({
      title: '',
      type: 0, // 默认全职
      companyName: '',
      companyAddress: '',
      salaryMin: '',
      salaryMax: '',
      education: '',
      experience: '',
      description: '',
      benefits: ''
    })
    
    // 表单验证规则
    const jobRules = {
      title: [
        { required: true, message: '请输入职位名称', trigger: 'blur' },
        { min: 2, max: 50, message: '职位名称长度应在2-50个字符之间', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择工作类型', trigger: 'change' }
      ],
      companyName: [
        { required: true, message: '请输入公司名称', trigger: 'blur' }
      ],
      companyAddress: [
        { required: true, message: '请输入公司地址', trigger: 'blur' }
      ],
      salaryMin: [
        { required: true, message: '请输入最低薪资', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入有效的薪资数字', trigger: 'blur' }
      ],
      salaryMax: [
        { required: true, message: '请输入最高薪资', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入有效的薪资数字', trigger: 'blur' }
      ],
      education: [
        { required: true, message: '请选择学历要求', trigger: 'change' }
      ],
      experience: [
        { required: true, message: '请选择经验要求', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入职位描述', trigger: 'blur' }
      ]
    }
    
    // 计算属性：是否可以发布职位
    const canPostJob = ref(false)
    
    // 获取认证状态文本
    const getStatusText = (status) => {
      switch(status) {
        case 0: return '待审核'
        case 1: return '已发布'
        case 2: return '已撤销'
        default: return '未知'
      }
    }

    // 获取认证状态类型
    const getStatusType = (status) => {
      switch(status) {
        case 0: return 'info'    // 待审核
        case 1: return 'success' // 已发布
        case 2: return 'danger'  // 已撤销
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
    
    // 自动填充公司信息
    const autoFillCompanyInfo = () => {
      if (companyInfo.value) {
        if (!jobForm.companyName) {
          jobForm.companyName = companyInfo.value.companyName || ''
        }
        if (!jobForm.companyAddress) {
          jobForm.companyAddress = companyInfo.value.companyAddress || ''
        }
      }
    }
    
    // 提交职位
    const submitJob = async () => {
      if (!jobFormRef.value) return
      
      try {
        const valid = await jobFormRef.value.validate()
        if (valid) {
          // 验证薪资范围
          if (jobForm.salaryMin && jobForm.salaryMax && 
              parseInt(jobForm.salaryMin) > parseInt(jobForm.salaryMax)) {
            ElMessage.error('最低薪资不能高于最高薪资')
            return
          }
          
          submitting.value = true
          
          const response = await createJob({
            ...jobForm,
            salaryMin: jobForm.salaryMin ? parseFloat(jobForm.salaryMin) : null,
            salaryMax: jobForm.salaryMax ? parseFloat(jobForm.salaryMax) : null
          })
          
          if (response.code === 200) {
            ElMessage.success(response.message || '职位发布成功，请等待审核')
            resetForm()
            loadJobs() // 重新加载职位列表
          } else {
            ElMessage.error(response.message || '发布失败')
          }
        }
      } catch (error) {
        console.error('表单验证失败或提交失败:', error)
        ElMessage.error('发布失败，请检查表单信息')
      } finally {
        submitting.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      jobForm.title = ''
      jobForm.type = 0
      jobForm.companyName = ''
      jobForm.companyAddress = ''
      jobForm.salaryMin = ''
      jobForm.salaryMax = ''
      jobForm.education = ''
      jobForm.experience = ''
      jobForm.description = ''
      jobForm.benefits = ''
    }
    
    // 加载公司信息
    const loadCompanyInfo = async () => {
      try {
        const response = await getCompanyInfo()
        if (response.code === 200) {
          companyInfo.value = response.data
          canPostJob.value = response.data && response.data.certificationStatus === 1
        }
      } catch (error) {
        console.error('获取企业信息失败:', error)
      }
    }
    
    // 加载职位列表
    const loadJobs = async () => {
      try {
        const response = await getMyJobs()
        if (response.code === 200) {
          jobs.value = response.data || []
        } else {
          ElMessage.error(response.message || '获取职位列表失败')
        }
      } catch (error) {
        console.error('获取职位列表失败:', error)
        ElMessage.error('获取职位列表失败')
      }
    }
    
    // 撤销职位
    const revokeJobAction = async (jobId) => {
      try {
        revokingJobId.value = jobId
        const response = await revokeJob(jobId)
        if (response.code === 200) {
          ElMessage.success(response.message || '职位撤销成功')
          loadJobs() // 重新加载职位列表
        } else {
          ElMessage.error(response.message || '撤销失败')
        }
      } catch (error) {
        console.error('撤销职位失败:', error)
        ElMessage.error('撤销失败')
      } finally {
        revokingJobId.value = null
      }
    }
    
    // 查看职位详情
    const viewJobDetails = async (jobId) => {
      try {
        const response = await getJobDetail(jobId)
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
    
    // 跳转到公司信息页面
    const goToCompanyProfile = () => {
      router.push('/recruiter/profile')
    }
    
    onMounted(async () => {
      await loadCompanyInfo()
      await loadJobs()
    })
    
    return {
      companyInfo,
      jobs,
      jobForm,
      jobFormRef,
      jobRules,
      submitting,
      revokingJobId,
      showJobDetailDialog,
      selectedJob,
      canPostJob,
      getStatusText,
      getStatusType,
      formatSalary,
      autoFillCompanyInfo,
      submitJob,
      resetForm,
      loadJobs,
      revokeJob: revokeJobAction,
      viewJobDetails,
      closeJobDetailDialog,
      goToCompanyProfile
    }
  }
}
</script>

<style scoped>
.job-posting-page {
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
  color: #666;
  margin: 0;
}

.company-status-section {
  margin-bottom: 20px;
}

.status-card {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.status-icon {
  font-size: 24px;
  color: #faad14;
  flex-shrink: 0;
}

.status-content h3 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 16px;
}

.status-content p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.job-form-section {
  margin-bottom: 20px;
}

.form-card {
  border-radius: 8px;
  border: 1px solid #eee;
}

.card-header {
  font-weight: 600;
  color: #333;
}

.job-form {
  padding: 20px 0;
}

.job-list-section {
  margin-bottom: 20px;
}

.list-card {
  border-radius: 8px;
  border: 1px solid #eee;
}

.job-list {
  max-height: 600px;
  overflow-y: auto;
}

.job-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.job-item:last-child {
  border-bottom: none;
}

.job-info {
  flex: 1;
}

.job-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.job-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.job-status {
  flex-shrink: 0;
}

.job-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.job-company {
  color: #333;
  font-weight: 500;
}

.job-salary {
  color: #e74c3c;
  font-weight: 500;
}

.job-type {
  color: #1890ff;
}

.job-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.job-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.job-detail-content {
  padding: 10px 0;
}

:deep(.el-dialog__header) {
  padding: 20px !important;
  border-bottom: 1px solid #eee;
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