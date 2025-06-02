<template>  <div class="staff-manage">
    <div class="page-header">
      <div class="header-left">
        <img src="/square-conf.png" alt="公司logo" class="company-logo">
        <h2>人员管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleBatchImport">批量导入</el-button>
        <el-button type="primary" @click="handleAddStaff">新增员工</el-button>
      </div>
    </div>

    <div class="staff-content">
      <el-table :data="staffList" style="width: 100%">
        <el-table-column prop="marketName" label="店名" width="150" />
        <el-table-column prop="auditorName" label="姓名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="password" label="密码" width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系方式" width="150" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="详情" fixed="right" width="100">
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
        </el-table-column>      </el-table>
      
      <!-- 设置时段按钮 -->
      <el-button
        class="settings-time-btn"
        type="primary"
        @click="handleTimeSettings"
      >
        设置时段
      </el-button>
    </div><!-- 新增/编辑员工弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增员工' : '编辑员工'"
      width="500px"
    >
      <el-form :model="staffForm" :rules="rules" ref="staffFormRef" label-width="80px">
        <el-form-item label="店名" prop="marketName">
          <el-select v-model="staffForm.marketId" placeholder="请选择">
            <el-option 
              v-for="market in marketList"
              :key="market.id"
              :label="market.marketName"
              :value="market.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="auditorName">
          <el-input v-model="staffForm.auditorName" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="staffForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="staffForm.password" type="password" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="staffForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="staffForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitStaff">确定</el-button>
        </span>
      </template>
    </el-dialog>    <!-- 批量导入弹窗 -->
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
      <el-form :model="timeForm" ref="timeFormRef" label-width="80px">        <div class="time-section">
          <div class="time-label">中午:</div>
          <div class="time-inputs">
            <el-time-picker
              v-model="timeForm.startNoonTime"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
            <span class="time-separator">-</span>
            <el-time-picker
              v-model="timeForm.endNoonTime"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
          </div>
        </div>
        <div class="time-section">
          <div class="time-label">下午:</div>
          <div class="time-inputs">
            <el-time-picker
              v-model="timeForm.startAfternoonTime"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
            <span class="time-separator">-</span>
            <el-time-picker
              v-model="timeForm.endAfternoonTime"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
          </div>
        </div>
        <div class="time-section">
          <div class="time-label">晚上:</div>
          <div class="time-inputs">
            <el-time-picker
              v-model="timeForm.startNightTime"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
            <span class="time-separator">-</span>
            <el-time-picker
              v-model="timeForm.endNightTime"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
              :clearable="false"
            />
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
import { Setting, Delete, Upload, Box } from '@element-plus/icons-vue'
import axios from 'axios'

// 员工列表数据
const staffList = ref([])
const marketList = ref([])

// 表单数据
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const timeDialogVisible = ref(false)
const dialogType = ref('add')

// 新增/编辑员工表单
const staffForm = reactive({
  marketId: '',
  auditorName: '',
  username: '',
  password: '',
  phone: '',
  email: ''
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

// 上传相关配置
const uploadAction = 'http://localhost:8080/api/admin/staff/import'
const uploadHeaders = {
  token: localStorage.getItem('token'),
  'Content-Type': 'application/json'
}

// 表单验证规则
const rules = {
  marketId: [{ required: true, message: '请选择店名', trigger: 'change' }],
  auditorName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  email: [{ required: false, message: '请输入邮箱', trigger: 'blur' }]
}

// 加载员工列表
const loadStaffList = async () => {
  try {
    const response = await axios.get('/api/admin/staff', {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      staffList.value = response.data.data.staff
    }
  } catch (error) {
    console.error('获取员工列表失败:', error)
    ElMessage.error('获取员工列表失败')
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
    loadStaffList()
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

// 添加员工
const handleAddStaff = () => {
  dialogType.value = 'add'
  Object.assign(staffForm, {
    marketId: '',
    auditorName: '',
    username: '',
    password: '',
    phone: '',
    email: ''
  })
  dialogVisible.value = true
}

// 编辑员工
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(staffForm, row)
  dialogVisible.value = true
}

// 删除员工
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认要删除该员工吗？', '提示', {
      type: 'warning'
    })
    const response = await axios.delete(`/api/admin/staff?auditorId=${row.auditorId}`, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      ElMessage.success('删除成功')
      loadStaffList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交员工表单
const handleSubmitStaff = async () => {
  try {
    const formData = { ...staffForm }
    const url = dialogType.value === 'add' ? '/api/admin/staff' : '/api/admin/staff'
    const method = dialogType.value === 'add' ? 'post' : 'put'
    
    const response = await axios[method](url, formData, {
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.code === 0) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      loadStaffList()
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
loadStaffList()
</script>

<style scoped>
.staff-manage {
  padding: 0px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 24px;
  border-radius: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-logo {
  position: relative;

  top: 4px;
  height: 35px;
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

.staff-content {
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

.time-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.time-label {
  width: 60px;
  text-align: right;
  margin-right: 15px;
  color: #606266;
  flex-shrink: 0;
}

.time-inputs {
  width:40px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.time-separator {
  color: #909399;
  padding: 0 4px;
  flex-shrink: 0;
}

.time-inputs :deep(.el-time-picker) {
  width: 200px;
  flex-shrink: 0;
}

.time-inputs :deep(.el-input__wrapper) {
  padding: 0 8px;
}

/* 设置时段按钮 */
.settings-time-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
}
</style>
