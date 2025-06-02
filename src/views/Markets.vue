<template>
  <div class="markets">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="left">
        <img src="/square-conf.png" alt="公司logo" class="company-logo" >
      </div>
      <div class="right">
        <el-button class="delete-btn" type="danger" plain @click="handleDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
        <el-button class="help-btn" @click="showHelpDialog">
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
        <div class="avatar">
          <el-avatar :size="40" :src="adminAvatar" />
        </div>
      </div>
    </div>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-bar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商家名称"
          clearable
          @input="handleSearch"
        >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        </el-input>
      </div>
      <el-button class="import-btn" @click="showBatchImportDialog">批量导入</el-button>
    </div> 
      <!-- 商家九宫格 -->
    <div class="markets-grid">
      <template v-for="(market, index) in displayedMarkets" :key="market ? market.id : index">
        <!-- 实际的市场卡片 -->
        <div v-if="market"
          class="grid-item" 
          :class="{ 'selected': selectedMarkets.includes(market.id) }"
          @click="toggleMarketSelection(market.id)"
          @settings="handleSettings(market)"
          @import="handleImport"
        >
          <market-card 
            :market="market"
            @click="handleMarketClick(market)"
            @update="fetchMarkets"
          />
        </div>
        <!-- 空白占位符 -->
        <div v-else class="grid-item placeholder">
          <div class="placeholder-content">
            <el-icon><Box /></el-icon>
            <span>空白格子</span>
          </div>
        </div>
      </template>
      <!-- 添加按钮 -->
      <div class="grid-item add-item" @click="showAddDialog">
        <el-icon class="add-icon"><Plus /></el-icon>
        <span>添加商家</span>
      </div>
    </div>
    <!-- 导入商家弹窗 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入商家"

      
    >
    </el-dialog>
    <!-- 设置商家弹窗 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="设置商家"
      
    >
      <el-form :model="currentMarket" label-width="120px">
        <el-form-item label="商家名称">
          <el-input v-model="currentMarket.marketName" />
        </el-form-item>
        <el-form-item label="商家电话">
          <el-input v-model="currentMarket.phone" />
        </el-form-item>
        <el-form-item label="商家地址">
          <el-input v-model="currentMarket.address" />
        </el-form-item>
        <el-form-item label="商家邮箱">
          <el-input v-model="currentMarket.email" />
        </el-form-item>
        <div class="upload-area">
        <el-upload
          class="uploader"
          :action="uploadUrl"
          :headers="headers"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
        </el-upload>
          
      </div>
      </el-form>
    </el-dialog>    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="batchImportVisible"
      title="选择导入类型"
      width="500px"
      center
      destroy-on-close
      :close-on-click-modal="false"
      class="dialog-import"
    >
      <div class="import-options">
        <el-radio-group v-model="importType">
          <el-radio :label="0">新增公司</el-radio>
          <el-radio :label="1">初始化库存</el-radio>
        </el-radio-group>
      </div>
      <div class="upload-area">
        <el-upload
          class="uploader"
          :action="uploadUrl"
          :headers="headers"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          
        
        </el-upload>
      </div>
    </el-dialog>

    <!-- 帮助说明弹窗 -->
    <el-dialog
      v-model="helpVisible"
      title="使用说明"
      width="30%"
    >
      <div class="help-content">
        <h4>操作说明：</h4>
        <ul>
          <li>点击商家卡片可以查看详细信息</li>
          <li>点击设置图标可以修改商家信息</li>
          <li>选中商家后点击顶部垃圾桶图标可以删除商家</li>
          <li>点击右下角加号可以添加新商家</li>
          <li>批量导入支持Excel文件上传</li>
        </ul>
      </div>
    </el-dialog>    <!-- 商家详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentMarket?.marketName"
      :custom-class="'detail-dialog'"
      :close-on-click-modal="false"
      @close="currentMarket = null"
    >
      <market-card 
        v-if="currentMarket"
        :market="currentMarket"
        :expanded="true"
        @update="fetchMarkets"
      />
    </el-dialog>

    <!-- 新增商家弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新建公司"
      width="30%"
    >
      <market-form @submit="handleAddSubmit" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarketCard from '../components/MarketCard.vue'
