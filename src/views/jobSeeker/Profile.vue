<template>
  <div class="profile-content">
    <div class="profile-header">
      <h2>个人信息</h2>
    </div>

    <el-card class="profile-card">
      <el-form :model="userInfo" label-width="120px" class="profile-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.name" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在地区">
              <el-cascader
                v-model="userInfo.location"
                :options="cityOptions"
                placeholder="请选择所在地区"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期望职位">
              <el-input v-model="userInfo.jobTitle" placeholder="请输入期望职位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作经验">
              <el-select v-model="userInfo.experience" placeholder="请选择工作经验" style="width: 100%">
                <el-option label="应届毕业生" value="应届毕业生"></el-option>
                <el-option label="1年以下" value="1年以下"></el-option>
                <el-option label="1-3年" value="1-3年"></el-option>
                <el-option label="3-5年" value="3-5年"></el-option>
                <el-option label="5-10年" value="5-10年"></el-option>
                <el-option label="10年以上" value="10年以上"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="个人优势">
          <el-input
            v-model="userInfo.advantage"
            type="textarea"
            :rows="4"
            placeholder="请输入个人优势，如技能特长、项目经验等"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存信息</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from '@/utils/auth.js';
import { getUserInfo } from '@/axios/modules/user.js';

export default {
  name: 'JobSeekerProfile',
  setup() {
    const userInfo = ref({
      name: '',
      email: '',
      phone: '',
      location: '',
      jobTitle: '',
      experience: '',
      advantage: ''
    });
    
    // 城市选项数据
    const cityOptions = ref([
      {
        value: 'beijing',
        label: '北京',
        children: [
          { value: 'haidian', label: '海淀区' },
          { value: 'chaoyang', label: '朝阳区' }
        ]
      },
      {
        value: 'shanghai',
        label: '上海',
        children: [
          { value: 'pudong', label: '浦东新区' },
          { value: 'jingan', label: '静安区' }
        ]
      },
      {
        value: 'guangzhou',
        label: '广州',
        children: [
          { value: 'tianhe', label: '天河区' },
          { value: 'yuexiu', label: '越秀区' }
        ]
      },
      {
        value: 'shenzhen',
        label: '深圳',
        children: [
          { value: 'nanshan', label: '南山区' },
          { value: 'futian', label: '福田区' }
        ]
      }
    ]);

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
              email: data.email || '',
              phone: data.phone || '',
              location: data.location || '',
              jobTitle: data.jobTitle || '',
              experience: data.experience || '',
              advantage: data.advantage || ''
            };
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    // 保存信息
    const saveProfile = async () => {
      try {
        // 由于后端没有提供更新用户信息的API，目前仅做本地模拟
        ElMessage.success('个人信息更新成功');
      } catch (error) {
        console.error('保存信息失败:', error);
        ElMessage.error('保存信息失败');
      }
    };

    // 重置表单
    const resetForm = () => {
      fetchUserInfo();
    };

    onMounted(() => {
      fetchUserInfo();
    });

    return {
      userInfo,
      cityOptions,
      saveProfile,
      resetForm
    };
  }
};
</script>

<style scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.profile-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.profile-card {
  background-color: white;
}

.profile-form {
  padding: 20px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>