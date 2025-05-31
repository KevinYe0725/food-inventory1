<template>
  <div class="chart-wrapper" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartContainer = ref(null)
let chart = null

const initChart = () => {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.chartData.labels,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: props.chartData.datasets.map(dataset => ({
      name: dataset.label,
      type: 'line',
      data: dataset.data,
      smooth: true,
      lineStyle: {
        color: dataset.borderColor
      },
      itemStyle: {
        color: dataset.borderColor
      }
    }))
  }
  
  chart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

watch(
  () => props.chartData,
  () => {
    updateChart()
  },
  { deep: true }
)
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 150px;
}
</style>