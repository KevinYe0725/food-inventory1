<template>
  <div class="market-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <img src="/square-logo.png" alt="公司logo" class="company-logo">
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 第一行卡片 -->
    <div class="card-row">
      <!-- 店家信息卡片 -->
      <div class="card market-info">
        <h3>{{ marketInfo.marketName }}</h3>
        <div class="info-item">
          <el-icon><Phone /></el-icon>
          <span>{{ marketInfo.phone }}</span>
        </div>
        <div class="info-item">
          <el-icon><Message /></el-icon>
          <span>{{ marketInfo.email }}</span>
        </div>
      </div>

      <!-- 品类管理卡片 -->
      <div class="card category-manage" @click="showCategoryDialog">
        <div class="card-header">
          <h3>品类管理</h3>
        </div>
        <div class="card-content">
          <div class="icons">
            <el-icon><List /></el-icon>
            <el-icon><Setting /></el-icon>
          </div>
          <div class="category-count">
            品类数量：{{ categoryCount }}
          </div>
        </div>
      </div>

      <!-- 员工上传数据卡片 -->
      <div class="card staff-upload">
        <h3>员工上传数据</h3>
        <!-- 员工上传数据内容 -->
      </div>

      <!-- 导出Excel卡片 -->
      <div class="card export-excel" @click="handleExportExcel">
        <h3>导出Excel</h3>
        <div class="icons">
          <el-icon><Document /></el-icon>
          <el-icon><TrendCharts /></el-icon>
        </div>
      </div>

      <!-- 库存告警卡片 -->
      <div class="card inventory-warning" @click="showWarningDialog">
        <h3>库存告警</h3>
        <div class="warning-content">
          <el-icon><Box /></el-icon>
          <span class="warning-count">今日告警: {{ warningCount }}</span>
          <el-icon><Warning /></el-icon>
        </div>
      </div>
    </div>

    <!-- 第二行 - 销售数据图表 -->
    <div class="card-row">
      <div class="card full-width">
        <h3>近30日销售数据</h3>
        <div class="chart-container">
          <!-- 图表将在后续添加 -->
        </div>
      </div>
    </div>

    <!-- 第三行 - 统计图表和审核人 -->
    <div class="card-row">
      <div class="card">
        <h3>单日订单剩余</h3>
        <div class="chart-container">
          <!-- 图表将在后续添加 -->
        </div>
      </div>

      <div class="card">
        <h3>产品销售比例</h3>
        <div class="chart-container">
          <!-- 图表将在后续添加 -->
        </div>
      </div>

      <div class="card auditor-list" @click="showAuditorDialog">
        <h3>审核人</h3>
        <div class="auditor-items">
          <div v-for="auditor in auditors.slice(0, 3)" :key="auditor.auditorId" class="auditor-item">
            <span>{{ auditor.auditorName }}</span>
            <span class="time">{{ auditor.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 品类管理弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="品类管理"
      width="80%"
    >
      <div class="dialog-header">
        <div class="dialog-buttons">
          <el-button type="primary" @click="showImportDialog">批量导入</el-button>
          <el-button type="primary" @click="showAddCategoryDialog">新增品类</el-button>
        </div>
      </div>
      <el-table :data="categories" style="width: 100%">
        <el-table-column prop="goodName" label="商品名称" />
        <el-table-column prop="initialGoods" label="早班库存" />
        <el-table-column prop="noonGoods" label="中班库存" />
        <el-table-column prop="afternoonGoods" label="晚班库存" />
        <el-table-column prop="nightGoods" label="夜班库存" />
        <el-table-column prop="auditorName" label="审核人" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button type="text" @click="handleEditCategory(scope.row)">
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button type="text" @click="handleDeleteCategory(scope.row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入"
      width="30%"
    >
      <el-upload
        class="upload-demo"
        action="/api/admin/good/import"
        :headers="{ Authorization: token }"
        :on-success="handleImportSuccess"
      >
        <el-button type="primary">点击上传</el-button>
      </el-upload>
    </el-dialog>

    <!-- 新增品类弹窗 -->
    <el-dialog
      v-model="addCategoryDialogVisible"
      title="新增品类"
      width="30%"
    >
      <el-form :model="newCategory" label-width="80px">
        <el-form-item label="品类名称">
          <el-input v-model="newCategory.goodName" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="newCategory.image" :src="newCategory.image" class="avatar">
            <el-icon v-else><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCategoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 库存告警弹窗 -->
    <el-dialog
      v-model="warningDialogVisible"
      title="库存告警"
      width="70%"
    >
      <div class="dialog-header">
        <el-button type="primary" @click="handleAddWarning">一键添加</el-button>
      </div>
      <el-table :data="warningList" style="width: 100%">
        <el-table-column prop="goodName" label="商品名称" />
        <el-table-column prop="initialGoods" label="初始库存" />
        <el-table-column prop="remainingRate" label="剩余率" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="auditorName" label="审核人" />
        <el-table-column prop="recentTimes" label="近期次数" />
        <el-table-column prop="assignmentStatus" label="状态">
          <template #default="scope">
            {{ scope.row.assignmentStatus === 0 ? '未处理' : '已处理' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 审核人弹窗 -->
    <el-dialog
      v-model="auditorDialogVisible"
      title="审核人列表"
      width="50%"
    >
      <el-table :data="auditors" style="width: 100%">
        <el-table-column prop="auditorName" label="审核人" />
        <el-table-column prop="marketName" label="商店" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Phone,
  Message,
  List,
  Setting,
  Document,
  TrendCharts,
  Box,
  Warning,
  Plus,
  Delete
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 模拟市场详情数据
const marketInfo = ref({
  id: null,
  marketName: '',
  phone: '',
  email: '',
  address: '',
  goodsCount: 0,
  staffCount: 0,
  hasWarning: false,
  hasFeedback: false,
  lastUpdate: ''
})

// 其他状态数据
const selectedDate = ref(new Date().toISOString().split('T')[0])
const categoryCount = ref(0)
const warningCount = ref(0)
const auditors = ref([
  { auditorId: 1, auditorName: '张三', time: '09:30' },
  { auditorId: 2, auditorName: '李四', time: '10:45' },
  { auditorId: 3, auditorName: '王五', time: '14:20' }
])

// 获取市场详情
const fetchMarketDetail = async (marketId) => {
  try {
    // 这里使用模拟数据，实际项目中应该调用API
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
      }
    ]

    const market = mockMarkets.find(m => m.id === parseInt(marketId))
    if (market) {
      marketInfo.value = market
      categoryCount.value = Math.floor(Math.random() * 50) + 10
      warningCount.value = Math.floor(Math.random() * 5)
    } else {
      ElMessage.error('未找到该商家信息')
      router.push('/markets')
    }
  } catch (error) {
    console.error('获取商家详情失败:', error)
    ElMessage.error('获取商家详情失败')
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 日期变更处理
const handleDateChange = (val) => {
  // 根据选择的日期更新模拟数据
  const randomData = {
    goodsCount: Math.floor(Math.random() * 200) + 50,
    staffCount: Math.floor(Math.random() * 15) + 5,
    categoryCount: Math.floor(Math.random() * 50) + 10,
    warningCount: Math.floor(Math.random() * 5),
    auditors: [
      { auditorId: 1, auditorName: '张三', time: '09:30' },
      { auditorId: 2, auditorName: '李四', time: '10:45' },
      { auditorId: 3, auditorName: '王五', time: '14:20' }
    ].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1)
  }

  // 更新显示的数据
  marketInfo.value.goodsCount = randomData.goodsCount
  marketInfo.value.staffCount = randomData.staffCount
  categoryCount.value = randomData.categoryCount
  warningCount.value = randomData.warningCount
  auditors.value = randomData.auditors

  ElMessage.success(`已加载 ${val} 的数据`)
}

// 导出Excel
const handleExportExcel = () => {
  const date = selectedDate.value || new Date().toISOString().split('T')[0]
  ElMessage.success(`正在导出${date}的Excel数据...`)
}

// 在组件挂载时获取市场详情
onMounted(() => {
  const marketId = route.params.marketId
  if (marketId) {
    fetchMarketDetail(marketId)
  }
})
</script>

<style scoped>
.market-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.company-logo {
  width: 40px;
  height: 40px;
}

.card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 200px;
  flex: 1;
}

.market-info {
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }
}

.category-manage {
  background-color: #f5f7fa;
  cursor: pointer;

  .icons {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }

  .category-count {
    text-align: center;
  }
}

.export-excel {
  background-color: #f0f9eb;
  cursor: pointer;

  .icons {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
}

.inventory-warning {
  background-color: #fdf6ec;
  cursor: pointer;

  .warning-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
  }

  .warning-count {
    margin: 0 10px;
  }
}

.full-width {
  width: 100%;
}

.chart-container {
  height: 300px;
  margin-top: 20px;
}

.auditor-list {
  .auditor-items {
    margin-top: 10px;
  }

  .auditor-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #ebeef5;
  }

  .time {
    color: #909399;
    font-size: 12px;
  }
}

.avatar-uploader {
  text-align: center;
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 4px;
  }

  .el-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.back-button {
  margin-top: 20px;
  text-align: right;
}
</style>
