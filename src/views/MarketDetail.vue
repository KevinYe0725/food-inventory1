<template>
  <div class="market-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <img 
          src="/square-conf.png" 
          alt="公司logo" 
          class="company-logo"
          @error="handleImageError"
        >
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
      </div>      <!-- 员工上传数据卡片 -->
      <div class="card staff-upload" @click="showStaffDataDialog">
        <h3>员工上传数据</h3>
        <div class="staff-content">
          <el-icon><List /></el-icon>
          <div class="staff-info">
            点击查看详细数据
          </div>
        </div>
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
    </div>    <!-- 第二行 - 销售数据图表 -->
    <div class="card-row">
      <div class="card full-width" @click="salesChartDialog = true">
        <h3>近30日销售数据</h3>
        <div class="chart-container">
          <!-- 显示最近7天的数据预览 -->
          <div class="preview-chart">
            <div v-for="(item, index) in mockSalesData.salesChart.slice(-7)" 
                :key="index" 
                class="preview-bar"
                :style="{ height: item.sales / 10 + 'px' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行 - 统计图表和审核人 -->
    <div class="card-row">
      <div class="card" @click="orderRemainDialog = true">
        <h3>单日订单剩余</h3>
        <div class="chart-container">
          <div class="preview-chart">
            <div v-for="(item, index) in mockSalesData.orderRemain" 
                :key="index"
                class="preview-circle"
            >
              {{ item.remain }}%
            </div>
          </div>
        </div>
      </div>

      <div class="card" @click="salesRatioDialog = true">
        <h3>产品销售比例</h3>
        <div class="chart-container">
          <div class="preview-pie">
            <div v-for="(item, index) in mockSalesData.salesRatio.slice(0, 2)" 
                :key="index"
                class="preview-slice"
            >
              {{ item.product }}: {{ item.ratio }}%
            </div>
          </div>
        </div>
      </div>

      <div class="card auditor-list" @click="auditorDialogVisible = true">
        <h3>审核人</h3>
        <div class="auditor-items">
          <div v-for="auditor in auditors.slice(0, 3)" :key="auditor.auditorId" class="auditor-item">
            <span>{{ auditor.auditorName }}</span>
            <span class="time">{{ auditor.time }}</span>
          </div>
        </div>
      </div>
    </div>    <!-- 品类管理弹窗 -->
    <div v-if="categoryDialogVisible" class="custom-dialog-overlay" @click.self="categoryDialogVisible = false">
      <div class="custom-dialog">
        <div class="dialog-header">
          <h2>品类管理</h2>
          <div class="dialog-buttons">
            <button class="custom-button import" @click="showImportDialog">批量导入</button>
            <button class="custom-button add" @click="handleAddClick">新增品类</button>
          </div>
        </div>
        
        <div class="dialog-content">
          <table class="custom-table">
            <thead>              <tr>
                <th>商品名称</th>
                <th>早班库存</th>
                <th>中班库存</th>
                <th>晚班库存</th>
                <th>夜班库存</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>              <tr v-for="item in categories" :key="item.goodId">
                <td>{{ item.goodName }}</td>
                <td>{{ item.initialGoods }}</td>
                <td>{{ item.noonGoods }}</td>
                <td>{{ item.afternoonGoods }}</td>
                <td>{{ item.nightGoods }}</td>                <td class="action-buttons">
                  <button class="action-button edit" @click="handleEditCategory(item)">
                    <el-icon><Setting /></el-icon>
                    修改货品
                  </button>
                  <button class="action-button delete" @click="handleDeleteCategory(item)">
                    <el-icon><Delete /></el-icon>
                    删除货品
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 新增品类行 -->
          <div v-if="showNewRow" class="new-category-row">
            <el-form :model="newCategoryData" :rules="rules" ref="newCategoryFormRef" label-width="80px">
              <el-form-item label="品类名称" prop="goodName">
                <el-input 
                  v-model="newCategoryData.goodName" 
                  placeholder="请输入品类名称"
                  clearable
                />
              </el-form-item>
              <el-form-item label="初始库存" prop="initialGoods">
                <el-input-number 
                  v-model="newCategoryData.initialGoods" 
                  :min="0" 
                  :precision="0"
                  :step="1"
                  placeholder="请输入初始库存"
                />
              </el-form-item>
              <el-form-item label="商品图片" prop="image" class="upload-image">
                <el-upload
                  class="image-uploader"
                  action="http://localhost:8080/api/admin/upload"
                  :headers="{ Authorization: token }"
                  :show-file-list="true"
                  :on-success="handleImageSuccess"
                  :before-upload="beforeUpload"
                  :on-error="handleUploadError"
                  accept=".jpg,.jpeg,.png,.gif"
                  :limit="1"
                >
                  <img 
                    v-if="newCategoryData.image" 
                    :src="newCategoryData.image" 
                    class="preview-image"
                  >
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>点击上传图片</span>
                  </div>
                  <template #tip>
                    <div class="upload-tip">只能上传 jpg/png/gif 文件，且不超过 2MB</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <div class="dialog-footer">
            <div v-if="!showNewRow" class="footer-content">
              共{{ categoryCount }}个品类
            </div>
            <div v-else class="footer-actions">
              <el-button @click="handleCancelAdd">取消</el-button>
              <el-button type="primary" @click="handleSaveNewCategory">保存</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
    <div v-if="warningDialogVisible" class="custom-dialog-overlay" @click.self="warningDialogVisible = false">
      <div class="custom-dialog warning-dialog">
        <div class="dialog-header">
          <h2>库存告警</h2>
          <el-button type="primary" @click="handleBatchAdd">一键添加</el-button>
        </div>
        
        <div class="dialog-content">
          <table class="custom-table">
            <thead>
              <tr>
                <th>品类</th>
                <th>初始库存</th>
                <th>剩余比例</th>
                <th>警告时间</th>
                <th>审核员</th>
                <th>近七日警告</th>
                <th>状态</th>
                <th>加入任务单</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in warningList" :key="item.goodId">
                <td>{{ item.goodName }}</td>
                <td>{{ item.initialGoods }}</td>
                <td>{{ item.remainingRate }}%</td>
                <td>{{ item.time }}</td>
                <td>{{ item.auditorName }}</td>
                <td>{{ item.recentTimes }}</td>
                <td>
                  <el-tag :type="item.status === 0 ? 'warning' : 'success'">
                    {{ item.status === 0 ? '未处理' : '已处理' }}
                  </el-tag>
                </td>
                <td>
                  <el-button 
                    type="primary" 
                    link 
                    @click="handleProcessWarning(item)"
                  >
                    处理
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="dialog-footer">
          <el-button type="primary" @click="handleWarningComplete">完成</el-button>
        </div>
      </div>
    </div>

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
    </el-dialog>    <!-- 批量添加确认弹窗 -->
    <el-dialog
      v-model="batchAddDialogVisible"
      title="添加告警商品"
      width="50%"
    >
      <div class="batch-add-container">
        <div v-for="(item, index) in warningGoodsList" :key="index" class="good-item">
          <div class="good-item-header">
            <h3>商品 {{ index + 1 }}</h3>
            <el-button 
              v-if="index !== 0" 
              type="danger" 
              circle 
              @click="removeGoodItem(index)"
              size="small"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <el-form
            :model="item"
            :rules="warningRules"
            :ref="'warningFormRef' + index"
            label-width="100px"
          >
            <el-form-item label="商品名称" prop="goodName">
              <el-input v-model="item.goodName" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="初始库存" prop="initialGoods">
              <el-input-number 
                v-model="item.initialGoods"
                :min="1"
                controls-position="right"
                placeholder="请输入初始库存"
              />
            </el-form-item>
            <el-form-item label="剩余比例" prop="remainingRate">
              <el-input-number
                v-model="item.remainingRate"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
                placeholder="请输入剩余比例"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-form>
        </div>

        <div class="add-button-container">
          <el-button type="primary" plain @click="addNewGoodItem" :disabled="warningGoodsList.length >= 5">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddGoods" :loading="loading">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 员工数据弹窗 -->
    <div v-if="staffDataDialogVisible" class="custom-dialog-overlay" @click.self="staffDataDialogVisible = false">
      <div class="custom-dialog staff-data-dialog">
        <div class="dialog-header">
          <div class="header-left">
            <img src="/square-conf.png" alt="公司logo" class="company-logo">
            <h2>员工上传数据</h2>
          </div>
          <el-button type="primary" link @click="staffDataDialogVisible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="dialog-content">
          <el-row :gutter="20" v-loading="staffDataLoading">
            <el-col :span="8" v-for="item in staffDataList" :key="item.goodId" class="good-card">
              <div class="good-item">
                <div class="good-header">
                  <h3>{{ item.goodName }}</h3>
                </div>
                <div class="good-content">                  <div class="image-section" @click="previewImage(item.image)">
                    <img 
                      :src="item.image" 
                      :alt="item.goodName"
                      @error="handleImageError($event, item)"
                    >
                  </div>
                  <div class="data-section">
                    <div class="auditor">
                      审核人：{{ item.auditorName }}
                    </div>
                    <el-table :data="[item]" size="small">
                      <el-table-column prop="initialGoods" label="初始库存" align="center" />
                      <el-table-column prop="noonGoods" label="中午库存" align="center" />
                      <el-table-column prop="afternoonGoods" label="下午库存" align="center" />
                      <el-table-column prop="nightGoods" label="结束库存" align="center" />
                    </el-table>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

  <!-- 图片预览 -->
  <el-image 
    v-if="currentPreviewImage"
    :src="currentPreviewImage"
    :preview-src-list="[currentPreviewImage]"
    hide-on-click-modal
    class="preview-image"
  />

  <!-- 销售数据弹窗 -->
  <el-dialog
    v-model="salesChartDialog"
    title="近30日销售数据"
    width="80%"
  >
    <div class="dialog-chart">
      <div v-for="(item, index) in mockSalesData.salesChart" 
           :key="index"
           class="chart-item"
      >
        <div class="chart-bar" :style="{ height: item.sales / 5 + 'px' }"></div>
        <div class="chart-label">{{ item.date }}</div>
      </div>
    </div>
  </el-dialog>

  <!-- 订单剩余弹窗 -->
  <el-dialog
    v-model="orderRemainDialog"
    title="单日订单剩余"
    width="60%"
  >
    <div class="dialog-chart remain-chart">
      <div v-for="(item, index) in mockSalesData.orderRemain" 
           :key="index"
           class="remain-item"
      >
        <div class="remain-label">{{ item.time }}</div>
        <div class="remain-progress">
          <div class="progress-bar" :style="{ width: item.remain + '%' }">
            {{ item.remain }}%
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 销售比例弹窗 -->
  <el-dialog
    v-model="salesRatioDialog"
    title="产品销售比例"
    width="60%"
  >
    <div class="dialog-chart ratio-chart">
      <div v-for="(item, index) in mockSalesData.salesRatio" 
           :key="index"
           class="ratio-item"
      >
        <div class="ratio-label">{{ item.product }}</div>
        <div class="ratio-progress">
          <div class="progress-bar" :style="{ width: item.ratio + '%' }">
            {{ item.ratio }}%
          </div>
        </div>
      </div>
    </div>
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
  Delete,
  Close
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 弹窗控制
const salesChartDialog = ref(false)
const orderRemainDialog = ref(false)
const salesRatioDialog = ref(false)
const auditorDialogVisible = ref(false)