import MarketForm from '../components/MarketForm.vue'
import { Delete, QuestionFilled, Search, Box, Plus, Upload } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据
const mockMarkets = [
  {
    id: 1,
    marketName: '新鲜优选超市',
    phone: '010-12345678',
    email: 'xinxian@example.com',
    address: '北京市海淀区中关村大街1号',
    goodsCount: 156,
    staffCount: 12,
    hasWarning: true,
    hasFeedback: false,
    lastUpdate: '2025-05-29 08:30:00'
  },
  {
    id: 2,
    marketName: '品质生活店',
    phone: '010-87654321',
    email: 'pinzhi@example.com',
    address: '北京市朝阳区建国路2号',
    goodsCount: 98,
    staffCount: 8,
    hasWarning: false,
    hasFeedback: true,
    lastUpdate: '2025-05-29 09:15:00'
  },
  {
    id: 3,
    marketName: '快乐便利店',
    phone: '010-11223344',
    email: 'happy@example.com',
    address: '北京市西城区西长安街3号',
    goodsCount: 76,
    staffCount: 5,
    hasWarning: true,
    hasFeedback: true,
    lastUpdate: '2025-05-29 10:00:00'
  },
  {
    id: 4,
    marketName: '社区优选',
    phone: '010-44332211',
    email: 'community@example.com',
    address: '北京市东城区东四十条4号',
    goodsCount: 120,
    staffCount: 10,
    hasWarning: false,
    hasFeedback: false,
    lastUpdate: '2025-05-29 11:30:00'
  }
]

// 状态
const markets = ref(mockMarkets)
const searchQuery = ref('')
const selectedMarkets = ref([])
const batchImportVisible = ref(false)
const helpVisible = ref(false)
const importType = ref(0)
const adminAvatar = ref('/square-logo.png')
const currentMarket = ref(null)
const showSettingsDialog = ref(false)
const showImportDialog = ref(false)

