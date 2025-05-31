<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="company-info">
        <img src="/square-logo.png" alt="公司logo" class="company-logo">
        <span class="company-name"></span>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 左侧板块 -->
      <div class="left-panels">
        <!-- 人员管理 -->
        <div class="panel staff-panel" @click="router.push('/staff')">
          <h3>人员管理</h3>
          <img src="/staff-icon.png" alt="人员管理" class="panel-icon">
        </div>

        <!-- 品类管理 -->
        <div class="panel category-panel" @click="router.push('/category')">
          <h3>品类管理</h3>
          <img src="/category-icon.png" alt="品类管理" class="panel-icon">
        </div>
      </div>

      <!-- 中间板块 -->
      <div class="middle-panels">
        <!-- 任务管理 -->
        <div class="panel task-panel">
          <h3>任务管理</h3>
          <div class="task-content" @click="showTaskDialog = true">
            <div class="task-list">
              <div v-for="task in tasks" :key="task.assignmentId" class="task-item">
                {{ task.content }}
              </div>
            </div>            <div class="calendar" @click.stop>
              <el-calendar v-model="currentDate">
                <template #header="{ date }">
                  <div class="calendar-header">
                    <div class="calendar-header-row">
                      <el-button-group>
                        <el-button size="small" @click.stop="selectDate('prev')">
                          <el-icon><ArrowLeft /></el-icon>
                        </el-button>
                        <el-button size="small" @click.stop="selectDate('today')">今天</el-button>
                        <el-button size="small" @click.stop="selectDate('next')">
                          <el-icon><ArrowRight /></el-icon>
                        </el-button>
                      </el-button-group>
                      <span class="current-date">{{ formatDate(date) }}</span>
                    </div>
                  </div>
                </template>                <template #dateCell="{ data }">
                  <div class="calendar-cell" :class="{ 'is-today': isToday(data.day) }">
                    <span>{{ formatDay(data.day) }}</span>
                  </div>
                </template>
              </el-calendar>
            </div>
          </div>
        </div>

        <!-- 总体数据查看 -->
        <div class="panel data-panel" @click="router.push('/statistics')">
          <h3>总体数据查看</h3>
          <div class="chart-container">
            <iframe src="/sales-chart.html" frameborder="0" class="chart-frame"></iframe>
          </div>
        </div>
      </div>

      <!-- 右侧板块 -->
      <div class="right-panels">
        <!-- 商家管理 -->
        <div class="panel market-panel">
          <h3>商家管理</h3>
          <div class="market-list" @click.self="router.push('/markets')">
            <div v-for="market in markets" 
                 :key="market.marketId" 
                 class="market-item"
                 @click.stop="router.push(`/market/${market.marketId}`)">
              <div class="market-info">
                <div class="market-name">{{ market.marketName }}</div>
                <div class="market-address">地址：{{ market.address || '暂无地址' }}</div>
              </div>
              <div class="market-status">
                <el-icon v-if="market.hasWarning" class="warning"><Warning /></el-icon>
                <el-icon v-if="market.hasFeedback" class="feedback"><QuestionFilled /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义数据查看 -->
    <div class="custom-data-panel">
      <h3>表格标题</h3>
      <el-icon class="settings-icon" @click="handleCustomDataSettings"><Setting /></el-icon>
    </div>

    <!-- 任务管理弹窗 -->
    <el-dialog
      v-model="showTaskDialog"
      title="任务管理"
      width="80%"
      :before-close="handleCloseTaskDialog"
    >
      <!-- 任务管理弹窗内容将在后续添加 -->
      <span>任务管理内容</span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Setting, Warning, QuestionFilled } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const currentDate = ref(new Date())
const tasks = ref([])
const markets = ref([])
const showTaskDialog = ref(false)

// 日期格式化函数
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

const formatDay = (dateStr) => {
  if (!dateStr) return ''
  // 将日期字符串转换为数字
  const date = new Date(dateStr)
  const day = date.getDate()
  // 确保返回数字而不是中文数字
  return String(day)
}

// 判断是否是今天
const isToday = (dateStr) => {
  const today = new Date()
  const date = new Date(dateStr)
  return date.toDateString() === today.toDateString()
}