// 模拟图表数据
const salesChartData = ref([])
const orderRemainData = ref([])
const salesRatioData = ref([])

// 模拟数据
const mockSalesData = {
  salesChart: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    sales: Math.floor(Math.random() * 1000) + 500
  })),
  orderRemain: [
    { time: '早班', remain: 80 },
    { time: '中班', remain: 55 },
    { time: '晚班', remain: 30 }
  ],
  salesRatio: [
    { product: '食品', ratio: 35 },
    { product: '饮料', ratio: 25 },
    { product: '日用品', ratio: 20 },
    { product: '其他', ratio: 20 }
  ]
}

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

// 员工数据相关状态
const staffDataDialogVisible = ref(false)
const staffDataList = ref([])
const staffDataLoading = ref(false)
const imagePreviewVisible = ref(false)
const currentPreviewImage = ref('')

const categoryDialogVisible = ref(false)
const categories = ref([])
const token = localStorage.getItem('token')


// 模拟员工上传数据
const mockStaffData = [
  {
    goodId: 1,
    goodName: '新鲜豆腐',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45951O5.jpg',
    initialGoods: 100,
    noonGoods: 65,
    afternoonGoods: 30,
    nightGoods: 10,
    auditorName: '张三'
  },
  {
    goodId: 2,
    goodName: '酱油',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45952X1.jpg',
    initialGoods: 50,
    noonGoods: 42,
    afternoonGoods: 35,
    nightGoods: 28,
    auditorName: '李四'
  },
  {
    goodId: 3,
    goodName: '辣椒酱',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45953R2.jpg',
    initialGoods: 80,
    noonGoods: 65,
    afternoonGoods: 45,
    nightGoods: 30,
    auditorName: '王五'
  },
  {
    goodId: 4,
    goodName: '饮料',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45954S3.jpg',
    initialGoods: 200,
    noonGoods: 150,
    afternoonGoods: 90,
    nightGoods: 45,
    auditorName: '赵六'
  },
  {
    goodId: 5,
    goodName: '方便面',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45955T4.jpg',
    initialGoods: 150,
    noonGoods: 120,
    afternoonGoods: 80,
    nightGoods: 35,
    auditorName: '张三'
  },
  {
    goodId: 6,
    goodName: '火锅底料',
    image: 'https://img.restaurant-bot.com/uploads/202309/1-23090G45956U5.jpg',
    initialGoods: 60,
    noonGoods: 48,
    afternoonGoods: 35,
    nightGoods: 22,
    auditorName: '李四'
  }
]

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