const handleSettings = (market) => {
  currentMarket.value = market
  showSettingsDialog.value = true
  console.log('收到的市场数据：', market)
}
const handleImport = () => {
  showImportDialog.value = true
}
// 计算属性：显示的市场列表
const displayedMarkets = computed(() => {
  let filtered = markets.value
  if (searchQuery.value) {
    filtered = filtered.filter(market => 
      market.marketName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      market.address.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 确保总是显示9个格子（包括空白格子）
  const result = [...filtered]
  while (result.length < 8) { // 8个格子 + 1个添加按钮
    result.push(null) // 空白格子
  }
  return result
})

// 商家点击处理
const handleMarketClick = (market) => {
  router.push(`/market/${market.id}`)
}

// 商家选择
const toggleMarketSelection = (marketId) => {
  const index = selectedMarkets.value.indexOf(marketId)
  if (index === -1) {
    selectedMarkets.value.push(marketId)
  } else {
    selectedMarkets.value.splice(index, 1)
  }
}

// 处理删除
const handleDelete = async () => {
  if (selectedMarkets.value.length === 0) {
    ElMessage.warning('请先选择要删除的商家')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedMarkets.value.length}个商家吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除操作
    markets.value = markets.value.filter(market => 
      !selectedMarkets.value.includes(market.id)
    )
    selectedMarkets.value = []
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 显示弹窗
const showBatchImportDialog = () => {
  batchImportVisible.value = true
}
const showHelpDialog = () => {
  helpVisible.value = true
}

const showAddDialog = () => {
  ElMessage.info('演示模式：添加商家功能需要后端支持')
}

// 搜索处理
const handleSearch = () => {
  // 搜索已经通过计算属性实现
}

// 上传相关
const uploadUrl = 'http://localhost:8080/api/market/import'
const headers = {
  Authorization: localStorage.getItem('token')
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件！')
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('导入成功')
    batchImportVisible.value = false
    // 刷新数据
    fetchMarkets()
  } else {
    ElMessage.error(response.msg || '导入失败')
  }
}

// 获取商家列表
const fetchMarkets = async () => {
  if (!localStorage.getItem('token')) {
    // 使用模拟数据
    markets.value = mockMarkets
    return
  }

  try {
    const response = await fetch('http://localhost:8080/api/admin/market', {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    const data = await response.json()
    if (data.code === 0) {
      markets.value = data.data.marketList
    }
  } catch (error) {
    console.error('获取商家列表失败:', error)
    // 使用模拟数据作为后备
    markets.value = mockMarkets
  }
}

// 初始化
fetchMarkets()
</script>

<style scoped>
.markets {
  min-height: 100vh;
  background-color: #f7f8fa;
  max-width: 100vw;
  background-color: #f7f8fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background-color: white;
  height: 50px;
}

.company-logo {
  position: relative;

  top: 4px;
  height: 35px;
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 300px;
}

.markets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px 83px;
  padding: 20px;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.grid-item {
  background: white;
  border-radius: 36px;
  height: 247px;
  width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.grid-item.selected {
  border: 2px solid #409EFF;
}

.add-item {
  background: #f0f9eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #67c23a;
}

.add-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.placeholder {
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.import-options {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
}

.upload-area {
  text-align: center;

}

.uploader {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.upload-icon {
  font-size: 60px;
  color: #8c939d;
  margin-bottom: 10px;
  height: 100px;
  width: 100px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.help-content {
  font-size: 14px;
  line-height: 1.6;
}

.help-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.el-dialog {
  border-radius: 120px !important;
  width: 500px !important;
  height: 500px !important;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0;
  margin-top: 15vh;
  overflow: hidden;
}

/* 对话框标题 */
.el-dialog__header {
  padding: 20px 30px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 120px 120px 0 0;
}

/* 对话框内容 */
.el-dialog__body {
  padding: 30px;
  color: #333;
  height: 300px;
  overflow-y: auto;
}

/* 对话框底部按钮区 */
.el-dialog__footer {
  padding: 20px 30px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

/* 关闭按钮 */
.el-dialog__headerbtn {
  top: 20px;
  right: 20px;
}

.el-dialog__headerbtn .el-dialog__close {
  color: #909399;
  font-size: 20px;
  transition: color 0.3s;
}

.el-dialog__headerbtn:hover .el-dialog__close {
  color: #409EFF;
}

.import-dialog {
  width: 500px;
  height: 500px;
  border-radius: 500px;
}

/* 弹窗动画 */
@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

:deep(.batch-import-dialog) {    width: 500px !important;
    height: 500px !important;
    margin-top: 15vh !important;
    border-radius: 120px !important;
  
  .el-dialog__header {
    padding: 20px 30px !important;
    background: #fafafa !important;
    border-bottom: 1px solid #f0f0f0 !important;
    border-radius: 120px 120px 0 0 !important;
    margin-right: 0 !important;
  }

  .el-dialog__body {
    height: 300px !important;
    padding: 30px !important;
    overflow-y: auto !important;
  }

  .el-dialog__footer {
    padding: 20px 30px !important;
    background: #fafafa !important;
    border-top: 1px solid #f0f0f0 !important;
  }
}

.dialog-import {  :deep(.el-dialog) {
    border-radius: 120px;
    overflow: hidden;
    margin-top: 15vh;
    height: 500px;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 500;
  }

  :deep(.el-dialog__body) {
    padding: 30px;
    height: calc(500px - 130px);
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 15px 20px;
    background-color: #f5f7fa;
    border-top: 1px solid #dcdfe6;
  }
}
</style>
