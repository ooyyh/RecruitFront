<template>
  <div class="recruiter-profile-page">
    <div class="page-header">
      <h1 class="page-title">机构信息修改</h1>
      <div class="page-subtitle">完善的信息将提高 40% 的职位转化率 · 最后更新于 {{ currentDate }}</div>
    </div>

    <div class="profile-form-container">
      <el-form 
        :model="profileForm" 
        :rules="profileRules" 
        ref="profileFormRef"
        label-width="120px"
        class="profile-form"
      >
        <div class="form-section">
          <h3 class="section-title">基础机构资料</h3>
          
          <div class="org-basic-info">
            <!-- <div class="logo-upload-section">
              <div class="logo-preview">
                <div class="logo-placeholder">
                  <Icon icon="ri:building-line" class="logo-icon" />
                </div>
                <p class="logo-text">机构Logo</p>
              </div>
              <el-upload
                class="logo-uploader"
                action="#"
                :show-file-list="false"
                :on-change="handleLogoChange"
                :auto-upload="false"
              >
                <el-button size="small" class="upload-btn">上传Logo</el-button>
              </el-upload>
            </div> -->

            <div class="org-basic-fields">
              <el-form-item label="机构全称 *" prop="companyName">
                <el-input 
                  v-model="profileForm.companyName" 
                  placeholder="请输入机构全称"
                />
              </el-form-item>

              <el-form-item label="所属行业" prop="industry">
                <el-input 
                  v-model="profileForm.industry" 
                  placeholder="请输入所属行业"
                />
              </el-form-item>

              <el-form-item label="人员规模" prop="companySize">
                <el-select 
                  v-model="profileForm.companySize" 
                  placeholder="请选择人员规模"
                  style="width: 100%"
                >
                  <el-option label="少于10人" value="少于10人" />
                  <el-option label="10-49人" value="10-49人" />
                  <el-option label="50-99人" value="50-99人" />
                  <el-option label="100-499人" value="100-499人" />
                  <el-option label="500-999人" value="500-999人" />
                  <el-option label="1000人以上" value="1000人以上" />
                </el-select>
              </el-form-item>

              <el-form-item label="联系人" prop="contactPerson">
                <el-input 
                  v-model="profileForm.contactPerson" 
                  placeholder="请输入联系人姓名"
                />
              </el-form-item>

              <el-form-item label="联系电话" prop="contactPhone">
                <el-input 
                  v-model="profileForm.contactPhone" 
                  placeholder="请输入联系电话"
                />
              </el-form-item>

              <el-form-item label="公司地址" prop="companyAddress">
                <el-input 
                  v-model="profileForm.companyAddress" 
                  placeholder="请输入公司地址"
                />
              </el-form-item>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">机构详情描述</h3>
          
          <el-form-item label="一句话介绍">
            <el-input 
              v-model="profileForm.companyDescription" 
              placeholder="例如：重塑职场与人才的连接方式"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="关于我们">
            <el-input 
              v-model="profileForm.companyDescription"
              :autosize="{ minRows: 6, maxRows: 12 }"
              type="textarea"
              placeholder="详细说明公司愿景、核心业务及企业文化..."
            />
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">认证状态</h3>
          <div class="certification-section">
            <div class="certification-status" v-if="companyInfo && companyInfo.certificationStatus !== null">
              <Icon 
                :icon="getCertificationIcon()" 
                :class="['cert-icon', getCertificationClass()]" 
              />
              <span :class="['cert-text', getCertificationClass()]">
                {{ getCertificationText() }}
              </span>
            </div>
            <p class="cert-desc" v-if="companyInfo && companyInfo.certificationStatus !== null">
              {{ getCertificationDesc() }}
            </p>
            <div class="submit-section" v-if="showSubmitButton">
              <el-button 
                type="primary" 
                size="large" 
                @click="submitForCertification"
                :loading="submitting"
              >
                提交给管理员认证
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
      
      <div class="form-actions" v-if="!showSubmitButton">
        <el-button 
          type="primary" 
          @click="updateProfile"
          :loading="submitting"
        >
          更新信息
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElUpload, ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { getCurrentUser } from '@/utils/auth.js'
import { getCompanyInfo, saveCompanyInfo } from '@/axios/modules/company.js'