// 选择日期
const selectDate = (type) => {
  const date = new Date(currentDate.value)
  switch (type) {
    case 'prev':
      date.setMonth(date.getMonth() - 1)
      break
    case 'next':
      date.setMonth(date.getMonth() + 1)
      break
    case 'today':
      currentDate.value = new Date()
      return
  }
  currentDate.value = date
}

// Mock数据
const mockTasks = [
  { assignmentId: 1, content: '检查库存情况' },
  { assignmentId: 2, content: '整理仓库' },
  { assignmentId: 3, content: '更新商品价格' }
]

const mockMarkets = [
  { marketId: 1, marketName: '新世界商场', address: '北京市朝阳区', hasWarning: true, hasFeedback: false },
  { marketId: 2, marketName: '时代广场', address: '上海市黄浦区', hasWarning: false, hasFeedback: true },
  { marketId: 3, marketName: '万达广场', address: '广州市天河区', hasWarning: false, hasFeedback: false }
]

// 获取任务列表
const fetchTasks = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    tasks.value = mockTasks
  } catch (error) {
    console.error('获取任务列表失败:', error)
  }
}

// 获取商家列表
const fetchMarkets = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    markets.value = mockMarkets
  } catch (error) {
    console.error('获取商家列表失败:', error)
  }
}

const handleCustomDataSettings = () => {
  // 处理自定义数据设置
}

const handleCloseTaskDialog = () => {
  showTaskDialog.value = false
}

onMounted(() => {
  fetchTasks()
  fetchMarkets()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 0px 0;
  background-color: #f5f5f5;
  width: 100%;
}

.header {
  padding: 10px 20px;
  margin-bottom: 20px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-logo {
  width: 240px;
  height: 60px;
}

.company-name {
  font-size: 20px;
  font-weight: bold;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2.5fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  min-height: calc(100vh - 180px); /* 减去header和底部面板的高度 */
}

.left-panels, .middle-panels, .right-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* 防止内容溢出 */
}

.left-panels {
  min-width: 280px;
}

.middle-panels {
  min-width: 600px;
}

.right-panels {
  min-width: 280px;
}

.panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.staff-panel, .category-panel {
  height: 200px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px; /* 最小高度 */
}

.panel-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 48px; /* 固定图标大小 */
  height: 48px;
  object-fit: contain; /* 保持图片比例 */
  object-position: center; /* 居中显示 */
}

.task-panel {
  height: 450px;
  min-height: 450px; /* 最小高度 */
}

.task-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 40px);
}

.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.calendar {
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.calendar-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.calendar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-date {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.calendar :deep(.el-calendar) {
  --el-calendar-header-height: auto;
  background: none;
  border: none;
}

.calendar :deep(.el-calendar__header) {
  display: none;  /* 隐藏原有的日历头部 */
}

.calendar-header {
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.calendar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 8px;
}

.calendar-nav {
  display: flex;
  gap: 8px;
}

.prev-month,
.next-month,
.today-btn {
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
  background-color: transparent;
}

.prev-month:hover,
.next-month:hover,
.today-btn:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.calendar :deep(.el-calendar__body) {
  padding: 0;
}

.calendar :deep(.el-calendar-table) {
  height: 100%;
  border-spacing: 4px;
  border-collapse: separate;
}

.calendar :deep(.el-calendar-day) {
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.calendar-cell {
  width: 32px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 14px;
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
}

.calendar-cell:hover {
  background-color: #f5f7fa;
}

.today {
  background: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}

.calendar :deep(.is-selected) .calendar-cell {
  background: #409eff;
  color: #fff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.calendar :deep(.el-calendar-table td) {
  border: none;
  padding: 2px;
}

.calendar :deep(.el-calendar-table th) {
  text-align: center;
  padding: 8px 0;
  color: #909399;
  font-weight: normal;
  border: none;
}

.data-panel {
  height: 300px;
}

.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.chart-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.market-panel {
  height: 100%;
}

.market-list {
  height: calc(100% - 40px);
  overflow-y: auto;
}

.market-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-item:hover {
  background-color: #f5f7fa;
}

.market-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.market-address {
  font-size: 12px;
  color: #666;
}

.market-status {
  display: flex;
  gap: 10px;
}

.warning {
  color: #e6a23c;
}

.feedback {
  color: #8e44ad;
}

.custom-data-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.settings-icon:hover {
  color: #409eff;
}
</style>
