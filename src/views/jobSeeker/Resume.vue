<template>
  <div class="resume-content">
    <div class="center-header">
      <h2>{{ isEditing ? '编辑简历' : '在线简历预览' }}</h2>
      <div class="btn-group">
        <el-button v-if="!isEditing" @click="editResume">编辑内容</el-button>
        <el-button v-if="isEditing" type="primary" @click="saveResume">保存</el-button>
        <el-button v-if="isEditing" @click="cancelEdit">取消</el-button>
        <el-button @click="exportResume">导出 PDF</el-button>
      </div>
    </div>

    <div v-if="!isEditing">
      <!-- 预览模式 -->
      <div class="resume-header">
        <div>
          <div class="resume-name">{{ resumeData.realName || '求职者姓名' }}</div>
          <div class="resume-meta">
            {{ getGenderText(resumeData.gender) }} · {{ resumeData.education || '学历未填写' }} · {{ resumeData.major || '专业未填写' }}<br>
            {{ userInfo.phone || '暂未填写' }} · {{ userInfo.email || '暂未填写' }}
          </div>
        </div>
        <div class="resume-photo" v-if="resumeData.photo">
          <img :src="getPhotoUrl(resumeData.photo)" :alt="resumeData.realName || '简历照片'" class="photo-img">
        </div>
        <div class="resume-photo" v-else>
          <span>{{ resumeData.realName ? resumeData.realName.charAt(0).toUpperCase() : 'U' }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">教育经历</div>
        <div class="section-content">
          {{ resumeData.educationExperience || '暂未填写教育经历' }}
        </div>
      </div>

      <div class="section">
        <div class="section-title">工作经历</div>
        <div class="section-content">
          {{ resumeData.workExperience || '暂未填写工作经历' }}
        </div>
      </div>

      <div class="section">
        <div class="section-title">技能特长</div>
        <div class="section-content">
          {{ resumeData.skills || '暂未填写技能特长' }}
        </div>
      </div>
    </div>

    <div v-else>
      <!-- 编辑模式 -->
      <el-form :model="resumeData" label-width="120px" class="resume-edit-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名">
              <el-input v-model="resumeData.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="resumeData.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" :value="1"></el-option>
                <el-option label="女" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker
                v-model="resumeData.birthDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历">
              <el-select v-model="resumeData.education" placeholder="请选择学历" style="width: 100%">
                <el-option label="高中及以下" value="高中及以下"></el-option>
                <el-option label="大专" value="大专"></el-option>
                <el-option label="本科" value="本科"></el-option>
                <el-option label="硕士" value="硕士"></el-option>
                <el-option label="博士" value="博士"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="个人照片">
              <div class="photo-upload">
                <div class="photo-preview" v-if="resumeData.photo">
                  <img :src="getPhotoUrl(resumeData.photo)" :alt="resumeData.realName || '简历照片'" class="preview-img">
                  <el-button @click="removePhoto" size="small" class="remove-btn">X</el-button>
                </div>
                <div class="upload-area" @click="triggerPhotoUpload" v-else>
                  <input 
                    ref="photoInputRef"
                    type="file" 
                    accept="image/*" 
                    @change="handlePhotoUpload" 
                    style="display: none"
                  />
                  <div class="upload-content">
                    <el-icon><Upload /></el-icon>
                    <p>点击上传照片</p>
                    <p class="upload-hint">支持 JPG/PNG 格式，大小不超过5MB</p>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="专业">
          <el-input v-model="resumeData.major" placeholder="请输入专业" />
        </el-form-item>
        
        <el-form-item label="教育经历">
          <el-input
            v-model="resumeData.educationExperience"
            type="textarea"
            :rows="4"
            placeholder="请输入教育经历，如：2016.09 - 2020.06 中山大学 计算机科学与技术"
          />
        </el-form-item>
        
        <el-form-item label="工作经历">
          <el-input
            v-model="resumeData.workExperience"
            type="textarea"
            :rows="6"
            placeholder="请输入工作经历，如：2020.07 - 至今 智聘科技 高级前端开发工程师，负责公司核心产品的前端开发工作..."
          />
        </el-form-item>
        
        <el-form-item label="技能特长">
          <el-input
            v-model="resumeData.skills"
            type="textarea"
            :rows="4"
            placeholder="请输入技能特长，如：熟练掌握Vue.js、React、JavaScript等前端技术..."
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 右侧附件和AI分析 - 添加为独立的悬浮卡片 -->
    <!-- <div class="right-panel">
      <div class="card">
        <h3 class="card-title">附件简历</h3>
        <div class="upload-box" @click="triggerFileUpload">
          <input 
            ref="fileInputRef"
            type="file" 
            accept=".pdf,.doc,.docx" 
            @change="handleFileUpload" 
            style="display: none"
          />
          上传附件简历<br>
          <small>支持 PDF / Word（≤10MB）</small>
        </div>
        <div 
          class="file-item" 
          v-for="(file, index) in uploadedFiles" 
          :key="index"
        >
          <span>{{ file.name }}</span>
          <span>{{ file.size }}</span>
        </div>
      </div>

      <div class="ai-card">
        <h3>AI 简历分析</h3>
        <p class="ai-content">
          您的简历匹配度高于 85% 的候选人，
          建议补充"大模型应用"相关项目经验。
        </p>
        <el-button type="primary" class="ai-btn">查看详细报告</el-button>
      </div>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from '@/utils/auth.js';
import { getUserInfo } from '@/axios/modules/user.js';
import { getMyResume, saveResume as saveResumeAPI, deleteResume } from '@/axios/modules/resume.js';
import { uploadResumePhoto } from '@/axios/modules/file.js';
import { ElMessage } from 'element-plus';

export default {
  name: 'JobSeekerResume',
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
    
    const resumeData = ref({
      realName: '',
      gender: null,
      birthDate: null,
      education: '',
      major: '',
      photo: '',
      educationExperience: '',
      workExperience: '',
      skills: ''
    });
    
    const isEditing = ref(false);
    
    const uploadedFiles = ref([
      {
        name: '李明辉-个人简历-2025.pdf',
        size: '2.4 MB',
        uploadTime: '2025-12-21'
      },
      {
        name: '旧版简历-2023.docx',
        size: '1.1 MB',
        uploadTime: '2023-05-12'
      }
    ]);
    
    const fileInputRef = ref(null);
    const photoInputRef = ref(null);

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

    // 获取简历信息
    const fetchResume = async () => {
      try {
        const response = await getMyResume();
        if (response.code === 200) {
          if (response.data) {
            resumeData.value = {
              ...response.data,
              birthDate: response.data.birthDate ? new Date(response.data.birthDate) : null
            };
          } else {
            // 如果没有简历数据，初始化为空值
            resumeData.value = {
              realName: '',
              gender: null,
              birthDate: null,
              education: '',
              major: '',
              photo: '',
              educationExperience: '',
              workExperience: '',
              skills: ''
            };
          }
        } else {
          console.error('获取简历失败:', response.message);
        }
      } catch (error) {
        console.error('获取简历失败:', error);
      }
    };

    // 编辑简历
    const editResume = () => {
      isEditing.value = true;
    };

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
    
    // 保存简历
    const saveResume = async () => {
      try {
        const payload = {
          ...resumeData.value,
          birthDate: resumeData.value.birthDate ? new Date(resumeData.value.birthDate).toISOString().split('T')[0] : null
        };
        
        const response = await saveResumeAPI(payload);
        if (response.code === 200) {
          ElMessage.success(response.message || '简历保存成功');
          isEditing.value = false;
        } else {
          ElMessage.error(response.message || '简历保存失败');
        }
      } catch (error) {
        console.error('保存简历失败:', error);
        ElMessage.error('保存简历失败');
      }
    };

    // 取消编辑
    const cancelEdit = () => {
      isEditing.value = false;
      // 重新获取原始数据以取消更改
      fetchResume();
    };

    // 导出简历为PDF
    const exportResume = async () => {
      try {
        // 延迟执行以确保页面渲染完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 导入库
        const jsPDF = (await import('jspdf')).default;
        const html2canvas = (await import('html2canvas')).default;
        
        // 获取简历预览内容
        const element = document.querySelector('.resume-header, .section') || document.querySelector('.resume-content');
        if (!element) {
          ElMessage.error('无法找到简历内容');
          return;
        }
        
        // 截取页面为图片
        const canvas = await html2canvas(element, {
          scale: 2, // 提高清晰度
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 如果内容超出一页，添加新页
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // 添加简历标题
        pdf.setFontSize(20);
        pdf.text(resumeData.value.realName || '我的简历', 105, 20, null, null, 'center');
        
        // 保存PDF
        pdf.save('我的简历.pdf');
        ElMessage.success('简历导出成功');
      } catch (error) {
        console.error('导出PDF失败:', error);
        ElMessage.error('导出PDF失败');
      }
    };

    // 触发文件上传
    const triggerFileUpload = () => {
      fileInputRef.value.click();
    };

    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // 这里实际应该上传文件到服务器
        ElMessage.success('文件上传模拟成功');
        console.log('上传文件:', file.name);
      }
    };

    // 触发照片上传
    const triggerPhotoUpload = () => {
      photoInputRef.value.click();
    };

    // 处理照片上传
    const handlePhotoUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          ElMessage.error('请上传JPG或PNG格式的图片');
          return;
        }

        // 验证文件大小 (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          ElMessage.error('图片大小不能超过5MB');
          return;
        }

        try {
          // 上传照片到服务器
          const response = await uploadResumePhoto(file);
          if (response.code === 200) {
            // 更新简历数据中的照片路径
            resumeData.value.photo = response.data;
            ElMessage.success('照片上传成功');
          } else {
            ElMessage.error(response.message || '照片上传失败');
          }
        } catch (error) {
          console.error('上传照片失败:', error);
          ElMessage.error('照片上传失败，请重试');
        }
      }
    };

    // 移除照片
    const removePhoto = () => {
      resumeData.value.photo = null;
      ElMessage.info('照片已移除');
    };

    // 获取性别文本
    const getGenderText = (gender) => {
      if (gender === 1) return '男';
      if (gender === 0) return '女';
      return '';
    };

    onMounted(async () => {
      await fetchUserInfo();
      await fetchResume();
    });

    return {
      userInfo,
      resumeData,
      isEditing,
      uploadedFiles,
      fileInputRef,
      photoInputRef,
      editResume,
      saveResume,
      cancelEdit,
      exportResume,
      triggerFileUpload,
      handleFileUpload,
      triggerPhotoUpload,
      handlePhotoUpload,
      removePhoto,
      getPhotoUrl,
      getGenderText
    };
  }
};
</script>

