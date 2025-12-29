<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">用户登录</h2>
      <el-form 
        :model="loginForm" 
        :rules="loginRules" 
        ref="loginFormRef"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="register-link">
          <span>还没有账号？</span>
          <el-button type="text" @click="goToRegister">立即注册</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userLogin } from '@/axios/modules/user.js';
import { getCurrentUser } from '@/utils/auth.js';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const loginFormRef = ref();
    
    const loginForm = ref({
      username: '',
      password: ''
    });
    
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ]
    };
    
    const loading = ref(false);
    
    // 登录处理
    const handleLogin = async () => {
      // 验证表单
      if (!loginFormRef.value) return;
      
      const valid = await loginFormRef.value.validate().catch(() => false);
      if (!valid) return;
      
      loading.value = true;
      
      try {
        const response = await userLogin(loginForm.value);
        localStorage.setItem('token', response.data);
        
        // 登录成功后获取用户信息并存储
        try {
          const user = await getCurrentUser();
          if (user) {
            // 存储用户ID和角色信息
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userType', user.role);
          }
        } catch (userInfoError) {
          console.error('获取用户信息失败:', userInfoError);
          // 即使获取用户信息失败，也继续跳转
        }
        
        ElMessage.success('登录成功');
        router.push('/'); // 登录成功后跳转到首页
      } catch (error) {
        console.error('登录错误:', error);
        // 错误信息已经在axios拦截器中处理了
      } finally {
        loading.value = false;
      }
    };
    
    const goToRegister = () => {
      router.push('/register');
    };
    
    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin,
      goToRegister
    };
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 450px;
  padding: 30px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}

.register-link .el-button {
  margin-left: 5px;
}
</style>