// 显示品类管理弹窗
const showCategoryDialog = async () => {
  categoryDialogVisible.value = true
  await fetchCategories()
}

// 修改商品信息
const handleEditCategory = async (item) => {
  try {
    const response = await fetch('http://localhost:8080/admin/market/good', {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        marketId: parseInt(route.params.marketId),
        goodId: item.goodId,
        initialGoods: item.initialGoods,
        noonGoods: item.noonGoods,
        afternoonGoods: item.afternoonGoods,
        nightGoods: item.nightGoods,
        date: selectedDate.value
      })
    })
    
    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('修改成功')
      await fetchCategories() // 刷新数据
    } else {
      ElMessage.error(result.msg || '修改失败')
    }
  } catch (error) {
    console.error('修改商品信息失败:', error)
    ElMessage.error('修改商品信息失败')
  }
}

// 删除商品
const handleDeleteCategory = async (item) => {
  try {
    const marketId = route.params.marketId
    const response = await fetch(
      `http://localhost:8080/admin/market/good?marketId=${marketId}&goodId=${item.goodId}&date=${selectedDate.value}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: token
        }
      }
    )
    
    if (response.status === 200) {
      ElMessage.success('删除成功')
      await fetchCategories() // 刷新数据
    } else {
      const result = await response.json()
      ElMessage.error(result.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败')
  }
}

// 获取商品品类列表
const fetchCategories = async () => {
  try {
    const marketId = route.params.marketId
    const date = selectedDate.value
    const response = await fetch(
      `http://localhost:8080/admin/market/good?marketId=${marketId}&date=${date}`,
      {
        headers: {
          Authorization: token
        }
      }
    )
    const result = await response.json()
    if (result.code === 0) {
      categories.value = result.data.goodList
      categoryCount.value = result.data.goodList.length
    } else {
      // 如果接口调用失败，使用模拟数据
      categories.value = mockCategories
      categoryCount.value = mockCategories.length
      ElMessage.warning('使用模拟数据显示')
    }
  } catch (error) {
    console.error('获取品类数据失败:', error)
    // 发生错误时使用模拟数据
    categories.value = mockCategories
    categoryCount.value = mockCategories.length
    ElMessage.warning('使用模拟数据显示')
  }
}

