<template>
  <div class="application-history-content">
    <div class="history-header">
      <h2>投递历史记录</h2>
      <div class="search-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索公司、岗位" 
          class="search-input"
          @keyup.enter="searchApplications"
        />
        <el-button type="primary" @click="searchApplications">搜索</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <h3>全部投递</h3>
          <p class="stat-number">{{ totalApplications }}</p>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <h3>面试邀请</h3>
          <p class="stat-number" style="color: #2A6DFF;">{{ interviewInvites }}</p>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <h3>被查看次数</h3>
          <p class="stat-number" style="color: #00C853;">{{ viewCount }}</p>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <h3>平均回复</h3>
          <p class="stat-number" style="color: #4CAF50;">{{ avgResponseTime }}h</p>
        </div>
      </el-card>
    </div>

    <!-- 投递记录表格 -->
    <el-card class="applications-card">
      <el-table
        :data="applications"
        style="width: 100%"
        stripe
        @row-click="handleRowClick"
      >
        <el-table-column prop="jobInfo" label="公司与岗位" min-width="250">
          <template #default="scope">
            <div class="job-info">
              <div class="job-title">{{ scope.row.jobTitle }}</div>
              <div class="company-info">
                <span class="company-name">{{ scope.row.companyName }}</span>
                <span class="salary">{{ scope.row.salary }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="applyTime" label="投递时间" width="160">
          <template #default="scope">
            <span>{{ scope.row.applyTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="投递状态" width="120">
          <template #default="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.status)"
              disable-transitions
            >
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              size="small"
              :type="getActionButtonType(scope.row.status)"
              @click.stop="handleAction(scope.row)"
            >
              {{ getActionText(scope.row.status) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalApplications"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 面试详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="面试详情"
      width="400px"
    >
      <div v-if="selectedApplication" class="interview-details">
        <div class="detail-item">
          <span class="detail-label">职位名称：</span>
          <span class="detail-value">{{ selectedApplication.jobTitle }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">公司名称：</span>
          <span class="detail-value">{{ selectedApplication.companyName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">面试时间：</span>
          <span class="detail-value">{{ selectedApplication.interviewTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">面试地点：</span>
          <span class="detail-value">{{ selectedApplication.interviewPlace }}</span>
        </div>
        <div v-if="selectedApplication.feedback" class="detail-item">
          <span class="detail-label">面试反馈：</span>
          <span class="detail-value">{{ selectedApplication.feedback }}</span>
        </div>
      </div>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">确定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '@/utils/auth.js';
import { getUserInfo } from '@/axios/modules/user.js';
import { getSeekerApplications } from '@/axios/modules/application.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'JobSeekerApplicationHistory',
  setup() {
    const router = useRouter();
    const userInfo = ref({
      name: '',
      jobTitle: '',
      experience: '',
      location: ''
    });

    // 搜索和分页
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalApplications = ref(0);
    const interviewInvites = ref(0);
    const viewCount = ref(0);
    const avgResponseTime = ref(0);
    const loading = ref(false);

    // 投递记录数据
    const applications = ref([]);

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
              location: data.location || ''
            };
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    // 获取投递记录
    const fetchApplications = async () => {
      try {
        loading.value = true;
        const response = await getSeekerApplications(null);
        if (response.code === 200) {
          const data = response.data;
          // 转换后端数据格式为前端需要的格式
          applications.value = data.map(app => {
            // 根据后端状态(0-已投递，1-已拒绝，2-面试邀请)转换为前端状态
            let status, statusText;
            switch(app.status) {
              case 0:
                status = 'pending';
                statusText = '待处理';
                break;
              case 1:
                status = 'rejected';
                statusText = '不合适';
                break;
              case 2:
                status = 'interview';
                statusText = '面试邀请';
                break;
              default:
                status = 'pending';
                statusText = '待处理';
            }

            return {
              id: app.id,
              jobTitle: app.jobTitle || '未知职位',
              companyName: app.companyName || '未知公司',
              salary: app.salaryMin && app.salaryMax ? `${app.salaryMin}k-${app.salaryMax}k` : '薪资面议',
              applyTime: app.appliedAt,
              status: status,
              statusText: statusText,
              jobId: app.jobId,
              interviewTime: app.interviewTime,
              interviewPlace: app.interviewPlace,
              feedback: app.feedback
            };
          });

          // 计算统计数据
          totalApplications.value = data.length;
          interviewInvites.value = data.filter(app => app.status === 2).length;
        } else {
          ElMessage.error('获取投递记录失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取投递记录失败:', error);
        ElMessage.error('获取投递记录失败: 网络错误');
      } finally {
        loading.value = false;
      }
    };

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      switch (status) {
        case 'pending': return 'info';
        case 'viewed': return 'warning';
        case 'interview': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
      }
    };

    // 获取操作按钮类型
    const getActionButtonType = (status) => {
      switch (status) {
        case 'pending': return 'info';
        case 'viewed': return 'primary';
        case 'interview': return 'success';
        default: return 'info';
      }
    };

    // 获取操作按钮文本
    const getActionText = (status) => {
      switch (status) {
        case 'pending': return '查看职位';
        case 'viewed': return '查看职位';
        case 'interview': return '查看详情';
        case 'rejected': return '查看职位';
        default: return '查看职位';
      }
    };

    // 搜索投递记录
    const searchApplications = () => {
      console.log('搜索:', searchQuery.value);
      // 前端过滤
      if (searchQuery.value.trim()) {
        fetchApplications();
      }
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
    };

    // 处理当前页变化
    const handleCurrentChange = (page) => {
      currentPage.value = page;
    };

    // 处理行点击
    const handleRowClick = (row) => {
      console.log('点击行:', row);
    };

    // 对话框相关
    const dialogVisible = ref(false);
    const selectedApplication = ref(null);

    // 处理操作按钮点击
    const handleAction = (row) => {
      console.log('操作:', row);
      if (row.status === 'interview') {
        // 面试邀请状态，显示详情对话框
        selectedApplication.value = row;
        dialogVisible.value = true;
      } else {
        // 其他状态，查看职位详情
        router.push(`/job/${row.jobId}`);
      }
    };

    onMounted(() => {
      fetchUserInfo();
      fetchApplications();
    });

    return {
      userInfo,
      searchQuery,
      currentPage,
      pageSize,
      totalApplications,
      interviewInvites,
      viewCount,
      avgResponseTime,
      applications,
      loading,
      dialogVisible,
      selectedApplication,
      getStatusTagType,
      getActionButtonType,
      getActionText,
      searchApplications,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick,
      handleAction
    };
  }
};
</script>

<style scoped>
.application-history-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.search-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  background: white;
}

.stat-content h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #909399;
}

.stat-content .stat-number {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.applications-card {
  background-color: white;
}

.job-info {
  display: flex;
  flex-direction: column;
}

.job-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.company-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

:deep(.el-dialog__header) {
  padding: 20px !important;
  border-bottom: 1px solid #eee;
}

.salary {
  color: #e6a23c;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-section {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
}

/* 面试详情对话框样式 */
.interview-details {
  padding: 10px 0;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: bold;
  width: 80px;
  margin-right: 10px;
  color: #606266;
}

.detail-value {
  flex: 1;
  color: #303133;
  word-break: break-word;
}
</style>