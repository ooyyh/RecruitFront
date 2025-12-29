<template>
  <div class="saved-jobs-content">
    <div class="saved-jobs-header">
      <h2>职位收藏</h2>
      <div class="search-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索收藏的职位" 
          class="search-input"
          @keyup.enter="searchSavedJobs"
        />
        <el-button type="primary" @click="searchSavedJobs">搜索</el-button>
      </div>
    </div>

    <!-- 收藏的职位列表 -->
    <div class="jobs-container">
      <div 
        v-for="job in savedJobs" 
        :key="job.id" 
        class="job-card"
      >
        <div class="job-header">
          <div class="job-title">{{ job.title }}</div>
          <el-button 
            type="danger" 
            size="small" 
            @click="unsaveJob(job.id)"
            class="unsave-btn"
          >
            <el-icon><StarFilled />X</el-icon>
          </el-button>
        </div>
        
        <div class="job-company">{{ job.companyName }}</div>
        
        <div class="job-meta">
          <div class="job-salary">{{ job.salaryMin }}K - {{ job.salaryMax }}K</div>
          <div class="job-info">
            <span class="job-location">{{ job.companyAddress }}</span>
            <span class="job-education">{{ job.education || '不限' }}</span>
            <span class="job-experience">{{ job.experience || '不限' }}</span>
          </div>
        </div>
        
        <div class="job-tags">
          <el-tag 
            v-for="benefit in job.benefits ? job.benefits.split(',').slice(0, 3) : []" 
            :key="benefit" 
            size="small" 
            class="benefit-tag"
          >
            {{ benefit.trim() }}
          </el-tag>
        </div>
        
        <div class="job-footer">
          <div class="job-time">{{ job.createdAt }}</div>
          <div class="job-actions">
            <el-button size="small" @click="viewJobDetail(job.id)">查看</el-button>
            <el-button size="small" type="primary" @click="applyForJob(job.id)">申请</el-button>
          </div>
        </div>
      </div>
      
      <div v-if="savedJobs.length === 0" class="no-jobs">
        <el-empty description="暂无收藏的职位" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 24, 48]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalSavedJobs"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '@/utils/auth.js';
import { getUserInfo } from '@/axios/modules/user.js';
import { getFavoriteList, removeFavorite } from '@/axios/modules/favorite.js';
import { applyJob } from '@/axios/modules/jobPublic.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'JobSeekerSavedJobs',
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
    const pageSize = ref(6);
    const totalSavedJobs = ref(58);
    
    // 收藏的职位数据
    const savedJobs = ref([]);
    const loading = ref(false);
    const error = ref(null);

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
    
    // 获取收藏职位列表
    const fetchSavedJobs = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await getFavoriteList();
        if (response.code === 200) {
          savedJobs.value = response.data;
          totalSavedJobs.value = response.data.length;
        } else {
          error.value = response.message;
          ElMessage.error('获取收藏列表失败: ' + response.message);
        }
      } catch (err) {
        console.error('获取收藏列表错误:', err);
        error.value = '网络错误，请稍后重试';
        ElMessage.error('获取收藏列表失败: 网络错误');
      } finally {
        loading.value = false;
      }
    };

    // 搜索收藏的职位
    const searchSavedJobs = () => {
      console.log('搜索收藏的职位:', searchQuery.value);
      // 如果后端支持搜索功能，可以在这里调用API
      // 目前可以先做前端过滤
      if (searchQuery.value.trim()) {
        const filteredJobs = savedJobs.value.filter(job => 
          job.title.includes(searchQuery.value) || 
          job.companyName.includes(searchQuery.value)
        );
        // 可以考虑将过滤结果保存到另一个变量，避免影响原始数据
      }
    };

    // 取消收藏职位
    const unsaveJob = async (jobId) => {
      try {
        const response = await removeFavorite(jobId);
        if (response.code === 200) {
          ElMessage.success('已取消收藏');
          // 从列表中移除该职位
          const index = savedJobs.value.findIndex(job => job.id === jobId);
          if (index !== -1) {
            savedJobs.value.splice(index, 1);
            totalSavedJobs.value -= 1;
          }
        } else {
          ElMessage.error('取消收藏失败: ' + response.message);
        }
      } catch (err) {
        console.error('取消收藏错误:', err);
        ElMessage.error('取消收藏失败: 网络错误');
      }
    };

    // 查看职位详情
    const viewJobDetail = (jobId) => {
      router.push(`/job/${jobId}`);
    };

    // 申请职位
    const applyForJob = async (jobId) => {
      try {
        const response = await applyJob(jobId);
        if (response.code === 200 && response.data) {
          ElMessage.success('申请职位成功');
        } else {
          ElMessage.error('申请职位失败: ' + (response.message || '未知错误'));
        }
      } catch (err) {
        console.error('申请职位错误:', err);
        ElMessage.error('申请职位失败: 网络错误');
      }
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
      // 重新获取数据
    };

    // 处理当前页变化
    const handleCurrentChange = (page) => {
      currentPage.value = page;
      // 重新获取数据
    };

    onMounted(() => {
      fetchUserInfo();
      fetchSavedJobs();
    });

    return {
      userInfo,
      searchQuery,
      currentPage,
      pageSize,
      totalSavedJobs,
      savedJobs,
      loading,
      error,
      searchSavedJobs,
      unsaveJob,
      viewJobDetail,
      applyForJob,
      handleSizeChange,
      handleCurrentChange
    };
  }
};
</script>

<style scoped>
.saved-jobs-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.saved-jobs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.saved-jobs-header h2 {
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

.jobs-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.job-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
}

.job-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.job-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  flex: 1;
  margin-right: 10px;
}

.unsave-btn {
  padding: 5px;
}

.job-company {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
}

.job-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.job-salary {
  font-size: 18px;
  color: #e6a23c;
  font-weight: bold;
}

.job-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  color: #909399;
}

.job-info span {
  margin-bottom: 2px;
}

.job-tags {
  margin-bottom: 15px;
}

.benefit-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f4f4f5;
}

.job-time {
  font-size: 12px;
  color: #909399;
}

.job-actions {
  display: flex;
  gap: 8px;
}

.no-jobs {
  text-align: center;
  padding: 40px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .saved-jobs-header {
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
  
  .jobs-container {
    grid-template-columns: 1fr;
  }
  
  .job-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .job-info {
    align-items: flex-start;
  }
}
</style>