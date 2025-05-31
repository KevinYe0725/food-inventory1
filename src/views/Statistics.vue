<template>
  <div class="statistics">
    <div class="page-header">
      <div class="header-left">
        <img src="/square-logo.png" alt="公司logo" class="company-logo">
        <h2>总体数据查看</h2>
      </div>
    </div>
      <!-- 第一行卡片 -->
    <div class="card-row">
      <!-- 总体数据查看卡片 -->
      <div class="data-card overall-data">
        <div class="card-header">
          <div class="header-title">
            <img src="/square-logo.png" alt="公司logo" class="card-logo">
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
      </div>

      <!-- TOP3品类卡片 -->
      <div class="data-card top-goods">
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
              <el-button link type="primary" @click="showGoodsRank">查看</el-button>
            </div>
          </div>
          <div ref="goodsChartRef" class="chart"></div>
        </div>
      </div>      <!-- TOP3商店卡片 -->
      <div class="data-card top-markets">
        <div class="card-header">
          <div class="header-title">
            <img src="/square-logo.png" alt="商店图标" class="card-logo">
            <h3>本月TOP 3商店</h3>
          </div>
        </div>
        <div class="card-content">
          <div class="rank-list">
            <div v-for="(item, index) in topMarkets" :key="item.marketId" class="rank-item">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="name">{{ item.marketName }}</span>
              <el-button link type="primary" @click="showMarketRank">查看</el-button>
            </div>
          </div>
          <div ref="marketChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 第二行 - 月销售额比对图 -->
    <div class="card-row">
      <div class="data-card full-width">
        <h3>月销售额同比比对图</h3>
        <div class="chart-container">
          <div ref="monthlyCompareChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 第三行 - 预留空间 -->
    <div class="card-row">
      <div class="data-card half-width">
        <h3>预留区域1</h3>
      </div>
      <div class="data-card half-width">
        <h3>预留区域2</h3>
      </div>
    </div>

    <!-- 商品排名弹窗 -->
    <el-dialog
      v-model="goodsRankVisible"
      title="商品销量排行"
      width="600px"
    >
      <el-table :data="allGoods" style="width: 100%">
        <el-table-column prop="goodName" label="商品名称" />
        <el-table-column prop="totalNumber" label="销量" />
      </el-table>
    </el-dialog>

    <!-- 商店排名弹窗 -->
    <el-dialog
      v-model="marketRankVisible"
      title="商店销量排行"
      width="600px"
    >
      <el-table :data="allMarkets" style="width: 100%">
        <el-table-column prop="marketName" label="商店名称" />
        <el-table-column prop="totalNumber" label="销量" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowUp } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'

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
    }
  } catch (error) {
    console.error('获取商品排行失败:', error)
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
    }
  } catch (error) {
    console.error('获取商店排行失败:', error)
  }
}

// 显示商品排行弹窗
const showGoodsRank = () => {
  goodsRankVisible.value = true
}

// 显示商店排行弹窗
const showMarketRank = () => {
  marketRankVisible.value = true
}

onMounted(() => {
  // 初始化所有图表
  initMonthlyCompareChart()
  
  // 获取排行数据
  fetchGoodsRank()
  fetchMarketRank()

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    const charts = [
      goodsChartRef.value,
      marketChartRef.value,
      monthlyCompareChartRef.value
    ]
    charts.forEach(chart => {
      if (chart) {
        echarts.getInstanceByDom(chart)?.resize()
      }
    })
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
  width: 40px;
  height: 40px;
}

.card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
</style>