<style scoped>
.resume-content {
  position: relative;
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.center-header h2 {
  font-size: 18px;
  margin: 0;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.resume-name {
  font-size: 22px;
  font-weight: bold;
}

.resume-meta {
  font-size: 14px;
  color: #6b7280;
  margin-top: 6px;
}

.resume-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section {
  margin-bottom: 25px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 10px;
  position: relative;
  padding-left: 10px;
  font-size: 16px;
  color: #303133;
}

.section-title::before {
  content: "";
  width: 3px;
  height: 14px;
  background: #409eff;
  position: absolute;
  left: 0;
  top: 4px;
}

.section-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
}

.skill-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.resume-edit-form {
  padding: 20px 0;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-preview {
  position: relative;
  display: inline-block;
}

.preview-img {
  width: 80px;
  height: 80px;
  border-radius: 5%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  border-radius: 50%;
  padding: 2px;
  width: 20px;
  height: 20px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  text-align: center;
  padding: 20px;
  color: #6b7280;
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-content .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 5px;
}

/* ========== 右侧悬浮面板 ========== */
.right-panel {
  position: absolute;
  right: -36%;
  top: -20px;
  width: 30%;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  margin-bottom: 10px;
}

.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  text-align: center;
  padding: 30px 10px;
  color: #6b7280;
  margin-bottom: 15px;
  cursor: pointer;
}

.upload-box:hover {
  border-color: #409eff;
  color: #409eff;
}

.file-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
  color: #374151;
}

.ai-card {
  background: linear-gradient(135deg, #409eff, #4a9eff);
  color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.ai-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.ai-content {
  margin-top: 10px;
  font-size: 14px;
}

.ai-btn {
  width: 100%;
  margin-top: 15px;
  background: #fff;
  color: #409eff;
  font-weight: bold;
  border: none;
}

.ai-btn:hover {
  background: #f0f9ff;
}

@media (max-width: 1280px) {
  .right-panel {
    position: static;
    margin-top: 30px;
    width: 100%;
  }
}
</style>