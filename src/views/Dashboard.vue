<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="company-info">
        <img src="/square-conf.png" alt="公司logo" class="company-logo">
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
          <h3>任务管理</h3>          <div class="task-content" @click="showTaskDialog = true">            <div class="task-list no-scrollbar">
              <div v-for="task in displayTasks" :key="task.goodId" class="task-item">
                <div class="task-item-content">
                  <span class="market-name">{{ task.marketName }}</span>
                  <span class="good-name">{{ task.goodName }}</span>
                  <span class="warning-time">在 {{ task.time }} 时间段告急需处理</span>
                </div>
                <div class="task-item-status" :class="{ 'handled': task.assignmentStatus === 1 }">
                  {{ task.assignmentStatus === 1 ? '已处理' : '待处理' }}
                </div>
              </div>
            </div>            <div class="calendar-container" @click.stop>
              <div class="calendar-header">
                <button class="month-btn" @click="prevMonth">◀</button>
                <span class="month-title">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
                <button class="month-btn" @click="nextMonth">▶</button>
              </div>
              <div class="weekdays">
                <span v-for="day in ['日','一','二','三','四','五','六']" 
                      :key="day" 
                      class="weekday">{{ day }}</span>
              </div>
              <div class="days">
                <div v-for="item in calendarDays" 
                     :key="item.date"
                     class="day"
                     :class="{ 
                       'other-month': !item.isCurrentMonth, 
                       'selected': item.date === selectedDate,
                       'today': isToday(item.date)
                     }"
                     @click="selectCalendarDate(item.date)">
                  <span class="day-number">{{ item.day }}</span>
            
                </div>
              </div>
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
    </div>    <!-- 自定义数据查看 -->
    <div class="custom-data-panel">      <h3>
        表格标题
        <el-button class="settings-button" @click="handleCustomDataSettings">
          <el-icon class="settings-icon"><SettingIcon /></el-icon>
        </el-button>
      </h3>
      <div class="panel-content">
        <template v-if="customData.length">
          <!-- 这里可以放置数据内容 -->
          <el-table :data="customData" style="width: 100%">
            <el-table-column v-for="col in customColumns" 
                           :key="col.prop" 
                           :prop="col.prop" 
                           :label="col.label" />
          </el-table>
        </template>
        <div v-else class="empty-state">
          <el-icon style="font-size: 48px; margin-bottom: 20px;"><DataBoard /></el-icon>
          <p>暂无数据或数据加载失败</p>
          <el-button type="primary" @click="handleCustomDataSettings">配置数据</el-button>
        </div>
      </div>
    </div>    <!-- 任务管理弹窗 -->
    <el-dialog
      v-model="showTaskDialog"
      title="任务管理"
      width="80%"
      :before-close="handleCloseTaskDialog"
    >
      <div class="task-dialog-content">
        <div class="task-dialog-header">
          <div class="task-dialog-title">
            <h2>任务管理</h2>
            <span class="current-date">{{ formatFullDate(new Date()) }}</span>
          </div>
          <el-select
            v-model="selectedMarket"
            filterable
            placeholder="选择商家"
            class="market-select"
            @change="handleMarketChange"
          >
            <el-option
              v-for="market in mockMarketList"
              :key="market.id"
              :label="market.marketName"
              :value="market.id"
            />
          </el-select>
        </div>
        <div class="task-dialog-list">          <div v-for="task in filteredTasks" :key="task.goodId" class="task-dialog-item">
            <div class="task-status-icon" :class="{ 'completed': task.assignmentStatus === 1 }">
              {{ task.assignmentStatus === 1 ? '√' : '×' }}
            </div>
            <div class="task-dialog-info">
              <span class="market-name">{{ task.marketName }}</span>：
              <span class="good-name">{{ task.goodName }}</span>
              <span class="warning-time">在 {{ task.time }} 时间段告急需处理</span>
            </div>
            <div class="task-dialog-actions">
              <el-button type="primary" size="small" @click="viewMarket(task)">查看</el-button>
              <el-button type="danger" size="small" @click="deleteTask(task)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>    <!-- 自定义数据设置弹窗 -->
    <el-dialog
      v-model="customDataDialogVisible"
      title="自定义数据设置"
      width="500px"
    >
      <div class="custom-data-settings">
        <el-form :model="customDataForm" label-width="100px">
          <el-form-item label="图表类型">
            <el-select v-model="customDataForm.chartType" placeholder="请选择图表类型">
              <el-option label="折线图" value="line" />
              <el-option label="柱状图" value="bar" />
              <el-option label="饼图" value="pie" />
              <el-option label="表格" value="table" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="customDataForm.dataType" placeholder="请选择数据类型">
              <el-option label="销售数据" value="sales" />
              <el-option label="库存数据" value="inventory" />
              <el-option label="商品类别统计" value="categories" />
              <el-option label="门店统计" value="stores" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-select v-model="customDataForm.timeRange" placeholder="请选择时间范围">
              <el-option label="今日" value="today" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="全年" value="year" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="customDataDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="applyCustomDataSettings">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Setting as SettingIcon, Warning, QuestionFilled, DataBoard } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const currentDate = ref(new Date())
