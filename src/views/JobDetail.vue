<template>
  <div class="job-detail-page">
    <el-page-header 
      @back="goBack" 
      content="职位详情"
      class="page-header"
    >
    </el-page-header>
    
    <el-card class="job-detail-card">
      <div v-if="jobDetail" class="job-detail-content">
        <div class="job-header">
          <h1 class="job-title">{{ jobDetail.title }}</h1>
          <div class="job-meta">
            <div class="job-company">{{ jobDetail.companyName }}</div>
            <div class="job-salary">{{ jobDetail.salaryMin }}K - {{ jobDetail.salaryMax }}K</div>
          </div>
        </div>
        
        <div class="job-info">
          <div class="info-section">
            <h3>职位信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>工作地点:</label>
                <span>{{ jobDetail.companyAddress }}</span>
              </div>
              <div class="info-item">
                <label>发布时间:</label>
                <span>{{ jobDetail.createdAt }}</span>
              </div>
              <div class="info-item">
                <label>学历要求:</label>
                <span>{{ jobDetail.education || '不限' }}</span>
              </div>
              <div class="info-item">
                <label>经验要求:</label>
                <span>{{ jobDetail.experience || '不限' }}</span>
              </div>
              <div class="info-item">
                <label>工作性质:</label>
                <span>{{ jobDetail.type === 0 ? '全职' : '实习' }}</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>职位描述</h3>
            <div class="job-description">
              <p class="desc-item">{{ jobDetail.description }}</p>
            </div>
          </div>
          
          <div class="info-section">
            <h3>任职要求</h3>
            <div class="job-requirements">
              <p class="req-item">{{ jobDetail.experience }}</p>
            </div>
          </div>
          
          <div class="info-section">
            <h3>福利待遇</h3>
            <div class="job-benefits">
              <el-tag 
                v-for="benefit in jobDetail.benefits ? jobDetail.benefits.split(',') : []" 
                :key="benefit" 
                size="medium" 
                class="benefit-tag"
              >
                {{ benefit.trim() }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <el-button 
            v-if="currentUserType == 'jobSeeker' || currentUserType == ''" 
            type="primary" 
            size="large" 
            @click="applyJob"
          >
            立即申请
          </el-button>
          <el-button 
            v-if="currentUserType == 'jobSeeker' || currentUserType == ''" 
            size="large" 
            :type="isFavorite ? 'danger' : 'default'"
            @click="toggleFavorite"
            :loading="loading"
          >
            <el-icon v-if="isFavorite"><StarFilled /></el-icon>
            <el-icon v-else><Star /></el-icon>
            {{ isFavorite ? '已收藏' : '收藏职位' }}
          </el-button>
        </div>
      </div>
      
      <div v-else class="loading">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPublicJobDetail, applyJob as applyJobApi } from '@/axios/modules/jobPublic.js';
import { getCurrentUser } from '@/utils/auth.js';
import { checkFavorite, addFavorite, removeFavorite } from '@/axios/modules/favorite.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'JobDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const jobId = route.params.id;
    
    const jobDetail = ref(null);
    const currentUser = ref(null);
    const currentUserType = ref('');
    const isFavorite = ref(false);
    const loading = ref(false);
    
    // 获取职位详情
    const fetchJobDetail = async () => {
      try {
        const response = await getPublicJobDetail(jobId);
        jobDetail.value = response.data;
      } catch (error) {
        console.error('获取职位详情失败:', error);
        ElMessage.error('获取职位详情失败');
      }
    };
    
    // 检查职位是否已被收藏
    const checkFavoriteStatus = async () => {
      if (!localStorage.getItem('token')) return;
      if (currentUserType.value !== 'jobSeeker') return;
      
      try {
        loading.value = true;
        const response = await checkFavorite(jobId);
        if (response.code === 200) {
          isFavorite.value = response.data;
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 检查用户登录状态
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // 获取当前用户信息
        const user = await getCurrentUser();
        if (user) {
          currentUser.value = user;
          // 根据role字段确定用户类型 (0-求职者, 1-招聘者, 2-管理员)
          switch(user.role) {
            case 0:
              currentUserType.value = 'jobSeeker';
              break;
            case 1:
              currentUserType.value = 'recruiter';
              break;
            case 2:
              currentUserType.value = 'admin';
              break;
            default:
              currentUserType.value = 'unknown';
          }
        }
      }
    };
    
    const goBack = () => {
      router.go(-1);
    };
    
    const applyJob = async () => {
      // 检查用户是否已登录
      if (!localStorage.getItem('token')) {
        // 显示提示信息
        ElMessage.warning('请先登录');
        router.push('/login');
        return;
      }
      
      // 检查用户是否是求职者
      if (currentUserType.value !== 'jobSeeker') {
        ElMessage.warning('只有求职者才能申请职位');
        return;
      }
      
      try {
        const response = await applyJobApi(jobId);
        if (response.code === 200 && response.data) {
          ElMessage.success('申请职位成功');
        } else {
          ElMessage.error('申请职位失败: ' + (response.message || '未知错误'));
        }
        console.log('申请职位成功:', response);
      } catch (error) {
        console.error('申请职位失败:', error);
        ElMessage.error('申请职位失败: 网络错误');
      }
    };
    
    // 切换收藏状态
    const toggleFavorite = async () => {
      // 检查用户是否已登录
      if (!localStorage.getItem('token')) {
        ElMessage.warning('请先登录');
        router.push('/login');
        return;
      }
      
      // 检查用户是否是求职者
      if (currentUserType.value !== 'jobSeeker') {
        ElMessage.warning('只有求职者才能收藏职位');
        return;
      }
      
      try {
        loading.value = true;
        if (isFavorite.value) {
          // 取消收藏
          const response = await removeFavorite(jobId);
          if (response.code === 200) {
            isFavorite.value = false;
            ElMessage.success('取消收藏成功');
          } else {
            ElMessage.error('取消收藏失败: ' + response.message);
          }
        } else {
          // 添加收藏
          const response = await addFavorite(jobId);
          if (response.code === 200) {
            isFavorite.value = true;
            ElMessage.success('收藏成功');
          } else {
            ElMessage.error('收藏失败: ' + response.message);
          }
        }
      } catch (error) {
        console.error('切换收藏状态失败:', error);
        ElMessage.error('操作失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchJobDetail();
      checkLoginStatus().then(() => {
        checkFavoriteStatus();
      });
    });
    
    return {
      jobDetail,
      goBack,
      applyJob,
      toggleFavorite,
      currentUserType,
      isFavorite,
      loading
    };
  }
};
</script>

<style scoped>
.job-detail-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 20px;
}

.job-detail-card {
  padding: 20px;
}

.job-header {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.job-title {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #303133;
}

.job-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-company {
  font-size: 18px;
  color: #606266;
}

.job-salary {
  font-size: 22px;
  color: #e6a23c;
  font-weight: bold;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
}

.info-item label {
  font-weight: bold;
  color: #606266;
  min-width: 80px;
}

.info-item span {
  color: #909399;
}

.job-description,
.job-requirements {
  line-height: 1.8;
  color: #606266;
}

.desc-item,
.req-item {
  margin: 5px 0;
}

.job-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.benefit-tag {
  background-color: #f0f9ff;
  border-color: #d5e8f7;
  color: #409eff;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.loading {
  padding: 40px;
}
</style>