<template>
  <div class="resume-review-page">
    <div class="page-header">
      <h1 class="page-title">简历审核</h1>
      <div class="page-subtitle">当前共有 {{ totalResumes }} 份简历等待审核 · {{ currentDate }} 实时更新</div>
    </div>

    <div class="page-controls">
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索求职者姓名、职位或关键词..." 
          :prefix-icon="Search"
          @keyup.enter="searchResumes"
        />
      </div>
      <el-button class="filter-btn">筛选</el-button>
    </div>

    <div class="review-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell candidate-info">求职者信息</div>
          <div class="table-cell position-info">应聘职位</div>
          <div class="table-cell experience-info">经验/学历</div>
          <div class="table-cell time-info">投递时间</div>
          <div class="table-cell action-info">操作</div>
        </div>
      </div>

      <div class="table-body">
        <div 
          v-for="resume in resumes" 
          :key="resume.id" 
          class="table-row"
        >
          <div class="table-cell candidate-info">
            <div class="candidate-info-content">
              <div class="candidate-avatar">{{ resume.name.charAt(0) }}</div>
              <div class="candidate-details">
                <div class="candidate-name">{{ resume.name }}</div>
                <div class="candidate-contact">{{ resume.phone }} | {{ resume.email }}</div>
              </div>
            </div>
          </div>
          
          <div class="table-cell position-info">
            <div class="job-title">{{ resume.position }}</div>
            <div class="job-company">{{ resume.company }}</div>
          </div>
          
          <div class="table-cell experience-info">
            <div class="experience">{{ resume.experience }}</div>
            <div class="education">{{ resume.education }}</div>
          </div>
          
          <div class="table-cell time-info">
            <div class="submit-time">{{ resume.submitTime }}</div>
          </div>
          
          <div class="table-cell action-info">
            <el-button
              :type="resume.status === 2 ? 'success' : 'success'"
              :plain="resume.status === 2"
              size="small"
              :disabled="resume.status === 1 || resume.status === 2"
              @click="showInterviewDialog(resume.id)"
            >
              {{ resume.status === 2 ? '已邀请' : '面试邀请' }}
            </el-button>
            <el-button
              :type="resume.status === 1 ? 'danger' : 'default'"
              :plain="resume.status !== 1"
              size="small"
              :disabled="resume.status === 1 || resume.status === 2"
              @click="showRejectDialog(resume.id)"
            >
              {{ resume.status === 1 ? '已驳回' : '驳回' }}
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewResumeDetails(resume.id)"
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
        :total="totalResumes"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 驳回对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回简历"
      width="500px"
    >
      <el-form :model="rejectForm" label-position="top">
        <el-form-item label="驳回理由">
          <el-form-input
            v-model="rejectForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请填写驳回理由"
          ></el-form-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确认驳回</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 面试邀请对话框 -->
    <el-dialog
      v-model="interviewDialogVisible"
      title="发送面试邀请"
      width="500px"
    >
      <el-form :model="interviewForm" label-position="top">
        <el-form-item label="面试日期">
          <el-date-picker
            v-model="interviewForm.interviewDate"
            type="date"
            placeholder="选择面试日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="面试时间">
          <el-time-picker
            v-model="interviewForm.interviewTime"
            type="time"
            placeholder="选择面试时间"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="面试地点">
          <el-input
            v-model="interviewForm.interviewPlace"
            placeholder="请填写面试地点"
          ></el-input>
        </el-form-item>
      </el-form>
        <div class="dialog-footer">
          <el-button @click="interviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSendInterview">发送邀请</el-button>
        </div>
    </el-dialog>

    <!-- 简历详情对话框 -->
    <el-dialog
      v-model="resumeDetailDialogVisible"
      title="简历详情"
      width="700px"
    >
      <div v-if="currentResumeDetail" class="resume-detail">
        <div class="resume-header">
          <div class="resume-avatar">
            <img v-if="currentResumeDetail.photo" :src="getPhotoUrl(currentResumeDetail.photo)" alt="头像" />
            <div v-else class="avatar-placeholder">{{ currentResumeDetail.name ? currentResumeDetail.name.charAt(0) : '?' }}</div>
          </div>
          <div class="resume-basic">
            <h3>{{ currentResumeDetail.name || '未知姓名' }}</h3>
            <p>{{ currentResumeDetail.education || '未知学历' }} · {{ currentResumeDetail.major || '未知专业' }}</p>
          </div>
        </div>

        <div class="resume-section">
          <h4>联系方式</h4>
          <div class="info-row">
            <span class="label">手机：</span>
            <span class="value">{{ currentResumeDetail.phone || '暂无' }}</span>
          </div>
          <div class="info-row">
            <span class="label">邮箱：</span>
            <span class="value">{{ currentResumeDetail.email || '暂无' }}</span>
          </div>
        </div>

        <div class="resume-section">
          <h4>应聘职位</h4>
          <div class="info-row">
            <span class="label">职位：</span>
            <span class="value">{{ currentResumeDetail.position || '未知职位' }}</span>
          </div>
          <div class="info-row">
            <span class="label">公司：</span>
            <span class="value">{{ currentResumeDetail.company || '未知公司' }}</span>
          </div>
          <div class="info-row">
            <span class="label">投递时间：</span>
            <span class="value">{{ currentResumeDetail.submitTime }}</span>
          </div>
        </div>

        <div class="resume-section" v-if="currentResumeDetail.experience">
          <h4>工作经验</h4>
          <div class="experience-content">{{ currentResumeDetail.experience }}</div>
        </div>

        <div class="resume-section" v-if="currentResumeDetail.status === 2">
          <h4>面试信息</h4>
          <div class="info-row">
            <span class="label">面试时间：</span>
            <span class="value">{{ currentResumeDetail.interviewTime }}</span>
          </div>
          <div class="info-row">
            <span class="label">面试地点：</span>
            <span class="value">{{ currentResumeDetail.interviewPlace }}</span>
          </div>
        </div>

        <div class="resume-section" v-if="currentResumeDetail.status === 1 && currentResumeDetail.feedback">
          <h4>驳回理由</h4>
          <div class="feedback-content">{{ currentResumeDetail.feedback }}</div>
        </div>
      </div>
        <div class="dialog-footer">
          <el-button @click="resumeDetailDialogVisible = false">关闭</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElInput, ElButton, ElPagination, ElMessage, ElDialog, ElForm, ElFormItem, ElInput as ElFormInput, ElDatePicker, ElTimePicker } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { getRecruiterApplications, rejectApplication, sendInterview, getApplicationDetail } from '@/axios/modules/application.js'