const tasks = ref([])
const markets = ref([])
const showTaskDialog = ref(false)
const warningTasks = ref([])
const selectedMarket = ref('')
const customDataDialogVisible = ref(false) // 控制自定义数据设置弹窗的显示

// 确保在初始化时正确设置
onMounted(() => {
  customDataDialogVisible.value = false
})
const customDataForm = reactive({
  chartType: 'table',
  dataType: 'sales',
  timeRange: 'today'
})

// Mock数据 - 商家列表
const mockMarketList = [
  { id: 1, marketName: '新世界商场', image: '', phone: '13800138000', email: 'xinshijie@example.com', person: '张三' },
  { id: 2, marketName: '时代广场', image: '', phone: '13800138001', email: 'shidai@example.com', person: '李四' },
  { id: 3, marketName: '万达广场', image: '', phone: '13800138002', email: 'wanda@example.com', person: '王五' }
]

// Mock数据 - 预警信息
const mockWarningData = {
  1: [
    { goodId: 1, goodName: '苹果', initialGoods: 100, remainingRate: '20%', time: '2025-06-01 10:00', auditorName: '张三', recentTimes: 3, assignmentStatus: 0 },
    { goodId: 2, goodName: '香蕉', initialGoods: 150, remainingRate: '15%', time: '2025-06-01 11:00', auditorName: '张三', recentTimes: 2, assignmentStatus: 1 }
  ],
  2: [
    { goodId: 3, goodName: '橙子', initialGoods: 200, remainingRate: '10%', time: '2025-06-01 09:00', auditorName: '李四', recentTimes: 1, assignmentStatus: 0 }
  ],
  3: [
    { goodId: 4, goodName: '葡萄', initialGoods: 80, remainingRate: '25%', time: '2025-06-01 14:00', auditorName: '王五', recentTimes: 4, assignmentStatus: 1 }
  ]
}

// 获取所有商家列表
const fetchMarketList = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockMarketList
  } catch (error) {
    console.error('获取商家列表失败:', error)
    return []
  }
}

// 获取商家预警信息
const fetchMarketWarnings = async (marketId, date) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockWarningData[marketId] || []
  } catch (error) {
    console.error('获取预警信息失败:', error)
    return []
  }
}

// 获取所有预警任务
const fetchAllWarningTasks = async () => {
  try {
    const marketList = await fetchMarketList()
    const currentDate = new Date().toISOString().split('T')[0]
    const allWarnings = []

    for (const market of marketList) {
      const warnings = await fetchMarketWarnings(market.id, currentDate)
      warnings.forEach(warning => {
        allWarnings.push({
          marketName: market.marketName,
          ...warning
        })
      })
    }

    warningTasks.value = allWarnings
  } catch (error) {
    console.error('获取预警任务失败:', error)
  }
}

// 添加自定义数据相关的响应式变量
const customData = ref([])
const customColumns = ref([
  { prop: 'date', label: '日期' },
  { prop: 'name', label: '名称' },
  { prop: 'value', label: '数值' }
])