export default {
  name: 'RecruiterProfile',
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElButton,
    ElUpload,
    Icon
  },
  setup() {
    const profileFormRef = ref()
    const submitting = ref(false)
    
    const profileForm = reactive({
      companyName: '',
      industry: '',
      companySize: '',
      contactPerson: '',
      contactPhone: '',
      companyAddress: '',
      companyDescription: ''
    })
    
    const companyInfo = ref(null)
    const showSubmitButton = ref(false) // 控制显示提交认证按钮还是更新按钮
    
    const currentDate = new Date().toISOString().split('T')[0]
    
    // 获取认证状态文本
    const getCertificationText = () => {
      if (!companyInfo.value) return '未认证'
      switch(companyInfo.value.certificationStatus) {
        case 0: return '待认证'
        case 1: return '已认证'
        case 2: return '认证失败'
        default: return '未认证'
      }
    }
    
    // 获取认证状态图标
    const getCertificationIcon = () => {
      if (!companyInfo.value) return 'ri:shield-line'
      switch(companyInfo.value.certificationStatus) {
        case 0: return 'ri:shield-star-line' // 待认证
        case 1: return 'ri:shield-check-line' // 已认证
        case 2: return 'ri:shield-cross-line' // 认证失败
        default: return 'ri:shield-line'
      }
    }
    
    // 获取认证状态样式类
    const getCertificationClass = () => {
      if (!companyInfo.value) return 'cert-not-certified'
      switch(companyInfo.value.certificationStatus) {
        case 0: return 'cert-pending' // 待认证
        case 1: return 'cert-success' // 已认证
        case 2: return 'cert-failed' // 认证失败
        default: return 'cert-not-certified'
      }
    }
    
    // 获取认证描述
    const getCertificationDesc = () => {
      if (!companyInfo.value) return '请填写企业信息并提交认证'
      switch(companyInfo.value.certificationStatus) {
        case 0: return '企业信息已提交，请等待平台审核'
        case 1: return '您的企业已通过平台认证，享有更多招聘权益'
        case 2: return '企业认证未通过，请修改信息后重新提交'
        default: return '请填写企业信息并提交认证'
      }
    }
    
    // 表单验证规则
    const profileRules = {
      companyName: [
        { required: true, message: '请输入机构全称', trigger: 'blur' },
        { min: 2, max: 50, message: '机构全称长度应在2-50个字符之间', trigger: 'blur' }
      ],
      industry: [
        { required: true, message: '请输入所属行业', trigger: 'blur' }
      ],
      companySize: [
        { required: true, message: '请选择人员规模', trigger: 'change' }
      ],
      contactPerson: [
        { required: true, message: '请输入联系人姓名', trigger: 'blur' }
      ],
      contactPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      companyAddress: [
        { required: true, message: '请输入公司地址', trigger: 'blur' }
      ]
    }
    
    // 处理Logo上传
    const handleLogoChange = (file) => {
      console.log('上传Logo:', file)
      // 这里应该处理Logo上传逻辑
    }
    
    // 加载公司信息
    const loadCompanyInfo = async () => {
      try {
        const response = await getCompanyInfo()
        if (response.code === 200) {
          companyInfo.value = response.data
          if (response.data) {
            // 填充表单数据
            Object.assign(profileForm, {
              companyName: response.data.companyName || '',
              industry: response.data.industry || '',
              companySize: response.data.companySize || '',
              contactPerson: response.data.contactPerson || '',
              contactPhone: response.data.contactPhone || '',
              companyAddress: response.data.companyAddress || '',
              companyDescription: response.data.companyDescription || ''
            })
            
            // 根据认证状态决定是否显示提交按钮
            showSubmitButton.value = response.data.certificationStatus === 0 || response.data.certificationStatus === 2
          }
        } else {
          ElMessage.error(response.message || '获取企业信息失败')
        }
      } catch (error) {
        console.error('获取企业信息失败:', error)
        ElMessage.error('获取企业信息失败')
      }
    }
    
    // 提交认证申请
    const submitForCertification = async () => {
      if (!profileFormRef.value) return
      
      try {
        const valid = await profileFormRef.value.validate()
        if (valid) {
          submitting.value = true
          
          const response = await saveCompanyInfo({
            ...profileForm
          })
          
          if (response.code === 200) {
            ElMessage.success(response.message || '企业信息提交成功，请等待审核')
            await loadCompanyInfo() // 重新加载信息
          } else {
            ElMessage.error(response.message || '提交失败')
          }
        }
      } catch (error) {
        console.error('表单验证失败或提交失败:', error)
        ElMessage.error('提交失败，请检查表单信息')
      } finally {
        submitting.value = false
      }
    }
    
    // 更新企业信息（已认证情况下）
    const updateProfile = async () => {
      if (!profileFormRef.value) return
      
      try {
        const valid = await profileFormRef.value.validate()
        if (valid) {
          submitting.value = true
          
          const response = await saveCompanyInfo({
            ...profileForm
          })
          
          if (response.code === 200) {
            ElMessage.success(response.message || '企业信息更新成功')
            await loadCompanyInfo() // 重新加载信息
          } else {
            ElMessage.error(response.message || '更新失败')
          }
        }
      } catch (error) {
        console.error('表单验证失败或更新失败:', error)
        ElMessage.error('更新失败，请检查表单信息')
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(async () => {
      await loadCompanyInfo()
    })
    
    return {
      profileFormRef,
      profileForm,
      companyInfo,
      showSubmitButton,
      submitting,
      currentDate,
      profileRules,
      handleLogoChange,
      submitForCertification,
      updateProfile,
      getCertificationText,
      getCertificationIcon,
      getCertificationClass,
      getCertificationDesc
    }
  }
}
</script>

<style scoped>
.recruiter-profile-page {
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.profile-form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
  border: 1px solid #eee;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:not(:last-child) {
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.org-basic-info {
  display: flex;
  gap: 40px;
}

.logo-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.logo-preview {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
  color: white;
}

.logo-text {
  color: #666;
  font-size: 12px;
  margin: 0;
}

.upload-btn {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #666;
  border-radius: 4px;
}

.upload-btn:hover {
  background-color: #e6f7ff;
  border-color: #1890FF;
  color: #1890FF;
}

.org-basic-fields {
  flex: 1;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.profile-form :deep(.el-input__wrapper),
.profile-form :deep(.el-textarea__inner),
.profile-form :deep(.el-select__wrapper) {
  border-radius: 4px;
}

.certification-section {
  padding: 16px;
  border-radius: 4px;
}

.certification-section.pending {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.certification-section.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.certification-section.failed {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.certification-section.not-certified {
  background-color: #f9f9f9;
  border: 1px solid #d9d9d9;
}

.certification-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cert-icon {
  font-size: 20px;
}

.cert-text {
  font-weight: 500;
  font-size: 14px;
}

.cert-pending {
  color: #faad14;
}

.cert-success {
  color: #52c41a;
}

.cert-failed {
  color: #ff4d4f;
}

.cert-not-certified {
  color: #8c8c8c;
}

.cert-desc {
  color: #666;
  font-size: 12px;
  margin: 0 0 16px 0;
}

.submit-section {
  margin-top: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
</style>