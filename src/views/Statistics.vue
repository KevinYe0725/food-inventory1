<template>
  <div class="statistics">
    <div class="page-header">
      <div class="header-left">
        <img src="/square-conf.png" alt="公司logo" class="company-logo">
        <h2>总体数据查看</h2>
      </div>
    </div>
      <!-- 第一行卡片 -->
    <div class="card-row">      <!-- 总体数据查看卡片 -->
      <div class="data-card overall-data" @click="showOverallData">
        <div class="card-header">
          <div class="header-title">
            <!-- <img src="/square-logo.png" alt="公司logo" class="card-logo"> -->
            <h3>总体数据查看</h3>
          </div>
        </div>
        <div class="chart-container">
          <div ref="overallChartRef" class="chart"></div>
        </div>
        <div class="data-info">
          本月销售额环比: <span class="highlight">30</span>
          <el-icon><ArrowUp /></el-icon>
        </div>
      </div><!-- TOP3品类卡片 -->
      <div class="data-card top-goods" @click="showGoodsRank">
        <div class="card-header">
          <div class="header-title">
            <img src="/category-icon.png" alt="品类图标" class="card-logo">
            <h3>本月TOP 3品类</h3>
          </div>
        </div>
        <div class="card-content">
          <div class="rank-list">
            <div v-for="(item, index) in topGoods" :key="item.goodId" class="rank-item">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="name">{{ item.goodName }}</span>
            </div>
          </div>
          <div ref="goodsChartRef" class="chart"></div>
        </div>
      </div>      <!-- TOP3商店卡片 -->
      <div class="data-card top-markets" @click="showMarketRank">
        <div class="card-header">
          <div class="header-title">
            <!-- <img src="/square-logo.png" alt="商店图标" class="card-logo"> -->
            <h3>本月TOP 3商店</h3>
          </div>
        </div>
        <div class="card-content">
          <div class="rank-list">
            <div v-for="(item, index) in topMarkets" :key="item.marketId" class="rank-item">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="name">{{ item.marketName }}</span>
            </div>
          </div>
          <div ref="marketChartRef" class="chart"></div>
        </div>
      </div>
    </div>    <!-- 第二行 - 月销售额比对图 -->
    <div class="card-row">
      <div class="data-card full-width" @click="showMonthlyCompare">
        <h3>月销售额同比比对图</h3>
        <div class="chart-container">
          <div ref="monthlyCompareChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 第三行 - 预留空间 -->
    <div class="card-row">
      <div class="data-card half-width" @click="showReservedArea1">
        <h3>预留区域1</h3>
      </div>
      <div class="data-card half-width" @click="showReservedArea2">
        <h3>预留区域2</h3>
      </div>
    </div><!-- 商品排名弹窗 -->
    <el-dialog
      v-model="goodsRankVisible"
      title="商品销量排行"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-loading="loading">
        <el-table :data="allGoods" style="width: 100%" border>
          <el-table-column prop="goodName" label="商品名称" />
          <el-table-column prop="totalNumber" label="销量">
            <template #default="scope">
              {{ scope.row.totalNumber }} 件
            </template>
          </el-table-column>
        </el-table>
        <div class="dialog-footer">
          <p class="dialog-tip">注：显示本月所有商品的销量排名</p>
        </div>
      </div>
    </el-dialog>

    <!-- 商店排名弹窗 -->
    <el-dialog
      v-model="marketRankVisible"
      title="商店销量排行"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div v-loading="loading">
        <el-table :data="allMarkets" style="width: 100%" border>
          <el-table-column prop="marketName" label="商店名称" />
          <el-table-column prop="totalNumber" label="销量">
            <template #default="scope">
              {{ scope.row.totalNumber }} 件
            </template>
          </el-table-column>
        </el-table>
        <div class="dialog-footer">
          <p class="dialog-tip">注：显示本月所有商店的销量排名</p>
        </div>
      </div>
    </el-dialog>

    <!-- 总体数据查看弹窗 -->
    <el-dialog
      v-model="overallDataVisible"
      title="总体数据详情"
      width="80%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="fullscreen-chart">
        <div id="overallDialogChart" style="width: 100%; height: 600px;"></div>
        <div class="data-details">
          <h4>详细数据</h4>
          <div class="detail-item">
            <span>本月销售额环比:</span>
            <span class="highlight">30% <el-icon><ArrowUp /></el-icon></span>
          </div>
          <!-- 可以添加更多详细数据 -->
        </div>
      </div>
    </el-dialog>

    <!-- 月销售额比对弹窗 -->
    <el-dialog
      v-model="monthlyCompareVisible"
      title="月销售额同比详情"
      width="90%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="fullscreen-chart">
        <div id="monthlyCompareDialogChart" style="width: 100%; height: 600px;"></div>
      </div>
    </el-dialog>

    <!-- 预留区域1弹窗 -->
    <el-dialog
      v-model="reservedArea1Visible"
      title="预留区域1详情"
      width="60%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="reserved-area-content">
        <p>此区域预留用于未来功能扩展</p>
      </div>
    </el-dialog>

    <!-- 预留区域2弹窗 -->
    <el-dialog
      v-model="reservedArea2Visible"
      title="预留区域2详情"
      width="60%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="reserved-area-content">
        <p>此区域预留用于未来功能扩展</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ArrowUp } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 图表引用