// 模拟数据生成函数
const generateMockData = ({ chartType, dataType, timeRange }) => {
  const data = []
  const now = new Date()
  
  if (dataType === 'sales') {
    if (timeRange === 'today') {
      for (let i = 0; i < 24; i++) {
        data.push({
          date: `${i}:00`,
          name: '销售额',
          value: Math.floor(Math.random() * 10000)
        })
      }
    } else if (timeRange === 'week') {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      days.forEach(day => {
        data.push({
          date: day,
          name: '销售额',
          value: Math.floor(Math.random() * 50000)
        })
      })
    }
  } else if (dataType === 'inventory') {
    const categories = ['水果', '蔬菜', '肉类', '海鲜', '饮料']
    categories.forEach(category => {
      data.push({
        date: now.toLocaleDateString(),
        name: category,
        value: Math.floor(Math.random() * 1000)
      })
    })
  } else if (dataType === 'categories') {
    const categories = ['新鲜水果', '时令蔬菜', '肉禽蛋品', '海鲜水产', '休闲食品']
    categories.forEach(category => {
      data.push({
        date: now.toLocaleDateString(),
        name: category,
        value: Math.floor(Math.random() * 100)
      })
    })
  } else if (dataType === 'stores') {
    const stores = ['新世界商场', '时代广场', '万达广场', '环球中心', '天环广场']
    stores.forEach(store => {
      data.push({
        date: now.toLocaleDateString(),
        name: store,
        value: Math.floor(Math.random() * 200)
      })
    })
  }
  
  return data
}

const handleCustomDataSettings = () => {
  customDataDialogVisible.value = true
}

// 应用自定义数据设置
const applyCustomDataSettings = () => {
  // 生成模拟数据
  customData.value = generateMockData(customDataForm)
  
  // 更新表格列配置
  customColumns.value = [
    { prop: 'date', label: customDataForm.timeRange === 'today' ? '时间' : '日期' },
    { prop: 'name', label: {
      'sales': '项目',
      'inventory': '商品类别',
      'categories': '品类名称',
      'stores': '门店名称'
    }[customDataForm.dataType] },
    { prop: 'value', label: {
      'sales': '销售额',
      'inventory': '库存量',
      'categories': '商品数量',
      'stores': '销售总额'
    }[customDataForm.dataType] }
  ]
  
  customDataDialogVisible.value = false
  ElMessage.success('设置已更新')
}

const handleCloseTaskDialog = () => {
  showTaskDialog.value = false
}

// 计算属性：只显示前3条任务
const displayTasks = computed(() => {
  return warningTasks.value.slice(0, 3)
})

// 计算属性：根据选择的商家过滤任务
const filteredTasks = computed(() => {
  if (!selectedMarket.value) return warningTasks.value
  return warningTasks.value.filter(task => {
    const market = mockMarketList.find(m => m.id === selectedMarket.value)
    return market && task.marketName === market.marketName
  })
})

// 完整日期格式化
const formatFullDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

// 查看市场详情
const viewMarket = (task) => {
  const market = mockMarketList.find(m => m.marketName === task.marketName)
  if (market) {
    router.push(`/market/${market.id}`)
    showTaskDialog.value = false
  }
}

// 删除任务
const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${task.marketName} 的 ${task.goodName} 预警任务吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 这里可以调用实际的删除API
    // const response = await axios.delete(`/api/tasks/${task.goodId}`)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 从本地状态中移除任务
    warningTasks.value = warningTasks.value.filter(t => t.goodId !== task.goodId)
    
    ElMessage({
      type: 'success',
      message: '任务删除成功'
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage({
        type: 'error',
        message: '删除失败，请重试'
      })
    }
  }
}

// 处理商家选择变化
const handleMarketChange = (value) => {
  // 这里可以添加额外的处理逻辑
}

onMounted(() => {
  fetchAllWarningTasks()
  fetchMarkets()
  generateCalendar()
})
</script>

<style scoped>
.dashboard {
  height: 100vh;
  padding: 0;
  background-color: #f7f8fa;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止整体出现滚动条 */
}

.header {
  padding: 10px 20px;
  height: 60px;
  flex-shrink: 0;
  background: white; /* 确保header背景色 */
  position: relative; /* 确保在最上层 */
  z-index: 1;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-logo {
  position: absolute;
  left: 20px;
  top: 20px;
  height: 35px;
}

.company-name {
  font-size: 20px;
  font-weight: bold;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2.5fr 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(65vh - 60px); /* 分配页面65%的高度给主内容区，减去header高度 */
}

.left-panels, .middle-panels, .right-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* 防止内容溢出 */
  height: 100%;
  min-height: 0; /* 允许内容区域收缩 */
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
  border-radius: 36px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.staff-panel, .category-panel {
  height: calc(50% - 10px); /* 各占左侧50%高度，减去gap的一半 */
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0; /* 允许内容收缩 */
  overflow: hidden; /* 防止内容溢出 */
}

.panel-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  object-fit: contain;
  object-position: center;
}

