<template>
  <div class="user-review-page">
    <div class="page-header">
      <h1 class="page-title">用户审核</h1>
      <div class="page-subtitle">当前共有 {{ totalUsers }} 个用户等待审核 · {{ currentDate }} 实时更新</div>
    </div>

    <div class="page-controls">
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索用户名、邮箱或关键词..." 
          :prefix-icon="Search"
          @keyup.enter="searchUsers"
        />
      </div>
      <el-button class="filter-btn" @click="showFilterDialog">筛选</el-button>
    </div>

    <div class="review-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell user-info">用户信息</div>
          <div class="table-cell role-info">用户角色</div>
          <div class="table-cell contact-info">联系方式</div>
          <div class="table-cell time-info">注册时间</div>
          <div class="table-cell action-info">审核操作</div>
        </div>
      </div>

      <div class="table-body">
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="table-row"
        >
          <div class="table-cell user-info">
            <div class="user-info-content">
              <div class="user-avatar">{{ user.username ? user.username.charAt(0).toUpperCase() : '用' }}</div>
              <div class="user-details">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-id">ID: {{ user.id }}</div>
              </div>
            </div>
          </div>
          
          <div class="table-cell role-info">
            <el-tag 
              :type="getRoleType(user.role)"
              size="small"
            >
              {{ getRoleText(user.role) }}
            </el-tag>
          </div>
          
          <div class="table-cell contact-info">
            <div class="user-email">{{ user.email }}</div>
            <div class="user-phone">{{ user.phone || '-' }}</div>
          </div>
          
          <div class="table-cell time-info">
            <div class="register-time">{{ formatDateTime(user.createdAt) }}</div>
          </div>
          
          <div class="table-cell action-info">
            <el-button 
              v-if="user.status === 0"
              type="success" 
              size="small"
              :loading="loadingStates[user.id] === 'approve'"
              @click="approveUser(user.id)"
            >
              通过
            </el-button>
            <el-button 
              v-if="user.status === 0"
              type="danger"
              plain
              size="small"
              :loading="loadingStates[user.id] === 'reject'"
              @click="rejectUser(user.id)"
            >
              驳回
            </el-button>
            <el-button 
              v-if="user.status === 1"
              type="warning"
              plain
              size="small"
              :loading="loadingStates[user.id] === 'disable'"
              @click="disableUser(user.id)"
            >
              禁用
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
        :total="totalUsers"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户详情对话框 -->
    <!-- 由于已移除查看按钮，此处对话框也移除 -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElInput, ElButton, ElPagination, ElTag, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, reviewUser, disableUser } from '@/axios/modules/user.js'

export default {
  name: 'UserReview',
  components: {
    ElInput,
    ElButton,
    ElPagination,
    ElTag,
    ElDialog,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption
  },
  setup() {
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalUsers = ref(0)
    
    const users = ref([])
    
    // 加载状态
    const loadingStates = ref({})
    
    // 筛选相关
    const showFilter = ref(false)
    const filterForm = ref({
      role: null,
      status: null
    })
    
    const currentDate = new Date().toISOString().split('T')[0]

    // 获取角色文本
    const getRoleText = (role) => {
      switch(role) {
        case 0: return '求职者'
        case 1: return '招聘者'
        default: return '用户'
      }
    }

    // 获取角色标签类型
    const getRoleType = (role) => {
      switch(role) {
        case 0: return 'primary'  // 求职者
        case 1: return 'warning'  // 招聘者
        default: return 'info'
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      switch(status) {
        case 0: return '待审核'
        case 1: return '正常'
        case 2: return '禁用'
        default: return '未知'
      }
    }
    
    // 获取状态标签类型
    const getStatusType = (status) => {
      switch(status) {
        case 0: return 'info'   // 待审核
        case 1: return 'success' // 正常
        case 2: return 'danger'  // 禁用
        default: return 'info'
      }
    }
    
    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }

    // 加载用户列表
    const loadUsers = async () => {
      try {
        const response = await getUserList(
          currentPage.value, 
          pageSize.value, 
          searchKeyword.value, 
          filterForm.value.role, 
          filterForm.value.status
        )
        if (response.code === 200) {
          users.value = response.data.data || []
          totalUsers.value = response.data.total || 0
        } else {
          ElMessage.error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
      }
    }

    // 搜索用户
    const searchUsers = () => {
      currentPage.value = 1
      loadUsers()
    }

    // 审核通过
    const approveUser = async (id) => {
      loadingStates.value[id] = 'approve'
      try {
        const response = await reviewUser(id, { status: 1 })
        if (response.code === 200) {
          ElMessage.success('用户审核通过')
          loadUsers() // 重新加载数据
        } else {
          ElMessage.error(response.message || '审核失败')
        }
      } catch (error) {
        console.error('审核用户失败:', error)
        ElMessage.error('审核失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 驳回用户
    const rejectUser = async (id) => {
      loadingStates.value[id] = 'reject'
      try {
        // const response = await reviewUser(id, { status: 0 })
        const response = await disableUser(id)
        if (response.code === 200) {
          ElMessage.success('用户已驳回')
          loadUsers() // 重新加载数据
        } else {
          ElMessage.error(response.message || '驳回失败')
        }
      } catch (error) {
        console.error('驳回用户失败:', error)
        ElMessage.error('驳回失败')
      } finally {
        loadingStates.value[id] = null
      }
    }
    
    // 禁用用户
    const disableUserFunc = async (id) => {
      loadingStates.value[id] = 'disable'
      try {
        const response = await disableUser(id)
        if (response.code === 200) {
          ElMessage.success('用户已禁用')
          loadUsers() // 重新加载数据
        } else {
          ElMessage.error(response.message || '禁用失败')
        }
      } catch (error) {
        console.error('禁用用户失败:', error)
        ElMessage.error('禁用失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 显示筛选对话框
    const showFilterDialog = () => {
      showFilter.value = true
    }
    
    // 应用筛选条件
    const applyFilter = () => {
      currentPage.value = 1
      loadUsers()
      showFilter.value = false
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.value = {
        role: null,
        status: null
      }
      currentPage.value = 1
      loadUsers()
      showFilter.value = false
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadUsers()
    }

    // 当前页改变
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadUsers()
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      Search,
      searchKeyword,
      currentPage,
      pageSize,
      totalUsers,
      users,
      loadingStates,
      showFilter,
      filterForm,
      currentDate,
      getRoleText,
      getRoleType,
      getStatusText,
      getStatusType,
      formatDateTime,
      loadUsers,
      searchUsers,
      approveUser,
      rejectUser,
      disableUser: disableUserFunc,
      handleSizeChange,
      handleCurrentChange,
      showFilterDialog,
      applyFilter,
      resetFilter
    }
  }
}
</script>

<style scoped>
.user-review-page {
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

.user-info {
  flex: 2;
}

.role-info {
  flex: 1;
}

.contact-info {
  flex: 1.5;
}

.time-info {
  flex: 1;
}

.action-info {
  flex: 2.2;
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-info-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
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

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.user-email {
  color: #333;
  font-size: 13px;
  margin-bottom: 4px;
}

.user-phone {
  color: #666;
  font-size: 12px;
}

.register-time {
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
</style>