const goodsChartRef = ref(null)
const marketChartRef = ref(null)
const monthlyCompareChartRef = ref(null)
const overallChartRef = ref(null)

// 数据状态
const topGoods = ref([])
const topMarkets = ref([])
const allGoods = ref([])
const allMarkets = ref([])
const goodsRankVisible = ref(false)
const marketRankVisible = ref(false)

// 新增其他卡片的弹窗状态
const overallDataVisible = ref(false)
const monthlyCompareVisible = ref(false)
const reservedArea1Visible = ref(false)
const reservedArea2Visible = ref(false)

// 加载状态
const loading = ref(false)

// 商品相关数据
const mockGoodsData = [
  { goodId: 1, goodName: '新鲜豆腐', totalNumber: 2300 },
  { goodId: 2, goodName: '酱油', totalNumber: 1800 },
  { goodId: 3, goodName: '食用油', totalNumber: 1500 },
  { goodId: 4, goodName: '大米', totalNumber: 1200 },
  { goodId: 5, goodName: '饮料', totalNumber: 1000 }
]

// 商店相关数据
const mockMarketData = [
  { marketId: 1, marketName: '新鲜优选超市', totalNumber: 8500 },
  { marketId: 2, marketName: '品质生活店', totalNumber: 7200 },
  { marketId: 3, marketName: '快乐便利店', totalNumber: 6800 },
  { marketId: 4, marketName: '社区优选', totalNumber: 6000 },
  { marketId: 5, marketName: '邻里生鲜', totalNumber: 5500 }
]

// 初始化商品TOP3图表
const initGoodsChart = (data) => {
  const chart = echarts.init(goodsChartRef.value)
  const option = {
    grid: {
      top: '10%',
      right: '3%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.goodName),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item.totalNumber),
      type: 'bar',
      barWidth: '40%',
      color: '#67C23A'
    }]
  }
  chart.setOption(option)
}

// 初始化商店TOP3图表
const initMarketChart = (data) => {
  const chart = echarts.init(marketChartRef.value)
  const option = {
    grid: {
      top: '10%',
      right: '3%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.marketName),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item.totalNumber),
      type: 'bar',
      barWidth: '40%',
      color: '#E6A23C'
    }]
  }
  chart.setOption(option)
}

// 初始化月度比对图表
const initMonthlyCompareChart = () => {
  const chart = echarts.init(monthlyCompareChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['今年', '去年']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '今年',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330]
      },
      {
        name: '去年',
        type: 'line',
        data: [100, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149]
      }
    ]
  }
  chart.setOption(option)
}

// 获取商品排行数据
const fetchGoodsRank = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/admin/total/top/goods', {
      params: {
        date: new Date().toISOString().split('T')[0]
      },
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      allGoods.value = response.data.data.goodList
      topGoods.value = response.data.data.goodList.slice(0, 3)
      initGoodsChart(topGoods.value)
    } else {
      throw new Error(response.data.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取商品排行失败:', error)
    // 使用模拟数据
    allGoods.value = mockGoodsData
    topGoods.value = mockGoodsData.slice(0, 3)
    initGoodsChart(topGoods.value)
    ElMessage.warning('使用模拟数据显示')
  }
}

// 获取商店排行数据
const fetchMarketRank = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/admin/total/top/market', {
      params: {
        date: new Date().toISOString().split('T')[0]
      },
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    if (response.data.code === 0) {
      allMarkets.value = response.data.data.marketList
      topMarkets.value = response.data.data.marketList.slice(0, 3)
      initMarketChart(topMarkets.value)
    } else {
      throw new Error(response.data.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取商店排行失败:', error)
    // 使用模拟数据
    allMarkets.value = mockMarketData
    topMarkets.value = mockMarketData.slice(0, 3)
    initMarketChart(topMarkets.value)
    ElMessage.warning('使用模拟数据显示')
  }
}