.task-panel {
  height: calc(50% - 10px); /* 占中间板块50%高度，减去gap的一半 */
  overflow: hidden;
}

.task-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 60px); /* 减去标题和padding的高度 */
  min-height: 0; /* 允许内容收缩 */
  position: relative; /* 添加相对定位，作为日历的定位父元素 */
}

.task-list {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.task-item {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  height: calc(33.33% - 1px); /* 确保每个项目占用相同高度 */
}

.task-item-content {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.market-name {
  font-weight: bold;
  color: #333;
  flex-shrink: 0;
}

.good-name {
  color: #ff4d4f;
  flex-shrink: 0;
}

.warning-time {
  color: #666;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item-status {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background-color: #ff4d4f;
  color: white;
  flex-shrink: 0;
}

.task-item-status.handled {
  background-color: #6d9ffe;
}

.calendar {
  /* position: absolute; 改为浮动定位 */
  right: 20px;
  top: 0;
  width: 45%;
  height: 100%; /* 使高度与任务管理标题齐平 */
  background: white;
  border-radius: 6px;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.calendar-container {
  width: 40%;
  height: 240px;
  font-size: 12px;
  background-color: #fff;
  border-radius: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-title {
  font-size: 16px;
  font-weight: bold;
}

.month-btn {
  border: none;
  background: none;
  font-size: 16px;
  padding: 5px 15px;
  cursor: pointer;
  color: #666;
}

.month-btn:hover {
  color: #f2382f;
}

.weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 5px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.weekday {
  width: 14%;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.days {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-content: flex-start;
}

.day {
  width: 10%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.day:hover {
  background-color: #f5f5f5;
  border-radius: 50%;
}

.day-number {
  font-size: 12px;
}

.day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #f2382f;
  position: absolute;
  bottom: 5px;
}

.other-month {
  opacity: 0.3;
}

.day.selected {
  background-color: #f2382f;
  border-radius: 50%;
  color: #fff;
}

.day.selected .day-dot {
  background-color: #fff;
}

.day.today {
  font-weight: bold;
  color: #f2382f;
}

.day.today.selected {
  color: #fff;
}

.data-panel {
  height: calc(50% - 10px); /* 占中间板块50%高度，减去gap的一半 */
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0; /*允许内容收缩 */
  padding: 0px;
}

.chart-container {
  width: 95%;
  height: calc(100% - 40px);
  margin-top: 10px;
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
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许内容收缩 */
}

.market-list {
  height: calc(100% - 60px); /* 减去标题和padding的高度 */
  overflow-y: auto;
  min-height: 0; /* 允许内容收缩 */
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
  height: calc(35vh - 20px); /* 分配页面35%的高度给自定义数据面板，减去margin */
  min-height: 250px; /* 设置最小高度，防止内容过于压缩 */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

/* 添加自定义数据面板的头部样式 */
.custom-data-panel h3 {
  margin: 0;
  padding: 0 0 20px 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 添加自定义数据面板的内容区域样式 */
.custom-data-panel .panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 添加数据加载失败时的占位样式 */
.custom-data-panel .empty-state {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 40px 0;
}

.settings-button {
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover .settings-icon {
    color: #409eff;
  }
}

.settings-icon {
  font-size: 20px;
  color: #606266;
  transition: color 0.3s ease;
}

.task-dialog-content {
  padding: 20px;
}

.task-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.task-dialog-title {
  h2 {
    margin: 0 0 10px 0;
    font-size: 22px;
    font-weight: bold;
  }

  .current-date {
    color: #666;
    font-size: 14px;
  }
}

.market-select {
  width: 200px;
}

.task-dialog-list {
  min-height: 400px;
}

.task-dialog-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.task-status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 16px;
  flex-shrink: 0;
}

.task-status-icon.completed {
  background-color: #6d9ffe;
}

.task-dialog-info {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  margin-right: 16px;
}

.task-dialog-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.task-dialog-actions .el-button {
  padding: 8px 16px;
}

/* 自定义数据设置弹窗样式 */
.custom-data-settings {
  padding: 20px;
}

.custom-data-settings .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>
