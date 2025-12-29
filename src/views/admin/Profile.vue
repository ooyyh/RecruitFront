<template>
  <div class="admin-profile">
    <div class="profile-header">
      <h1 class="page-title">个人资料</h1>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar">{{ userInitial }}</div>
          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :on-change="handleAvatarChange"
              :auto-upload="false"
            >
              <el-button class="upload-btn" size="small">修改头像</el-button>
            </el-upload>
          </div>
        </div>

        <div class="profile-form">
          <el-form 
            :model="profileForm" 
            :rules="profileRules" 
            ref="profileFormRef"
            label-width="100px"
            class="profile-form-content"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="角色" prop="role">
              <el-input v-model="roleText" disabled />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
            
            <el-form-item label="状态" prop="status">
              <el-tag :type="statusType">{{ statusText }}</el-tag>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="updateProfile"
                :loading="updateLoading"
              >
                更新资料
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElUpload, ElTag } from 'element-plus'
import { getCurrentUser } from '@/utils/auth.js'

export default {
  name: 'AdminProfile',
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElUpload,
    ElTag
  },
  setup() {
    const profileFormRef = ref()
    
    const profileForm = ref({
      username: '',
      email: '',
      phone: '',
      role: 0,
      status: 1
    })
    
    const updateLoading = ref(false)
    
    // 用户初始信息
    const userInitial = computed(() => {
      return profileForm.value.username ? profileForm.value.username.charAt(0).toUpperCase() : '用'
    })
    
    // 角色文本
    const roleText = computed(() => {
      switch(profileForm.value.role) {
        case 0: return '求职者'
        case 1: return '招聘者'
        case 2: return '管理员'
        default: return '用户'
      }
    })
    
    // 状态文本
    const statusText = computed(() => {
      switch(profileForm.value.status) {
        case 0: return '待审核'
        case 1: return '正常'
        case 2: return '禁用'
        default: return '未知'
      }
    })
    
    // 状态类型
    const statusType = computed(() => {
      switch(profileForm.value.status) {
        case 0: return 'warning'
        case 1: return 'success'
        case 2: return 'danger'
        default: return 'info'
      }
    })
    
    // 表单验证规则
    const profileRules = {
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    }
    
    // 获取用户信息
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          profileForm.value = {
            username: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
    
    // 更新资料
    const updateProfile = async () => {
      if (!profileFormRef.value) return
      
      try {
        const valid = await profileFormRef.value.validate()
        if (valid) {
          updateLoading.value = true
          // 这里应该调用更新用户信息的API
          console.log('更新用户资料:', profileForm.value)
          // 模拟API调用
          setTimeout(() => {
            updateLoading.value = false
            ElMessage.success('资料更新成功')
          }, 1000)
        }
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }
    
    // 重置表单
    const resetForm = () => {
      loadUserInfo()
    }
    
    // 处理头像上传
    const handleAvatarChange = (file) => {
      console.log('上传头像:', file)
      // 这里应该处理头像上传逻辑
    }
    
    onMounted(async () => {
      await loadUserInfo()
    })
    
    return {
      profileFormRef,
      profileForm,
      updateLoading,
      userInitial,
      roleText,
      statusText,
      statusType,
      profileRules,
      updateProfile,
      resetForm,
      handleAvatarChange
    }
  }
}
</script>

<style scoped>
.admin-profile {
  background-color: #f5f5f5;
  padding: 0;
}

.profile-header {
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
  margin: 0;
}

.profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
  border: 1px solid #eee;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #1890FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.avatar-upload {
  text-align: center;
}

.upload-btn {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #666;
}

.upload-btn:hover {
  background-color: #e6f7ff;
  border-color: #1890FF;
  color: #1890FF;
}

.profile-form {
  width: 100%;
  max-width: 500px;
}

.profile-form-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.profile-form-content :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.profile-form-content :deep(.el-button) {
  border-radius: 4px;
}

.profile-form-content :deep(.el-button--primary) {
  background-color: #1890FF;
  border-color: #1890FF;
}

.profile-form-content :deep(.el-button--primary:hover) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}
</style>