// 显示批量导入对话框
const showImportDialog = () => {
  importDialogVisible.value = true
  categoryDialogVisible.value = false
}

// 显示新增品类对话框
const showAddCategoryDialog = () => {
  addCategoryDialogVisible.value = true
  categoryDialogVisible.value = false
}

// 处理新增品类按钮点击
const handleAddClick = () => {
  showNewRow.value = true
}

// 处理新品类保存
const handleSaveNewCategory = async () => {
  const formRef = ref(null)
  
  try {
    await formRef.value?.validate()
  } catch (error) {
    return // 验证未通过
  }

  if (!newCategoryData.value.goodName.trim()) {
    ElMessage.warning('请输入商品名称')
    return
  }
  if (newCategoryData.value.initialGoods <= 0) {
    ElMessage.warning('请输入有效的初始库存数量')
    return
  }
  if (!newCategoryData.value.image) {
    ElMessage.warning('请上传商品图片')
    return
  }

  try {
    const response = await fetch('http://localhost:8080/admin/market/good/add', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        marketId: parseInt(route.params.marketId),
        goodName: newCategoryData.value.goodName,
        date: selectedDate.value,
        initialGoods: newCategoryData.value.initialGoods,
        image: newCategoryData.value.image
      })
    })

    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('添加成功')
      showNewRow.value = false
      newCategoryData.value = { goodName: '', initialGoods: 0, image: '' }
      await fetchCategories() // 刷新列表
    } else {
      ElMessage.error(result.msg || '添加失败')
    }
  } catch (error) {
    console.error('添加品类失败:', error)
    ElMessage.error('添加品类失败')
  }
}