// 显示商品排行弹窗
const showGoodsRank = async () => {
  goodsRankVisible.value = true
  if (allGoods.value.length === 0) {
    loading.value = true
    await fetchGoodsRank()
    loading.value = false
  }
}

// 显示商店排行弹窗
const showMarketRank = async () => {
  marketRankVisible.value = true
  if (allMarkets.value.length === 0) {
    loading.value = true
    await fetchMarketRank()
    loading.value = false
  }
}

// 显示总体数据弹窗
const showOverallData = () => {
  overallDataVisible.value = true
  // 确保图表正确显示
  setTimeout(() => {
    const chart = echarts.init(document.getElementById('overallDialogChart'))
    chart.setOption(overallChartRef.value.getEchartsInstance().getOption())
  }, 100)
}

// 显示月度比对弹窗
const showMonthlyCompare = () => {
  monthlyCompareVisible.value = true
  // 确保图表正确显示
  setTimeout(() => {
    const chart = echarts.init(document.getElementById('monthlyCompareDialogChart'))
    chart.setOption(monthlyCompareChartRef.value.getEchartsInstance().getOption())
  }, 100)
}

// 显示预留区域1弹窗
const showReservedArea1 = () => {
  reservedArea1Visible.value = true
}

// 显示预留区域2弹窗
const showReservedArea2 = () => {
  reservedArea2Visible.value = true
}

// 对话框图表实例引用
const overallDialogChartInstance = ref(null)
const monthlyCompareDialogChartInstance = ref(null)

// 监听弹窗显示状态
watch(overallDataVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      overallDialogChartInstance.value = echarts.init(document.getElementById('overallDialogChart'))
      overallDialogChartInstance.value.setOption(overallChartRef.value.getEchartsInstance().getOption())
    })
  } else {
    if (overallDialogChartInstance.value) {
      overallDialogChartInstance.value.dispose()
      overallDialogChartInstance.value = null
    }
  }
})

watch(monthlyCompareVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      monthlyCompareDialogChartInstance.value = echarts.init(document.getElementById('monthlyCompareDialogChart'))
      monthlyCompareDialogChartInstance.value.setOption(monthlyCompareChartRef.value.getEchartsInstance().getOption())
    })
  } else {
    if (monthlyCompareDialogChartInstance.value) {
      monthlyCompareDialogChartInstance.value.dispose()
      monthlyCompareDialogChartInstance.value = null
    }
  }
})

// 处理窗口大小变化
const handleResize = () => {
  const charts = [
    goodsChartRef.value,
    marketChartRef.value,
    monthlyCompareChartRef.value,
    overallChartRef.value,
    overallDialogChartInstance.value,
    monthlyCompareDialogChartInstance.value
  ]
  
  charts.forEach(chart => {
    if (chart) {
      echarts.getInstanceByDom(chart)?.resize()
    }
  })
}

onMounted(() => {
  // 初始化所有图表
  initMonthlyCompareChart()
  
  // 获取排行数据
  fetchGoodsRank()
  fetchMarketRank()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 清理图表实例和事件监听
  window.removeEventListener('resize', handleResize)
  const charts = [
    overallDialogChartInstance.value,
    monthlyCompareDialogChartInstance.value
  ]
  charts.forEach(chart => {
    if (chart) {
      chart.dispose()
    }
  })
})
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
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

.card-row {
  /* height: calc(30% - 10px); */
  height: 300px;
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  background: white;
  border-radius: 50px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.overall-data {
  flex: 1;
}

.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-logo {
  width: 24px;
  height: 24px;
}

.data-info {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
  margin: 0 4px;
}

.top-goods, .top-markets {
  flex: 1;
  min-width: 300px;
}

.rank-list {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f5f7fa;
    border-radius: 4px;
  }
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #EBEEF5;
}

.rank-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 14px;
}

.name {
  flex: 1;
}

.full-width {
  width: 100%;
}

.half-width {
  width: calc(50% - 10px);
}

.dialog-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #EBEEF5;
}

.dialog-tip {
  color: #909399;
  font-size: 12px;
  margin: 0;
  text-align: center;
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  
  .el-dialog__header {
    margin: 0;
    padding: 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .el-dialog__body {
    padding: 20px;
  }
}

.fullscreen-chart {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  
  .data-details {
    margin-top: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #EBEEF5;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.reserved-area-content {
  padding: 40px;
  text-align: center;
  background: #f5f7fa;
  border-radius: 8px;
  
  p {
    color: #909399;
    font-size: 16px;
  }
}
</style>