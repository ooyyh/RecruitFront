<template>
  <div class="company-review-page">
    <div class="page-header">
      <h1 class="page-title">企业入驻审核</h1>
      <div class="page-subtitle">当前共有 {{ totalCompanies }} 家机构等待资质核验 · {{ currentDate }} 实时更新</div>
    </div>

    <div class="page-controls">
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索机构名称、联系人或关键词..." 
          :prefix-icon="Search"
          @keyup.enter="searchCompanies"
        />
      </div>
      <el-select v-model="filterStatus" placeholder="状态筛选" @change="filterCompanies" clearable>
        <el-option label="待认证" :value="0"></el-option>
        <el-option label="已认证" :value="1"></el-option>
        <el-option label="认证失败" :value="2"></el-option>
      </el-select>
      <el-button class="filter-btn" @click="resetFilter">重置</el-button>
    </div>

    <div class="review-table">
      <div class="table-header">
        <div class="table-row header-row">
          <div class="table-cell basic-info">机构基本信息</div>
          <div class="table-cell industry-info">行业/规模</div>
          <div class="table-cell contact-info">联系人/联系方式</div>
          <div class="table-cell time-info">提交时间</div>
          <div class="table-cell action-info">资质核验操作</div>
        </div>
      </div>

      <div class="table-body">
        <div 
          v-for="company in companies" 
          :key="company.id" 
          class="table-row"
        >
          <div class="table-cell basic-info">
            <div class="company-info">
              <div class="company-logo">{{ company.companyName ? company.companyName.charAt(0).toUpperCase() : '企' }}</div>
              <div class="company-details">
                <div class="company-name">{{ company.companyName }}</div>
                <div class="company-address">{{ company.companyAddress }}</div>
              </div>
            </div>
          </div>
          
          <div class="table-cell industry-info">
            <div class="industry">{{ company.industry || '-' }}</div>
            <div class="scale">{{ company.companySize || '-' }}</div>
          </div>
          
          <div class="table-cell contact-info">
            <div class="contact-person">{{ company.contactPerson }}</div>
            <div class="contact-phone">{{ company.contactPhone }}</div>
          </div>
          
          <div class="table-cell time-info">
            <div class="submit-time">{{ formatDateTime(company.createdAt) }}</div>
          </div>
          
          <div class="table-cell action-info">
            <el-button 
              v-if="company.certificationStatus === 0"
              type="success" 
              size="small"
              :loading="loadingStates[company.id] === 'approve'"
              @click="approveCompany(company.id)"
            >
              通过认证
            </el-button>
            <el-button 
              v-if="company.certificationStatus === 0"
              type="danger"
              plain
              size="small"
              :loading="loadingStates[company.id] === 'reject'"
              @click="rejectCompany(company.id)"
            >
              驳回
            </el-button>
            <el-button 
              type="info" 
              size="small"
              @click="viewCompanyDetails(company.id)"
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
        :total="totalCompanies"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 公司详情对话框 -->
    <el-dialog 
      v-model="showCompanyDetailDialog"
      title="公司详情"
      width="600px"
      :before-close="closeCompanyDetailDialog"
    >
      <div v-if="selectedCompany" class="company-detail-content">
        <div class="company-header">
          <div class="company-logo-large">{{ selectedCompany.companyName ? selectedCompany.companyName.charAt(0).toUpperCase() : '企' }}</div>
          <div class="company-basic-info">
            <h3 class="company-name-detail">{{ selectedCompany.companyName }}</h3>
            <div class="company-status">
              <el-tag :type="getCertificationType(selectedCompany.certificationStatus)">
                {{ getCertificationText(selectedCompany.certificationStatus) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="company-details-grid">
          <div class="detail-item">
            <label class="detail-label">公司地址</label>
            <div class="detail-value">{{ selectedCompany.companyAddress || '未填写' }}</div>
          </div>
          
          <div class="detail-item">
            <label class="detail-label">所属行业</label>
            <div class="detail-value">{{ selectedCompany.industry || '未填写' }}</div>
          </div>
          
          <div class="detail-item">
            <label class="detail-label">公司规模</label>
            <div class="detail-value">{{ selectedCompany.companySize || '未填写' }}</div>
          </div>
          
          <div class="detail-item">
            <label class="detail-label">联系人</label>
            <div class="detail-value">{{ selectedCompany.contactPerson }}</div>
          </div>
          
          <div class="detail-item">
            <label class="detail-label">联系电话</label>
            <div class="detail-value">{{ selectedCompany.contactPhone }}</div>
          </div>
          
          <div class="detail-item full-width">
            <label class="detail-label">公司描述</label>
            <div class="detail-value long-text">{{ selectedCompany.companyDescription || '未填写' }}</div>
          </div>
          
          <div class="detail-item">
            <label class="detail-label">提交时间</label>
            <div class="detail-value">{{ selectedCompany.createdAt || '未知' }}</div>
          </div>
          
          <div class="detail-item" v-if="selectedCompany.certificationTime">
            <label class="detail-label">认证时间</label>
            <div class="detail-value">{{ selectedCompany.certificationTime || '未认证' }}</div>
          </div>
        </div>
      </div>
        <span class="dialog-footer">
          <el-button @click="closeCompanyDetailDialog">关闭</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElInput, ElButton, ElPagination, ElSelect, ElOption, ElDialog, ElDescriptions, ElDescriptionsItem, ElTag, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { getCompanies, reviewCompany, getCompanyDetail } from '@/axios/modules/companyAdmin.js'

export default {
  name: 'CompanyReview',
  components: {
    ElInput,
    ElButton,
    ElPagination,
    ElSelect,
    ElOption,
    ElDialog,
    ElDescriptions,
    ElDescriptionsItem,
    ElTag,
    Icon
  },
  setup() {
    const searchKeyword = ref('')
    const filterStatus = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalCompanies = ref(0)
    
    const companies = ref([])
    const loadingStates = ref({})
    
    // 公司详情对话框相关
    const showCompanyDetailDialog = ref(false)
    const selectedCompany = ref(null)
    
    const currentDate = new Date().toISOString().split('T')[0]

    // 获取认证状态文本
    const getCertificationText = (status) => {
      switch(status) {
        case 0: return '待认证'
        case 1: return '已认证'
        case 2: return '认证失败'
        default: return '未知'
      }
    }

    // 获取认证状态类型
    const getCertificationType = (status) => {
      switch(status) {
        case 0: return 'info'      // 待认证
        case 1: return 'success'   // 已认证
        case 2: return 'danger'    // 认证失败
        default: return 'info'
      }
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }

    // 加载企业列表
    const loadCompanies = async () => {
      try {
        const response = await getCompanies({
          page: currentPage.value,
          size: pageSize.value,
          keyword: searchKeyword.value,
          status: filterStatus.value
        })
        if (response.code === 200) {
          companies.value = response.data || []
          totalCompanies.value = response.data.total || 0
        } else {
          ElMessage.error(response.message || '获取企业列表失败')
        }
      } catch (error) {
        console.error('获取企业列表失败:', error)
        ElMessage.error('获取企业列表失败')
      }
    }

    // 搜索企业
    const searchCompanies = () => {
      currentPage.value = 1
      loadCompanies()
    }

    // 审核通过
    const approveCompany = async (id) => {
      loadingStates.value[id] = 'approve'
      try {
        const response = await reviewCompany(id, { status: 1 })
        if (response.code === 200) {
          ElMessage.success(response.message || '企业认证通过')
          loadCompanies() // 重新加载数据
        } else {
          ElMessage.error(response.message || '认证失败')
        }
      } catch (error) {
        console.error('企业认证失败:', error)
        ElMessage.error('认证失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 驳回企业
    const rejectCompany = async (id) => {
      loadingStates.value[id] = 'reject'
      try {
        const response = await reviewCompany(id, { status: 2 })
        if (response.code === 200) {
          ElMessage.success(response.message || '企业认证已驳回')
          loadCompanies() // 重新加载数据
        } else {
          ElMessage.error(response.message || '驳回失败')
        }
      } catch (error) {
        console.error('企业驳回失败:', error)
        ElMessage.error('驳回失败')
      } finally {
        loadingStates.value[id] = null
      }
    }

    // 查看企业详情
    const viewCompanyDetails = async (id) => {
      try {
        const response = await getCompanyDetail(id)
        if (response.code === 200) {
          selectedCompany.value = response.data
          showCompanyDetailDialog.value = true
        } else {
          ElMessage.error(response.message || '获取企业详情失败')
        }
      } catch (error) {
        console.error('获取企业详情失败:', error)
        ElMessage.error('获取企业详情失败')
      }
    }

    // 关闭企业详情对话框
    const closeCompanyDetailDialog = () => {
      showCompanyDetailDialog.value = false
      selectedCompany.value = null
    }

    // 筛选企业
    const filterCompanies = () => {
      currentPage.value = 1
      loadCompanies()
    }

    // 重置筛选
    const resetFilter = () => {
      searchKeyword.value = ''
      filterStatus.value = null
      currentPage.value = 1
      loadCompanies()
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      loadCompanies()
    }

    // 当前页改变
    const handleCurrentChange = (page) => {
      currentPage.value = page
      loadCompanies()
    }

    onMounted(() => {
      loadCompanies()
    })

    return {
      Search,
      searchKeyword,
      filterStatus,
      currentPage,
      pageSize,
      totalCompanies,
      companies,
      loadingStates,
      showCompanyDetailDialog,
      selectedCompany,
      currentDate,
      getCertificationText,
      getCertificationType,
      formatDateTime,
      loadCompanies,
      searchCompanies,
      approveCompany,
      rejectCompany,
      viewCompanyDetails,
      closeCompanyDetailDialog,
      filterCompanies,
      resetFilter,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.company-review-page {
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
  min-width: 70%;
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

.basic-info {
  flex: 2;
}

.industry-info {
  flex: 1;
}

.contact-info {
  flex: 1.2;
}

.time-info {
  flex: 1;
}

.action-info {
  flex: 1.5;
  display: flex;
  gap: 8px;
  align-items: center;
}

.company-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #1890FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.company-details {
  flex: 1;
}

.company-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.company-address {
  color: #666;
  font-size: 12px;
}

.industry {
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.scale {
  color: #666;
  font-size: 12px;
}

.contact-person {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.contact-phone {
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

/* 公司详情对话框样式 */
:deep(.el-dialog__header) {
  padding: 20px !important;
  border-bottom: 1px solid #eee;
}

.company-detail-content {
  padding: 10px 0;
}

.company-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.company-logo-large {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.company-basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.company-name-detail {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.company-status {
  align-self: flex-start;
}

.company-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-value.long-text {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>