// 处理图片上传前的验证
const beforeUpload = (file) => {
  const isImage = /^image\/(jpeg|png|gif)$/.test(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理图片上传成功
const handleImageSuccess = (response) => {
  if (response.code === 0) {
    newCategoryData.value.image = response.data.url // 假设后端返回的图片URL在 response.data.url 中
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.msg || '图片上传失败')
    newCategoryData.value.image = ''
  }
}

// 处理图片上传失败
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败，请重试')
  newCategoryData.value.image = ''
}

const defaultImage = ref('/square-logo.png')

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = defaultImage.value
  ElMessage.warning('图片加载失败，已使用默认图片')
}

// 预览图片
const previewImage = (imageUrl) => {
  if (!imageUrl) {
    ElMessage.warning('没有可预览的图片')
    return
  }
  currentPreviewImage.value = imageUrl
  imagePreviewVisible.value = true
}

// 取消新增
const handleCancelAdd = () => {
  showNewRow.value = false
  newCategoryData.value = { goodName: '', initialGoods: 0, image: '' }
}

// 在组件挂载时获取市场详情
onMounted(() => {
  const marketId = route.params.marketId
  if (marketId) {
    fetchMarketDetail(marketId)
  }
})

const warningDialogVisible = ref(false)
const warningList = ref([])
const batchAddDialogVisible = ref(false)
const loading = ref(false)

// 修改为商品数组
const warningGoodsList = ref([{
  goodName: '',
  initialGoods: 0,
  remainingRate: 0,
  time: '',
  auditorName: '',
  recentTimes: 0,
  status: 0
}])

// 表单验证规则
const warningRules = {
  goodName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  initialGoods: [
    { required: true, message: '请输入初始库存', trigger: 'blur' },
    { type: 'number', min: 1, message: '库存必须大于0', trigger: 'blur' }
  ]
}

// 显示警告弹窗
const showWarningDialog = () => {
  warningDialogVisible.value = true
  fetchWarningList()
}

// 打开批量添加对话框
const openBatchAddDialog = () => {
  batchAddDialogVisible.value = true
  // 这里需要从API获取告警列表数据
  fetchWarningList()
}

// 获取告警列表
const fetchWarningList = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/admin/warnings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    if (response.ok) {
      warningList.value = data.list
    } else {
      ElMessage.error(data.message || '获取告警列表失败')
    }
  } catch (error) {
    ElMessage.error('获取告警列表失败')
    console.error('获取告警列表错误:', error)
  } finally {
    loading.value = false
  }
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedWarnings.value = selection
}

// 处理单个警告
const handleProcessWarning = async (item) => {
  try {
    const response = await fetch('http://localhost:8080/admin/market/warning/process', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        marketId: parseInt(route.params.marketId),
        goodId: item.goodId,
        date: selectedDate.value
      })
    })

    const result = await response.json()
    if (result.code === 0) {
      ElMessage.success('处理成功')
      item.status = 1 // 更新状态为已处理
    } else {
      ElMessage.error(result.msg || '处理失败')
    }
  } catch (error) {
    console.error('处理告警失败:', error)
    ElMessage.error('处理失败')
  }
}

// 打开添加商品对话框
const handleBatchAdd = () => {
  // 重置表单数据
  warningGoodsList.value = [{
    goodName: '',
    initialGoods: 0,
    remainingRate: 0,
    time: new Date().toLocaleString(),
    auditorName: '当前审核员', // 这里可以替换为实际的审核员名称
    recentTimes: 0,
    status: 0
  }]
  batchAddDialogVisible.value = true
}

