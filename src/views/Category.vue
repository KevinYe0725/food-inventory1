<template>
  <div class="category-manage">
    <div class="page-header">
      <div class="header-left">
        <img src="/square-logo.png" alt="公司logo" class="company-logo">
        <h2>品类管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleBatchImport">批量导入</el-button>
        <el-button type="primary" @click="handleAddCategory">新增品类</el-button>
      </div>
    </div>

    <div class="category-content">
      <el-table :data="categoryList" style="width: 100%">
        <el-table-column prop="goodId" label="ID" width="80" />
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <el-image 
              :src="row.image" 
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            >
              <template #error>
                <el-icon><Picture /></el-icon>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="goodName" label="品类名称" width="150" />
        <el-table-column prop="totalNumber" label="总数量" width="100" />
        <el-table-column prop="totalMarket" label="门店数" width="100" />
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="{ row }">
            <el-button-group>
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon><Setting /></el-icon>
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 设置时段按钮 -->
      <el-button
        class="settings-time-btn"
        type="primary"
        @click="handleTimeSettings"
      >
        设置时段
      </el-button>
    </div>    <!-- 新增/编辑品类弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增品类' : '编辑品类'"
      width="500px"
    >
      <el-form :model="categoryForm" :rules="rules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="品类名称" prop="goodName">
          <el-input v-model="categoryForm.goodName" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="image-upload"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="categoryForm.image" :src="categoryForm.image" class="preview-image">
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入"
      width="500px"
    >
      <div class="upload-container">
        <el-upload
          class="upload-area"
          :action="uploadAction"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">点击或拖拽Excel文件到此处上传</div>
          </div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- 审核时段设置弹窗 -->
    <el-dialog
      v-model="timeDialogVisible"
      title="审核时段"
      width="500px"
    >
      <el-form :model="timeForm" ref="timeFormRef" label-width="80px">
        <div class="time-section">
          <div class="time-label">中午:</div>
          <div class="time-inputs">
            <el-input v-model="timeForm.startNoonTime" placeholder="HH:mm" />
            <span class="time-separator">-</span>
            <el-input v-model="timeForm.endNoonTime" placeholder="HH:mm" />
          </div>
        </div>
        <div class="time-section">
          <div class="time-label">下午:</div>
          <div class="time-inputs">
            <el-input v-model="timeForm.startAfternoonTime" placeholder="HH:mm" />
            <span class="time-separator">-</span>
            <el-input v-model="timeForm.endAfternoonTime" placeholder="HH:mm" />
          </div>
        </div>
        <div class="time-section">
          <div class="time-label">晚上:</div>
          <div class="time-inputs">
            <el-input v-model="timeForm.startNightTime" placeholder="HH:mm" />
            <span class="time-separator">-</span>
            <el-input v-model="timeForm.endNightTime" placeholder="HH:mm" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTimeSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Delete, Upload, Picture, Plus } from '@element-plus/icons-vue'
import axios from 'axios'

// 品类列表数据
const categoryList = ref([])

// 弹窗显示控制
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const timeDialogVisible = ref(false)
const dialogType = ref('add')

// 新增/编辑品类表单
const categoryForm = reactive({
  goodId: '',
  goodName: '',
  image: ''
})

// 时段设置表单
const timeForm = reactive({
  startNoonTime: '',
  endNoonTime: '',
  startAfternoonTime: '',
  endAfternoonTime: '',
  startNightTime: '',
  endNightTime: ''
})

// 表单验证规则
const rules = {
  goodName: [{ required: true, message: '请输入品类名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传商品图片', trigger: 'change' }]
}

// 上传相关配置
const uploadAction = 'http://localhost:8080/api/admin/good/import'
const uploadHeaders = {
  Authorization: localStorage.getItem('token'),
  'Content-Type': 'application/json'
}

// 加载品类列表
const loadCategoryList = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/admin/good', {
      params: {
        date: new Date().toISOString().split('T')[0] // 当前日期
      },
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      categoryList.value = response.data.data.goodList
    }
  } catch (error) {
    console.error('获取品类列表失败:', error)
    ElMessage.error('获取品类列表失败')
  }
}

// 打开批量导入弹窗
const handleBatchImport = () => {
  importDialogVisible.value = true
}

// 文件上传成功处理
const handleUploadSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    loadCategoryList()
  } else {
    ElMessage.error(response.msg || '导入失败')
  }
}

// 上传前校验
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  return true
}

// 图片上传成功处理
const handleImageSuccess = (response) => {
  categoryForm.image = response.data.url
}

// 图片上传前校验
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 添加品类
const handleAddCategory = () => {
  dialogType.value = 'add'
  Object.assign(categoryForm, {
    goodId: '',
    goodName: '',
    image: ''
  })
  dialogVisible.value = true
}

// 编辑品类
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

// 删除品类
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认要删除该品类吗？', '提示', {
      type: 'warning'
    })
    const response = await axios.delete(`/api/admin/good?goodId=${row.goodId}`, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      ElMessage.success('删除成功')
      loadCategoryList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交品类表单
const handleSubmitCategory = async () => {
  try {
    const url = '/api/admin/good'
    const method = dialogType.value === 'add' ? 'post' : 'put'
    const data = dialogType.value === 'add' 
      ? { 
          goodName: categoryForm.goodName,
          image: categoryForm.image
        }
      : {
          goodId: categoryForm.goodId,
          goodName: categoryForm.goodName,
          image: categoryForm.image
        }

    const response = await axios[method](url, data, {
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      loadCategoryList()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 打开时段设置弹窗
const handleTimeSettings = () => {
  timeDialogVisible.value = true
}

// 提交时段设置
const handleTimeSubmit = async () => {
  try {
    const response = await axios.put('/api/admin/time', null, {
      params: timeForm
    })
    if (response.data.code === 0) {
      ElMessage.success('设置成功')
      timeDialogVisible.value = false
    }
  } catch (error) {
    console.error('设置失败:', error)
    ElMessage.error('设置失败')
  }
}

// 初始化加载数据
loadCategoryList()
</script>

<style scoped>
.category-manage {
  width: 100%;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-logo {
  height: 40px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.category-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
}

.upload-container {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  text-align: center;
  padding: 40px 0;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  color: #909399;
  font-size: 14px;
}

.image-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-upload:hover {
  border-color: #409EFF;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.time-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.time-label {
  width: 60px;
  text-align: right;
  margin-right: 20px;
  color: #606266;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.time-separator {
  color: #909399;
}

/* 设置时段按钮 */
.settings-time-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
}
</style>