export default {
  name: 'ResumeReview',
  components: {
    ElInput,
    ElButton,
    ElPagination,
    Icon
  },
  setup() {
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalResumes = ref(0)
    const resumes = ref([])
    const loading = ref(false)
    
    // 模态框相关
    const rejectDialogVisible = ref(false)
    const interviewDialogVisible = ref(false)
    const resumeDetailDialogVisible = ref(false)
    const currentApplication = ref(null)
    const currentResumeDetail = ref(null)
    
    // 表单数据
    const rejectForm = ref({
      feedback: ''
    })
    
    const interviewForm = ref({
      interviewDate: '',
      interviewTime: '',
      interviewPlace: ''
    })
    
    const currentDate = new Date().toISOString().split('T')[0]

    // 获取简历列表
    const fetchResumes = async () => {
      try {
        loading.value = true
        const response = await getRecruiterApplications(null)
        if (response.code === 200) {
          // 后端已经关联查询了职位信息和求职者信息，直接使用
          const applications = response.data
          const detailedResumes = applications.map((app) => {
            return {
              id: app.id,
              seekerId: app.seekerId,
              name: app.seekerName || `求职者${app.seekerId}`,
              phone: app.seekerPhone || '暂无',
              email: app.seekerEmail || '暂无',
              position: app.jobTitle || '未知职位',
              company: app.companyName || '未知公司',
              experience: app.seekerWorkExperience || '暂无经验',
              education: app.seekerEducation || '暂无学历',
              major: app.seekerMajor || '',
              photo: app.seekerPhoto || '',
              submitTime: app.appliedAt,
              status: app.status, // 0-已投递，1-已拒绝，2-面试邀请
              interviewTime: app.interviewTime,
              interviewPlace: app.interviewPlace,
              feedback: app.feedback
            }
          })

          resumes.value = detailedResumes
          totalResumes.value = detailedResumes.length
        } else {
          ElMessage.error('获取简历列表失败: ' + response.message)
        }
      } catch (error) {
        console.error('获取简历列表错误:', error)
        ElMessage.error('获取简历列表失败: 网络错误')
      } finally {
        loading.value = false
      }
    }

    // 搜索简历
    const searchResumes = () => {
      console.log('搜索简历:', searchKeyword.value)
      // 实际项目中这里会调用带搜索条件的API
      // 目前可以先做前端过滤
      if (searchKeyword.value.trim()) {
        const filteredResumes = resumes.value.filter(resume => 
          resume.name.includes(searchKeyword.value) || 
          resume.position.includes(searchKeyword.value) ||
          resume.company.includes(searchKeyword.value)
        )
        // 可以考虑将过滤结果保存到另一个变量，避免影响原始数据
      }
    }

    // 获取照片URL
    const getPhotoUrl = (photoPath) => {
      if (!photoPath) return '';
      // 如果是完整URL则直接返回，否则使用后端API获取
      if (photoPath.startsWith('http')) {
        return photoPath;
      } else if (photoPath.startsWith('/upload/')) {
        // 对于上传的文件，使用后端API端点获取
        const filename = photoPath.replace('/upload/', '');
        return `http://localhost:8080/file/upload/${filename}`;
      } else {
        // 根据实际后端配置返回完整URL
        return `http://localhost:8080${photoPath}`;
      }
    };

    // 发送面试邀请
    const showInterviewDialog = (id) => {
      currentApplication.value = id
      interviewDialogVisible.value = true
      // 重置表单
      interviewForm.value = {
        interviewDate: '',
        interviewTime: '',
        interviewPlace: ''
      }
    }

    // 确认发送面试邀请
    const confirmSendInterview = async () => {
      try {
        if (!interviewForm.value.interviewDate || !interviewForm.value.interviewTime || !interviewForm.value.interviewPlace) {
          ElMessage.warning('请填写完整的面试信息')
          return
        }
        
        // 处理日期时间格式，转换为MySQL能识别的datetime格式（YYYY-MM-DD HH:MM:SS）
        const date = new Date(interviewForm.value.interviewDate);
        const time = new Date(interviewForm.value.interviewTime);
        
        // 设置时间部分
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(0);
        date.setMilliseconds(0);
        
        // 转换为YYYY-MM-DD HH:MM:SS格式
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        const interviewDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        const response = await sendInterview(currentApplication.value, interviewDateTime, interviewForm.value.interviewPlace)
        if (response.code === 200 && response.data) {
          ElMessage.success('面试邀请已发送')
          interviewDialogVisible.value = false
          // 重新加载简历列表
          fetchResumes()
        } else {
          ElMessage.error('发送面试邀请失败: ' + (response.message || '未知错误'))
        }
      } catch (error) {
        console.error('发送面试邀请错误:', error)
        ElMessage.error('发送面试邀请失败: 网络错误')
      }
    }

    // 显示驳回对话框
    const showRejectDialog = (id) => {
      currentApplication.value = id
      rejectDialogVisible.value = true
      // 重置表单
      rejectForm.value = {
        feedback: ''
      }
    }

    // 确认驳回
    const confirmReject = async () => {
      try {
        if (!rejectForm.value.feedback.trim()) {
          ElMessage.warning('请填写驳回理由')
          return
        }
        
        const response = await rejectApplication(currentApplication.value, rejectForm.value.feedback)
        if (response.code === 200 && response.data) {
          ElMessage.success('简历已驳回')
          rejectDialogVisible.value = false
          // 重新加载简历列表
          fetchResumes()
        } else {
          ElMessage.error('驳回简历失败: ' + (response.message || '未知错误'))
        }
      } catch (error) {
        console.error('驳回简历错误:', error)
        ElMessage.error('驳回简历失败: 网络错误')
      }
    }

    // 查看简历详情
    const viewResumeDetails = (id) => {
      // 从 resumes 列表中找到对应的简历
      const resume = resumes.value.find(r => r.id === id)
      if (resume) {
        currentResumeDetail.value = resume
        resumeDetailDialogVisible.value = true
      } else {
        ElMessage.error('未找到简历信息')
      }
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    // 当前页改变
    const handleCurrentChange = (page) => {
      currentPage.value = page
    }

    onMounted(() => {
      // 加载简历审核数据
      fetchResumes()
    })

    return {
      Search,
      searchKeyword,
      currentPage,
      pageSize,
      totalResumes,
      resumes,
      currentDate,
      searchResumes,
      showInterviewDialog,
      confirmSendInterview,
      showRejectDialog,
      confirmReject,
      viewResumeDetails,
      handleSizeChange,
      handleCurrentChange,
      getPhotoUrl,
      rejectDialogVisible,
      interviewDialogVisible,
      resumeDetailDialogVisible,
      currentApplication,
      currentResumeDetail,
      rejectForm,
      interviewForm
    }
  }
}
</script>

<style scoped>
.resume-review-page {
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
  max-width: 400px;
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

.candidate-info {
  flex: 2;
}

.position-info {
  flex: 1.5;
}

.experience-info {
  flex: 1;
}

.time-info {
  flex: 1;
}
:deep(.el-dialog__header) {
  padding: 20px !important;
  border-bottom: 1px solid #eee;
}

.action-info {
  flex: 1.5;
  display: flex;
  gap: 8px;
  align-items: center;
}

.candidate-info-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidate-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.candidate-details {
  display: flex;
  flex-direction: column;
}

.candidate-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.candidate-contact {
  font-size: 12px;
  color: #999;
}

.job-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.job-company {
  color: #666;
  font-size: 12px;
}

.experience {
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.education {
  color: #666;
  font-size: 12px;
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

/* 简历详情弹窗样式 */
.resume-detail {
  padding: 10px;
}

.resume-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.resume-avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.resume-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1890FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.resume-basic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.resume-basic p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.resume-section {
  margin-bottom: 20px;
}

.resume-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row .label {
  width: 80px;
  color: #999;
  flex-shrink: 0;
}

.info-row .value {
  color: #333;
}

.experience-content,
.feedback-content {
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>