// 添加新的商品项
const addNewGoodItem = () => {
  if (warningGoodsList.value.length >= 5) {
    ElMessage.warning('最多只能同时添加5个商品')
    return
  }
  
  warningGoodsList.value.push({
    goodName: '',
    initialGoods: 0,
    remainingRate: 0,
    time: new Date().toLocaleString(),
    auditorName: '当前审核员',
    recentTimes: 0,
    status: 0
  })
}

// 移除商品项
const removeGoodItem = (index) => {
  warningGoodsList.value.splice(index, 1)
}

// 确认添加商品
const confirmAddGoods = async () => {
  try {
    loading.value = true

    // 验证所有表单
    for (let i = 0; i < warningGoodsList.value.length; i++) {
      const item = warningGoodsList.value[i]
      if (!item.goodName || !item.initialGoods) {
        ElMessage.warning(`请完善第 ${i + 1} 个商品的信息`)
        return
      }
    }

    // 批量添加商品
    for (const item of warningGoodsList.value) {
      const newGoodId = Date.now() + Math.random() // 使用时间戳加随机数作为临时ID

      const newWarning = {
        goodId: newGoodId,
        goodName: item.goodName,
        initialGoods: item.initialGoods,
        remainingRate: item.remainingRate,
        time: item.time,
        auditorName: item.auditorName,
        recentTimes: 0,
        status: 0
      }

      warningList.value.unshift(newWarning)
    }
    
    ElMessage.success(`成功添加 ${warningGoodsList.value.length} 个商品`)
    batchAddDialogVisible.value = false
    
  } catch (error) {
    console.error('添加商品失败:', error)
    ElMessage.error('添加失败')
  } finally {
    loading.value = false
  }
}

// 显示员工数据弹窗
const showStaffDataDialog = async () => {
  staffDataDialogVisible.value = true
  staffDataLoading.value = true

  try {
    // 尝试从API获取数据
    const response = await fetch('http://localhost:8080/admin/market/staff/data', {
      headers: {
        Authorization: token
      }
    })
    
    const result = await response.json()
    if (result.code === 0) {
      staffDataList.value = result.data.goodList
      return
    }
  } catch (error) {
    console.log('API调用失败，使用模拟数据')
  }

  // 如果API调用失败，使用模拟数据
  await new Promise(resolve => setTimeout(resolve, 500)) // 模拟加载延迟
  staffDataList.value = mockStaffData
  ElMessage.warning('当前使用模拟数据显示')
}

</script>

<style scoped>
.market-detail {
  height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.company-logo {
  position: relative;

  top: 4px;
  height: 35px;
}

.header-left {
  display: flex;
  align-items: center;
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
  background-color: #d9f1c7;
  cursor: pointer;

  .icons {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
}

.inventory-warning {
  background-color: #f9f9d4;
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
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.preview-chart {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 100px;
}

.preview-bar {
  width: 20px;
  background-color: #409eff;
  border-radius: 2px;
  min-height: 20px;
}

.preview-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 10px;
}

.preview-pie {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-slice {
  padding: 8px;
  background-color: #f0f9ff;
  border-radius: 4px;
  text-align: center;
}

.dialog-chart {
  min-height: 300px;
  padding: 20px;
}

.chart-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 4px;
}

.chart-bar {
  width: 20px;
  background-color: #409eff;
  border-radius: 2px;
  min-height: 20px;
  transition: height 0.3s ease;
}

.chart-label {
  font-size: 12px;
  color: #666;
  transform: rotate(-45deg);
  white-space: nowrap;
}

.remain-chart {
  padding: 20px;
}

.remain-item {
  margin-bottom: 20px;
}

.remain-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.remain-progress {
  height: 24px;
  background-color: #f0f2f5;
  border-radius: 12px;
  overflow: hidden;
}

.ratio-chart {
  padding: 20px;
}

.ratio-item {
  margin-bottom: 20px;
}

.ratio-label {
  margin-bottom: 8px;
  font-weight: bold;
}

.ratio-progress {
  height: 24px;
  background-color: #f0f2f5;
  border-radius: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 12px;
  transition: width 0.3s ease;
}

.full-width .chart-container {
  height: 150px;
}
</style>
