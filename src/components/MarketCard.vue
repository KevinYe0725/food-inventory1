<template>
  <div class="market-card" @click="$emit('click', market)">
    
    <!-- 内容区整体 -->
    <div class="card-content">
      <!-- 商家名 -->
      <div class="market-name">{{ market.marketName }}</div>
      <!-- 头像 -->
      <el-avatar :size="68" src="/square-logo.png" class="market-avatar" />
      <!-- 电话邮箱 -->
      <div class="contact">
        <div><el-icon><Phone /></el-icon><span>{{ market.phone }}</span></div>
        <div><el-icon><Message /></el-icon><span>{{ market.email }}</span></div>
      </div>
       
    </div>
    <!-- 设置按钮 -->
    <el-icon class="settings" @click.stop="handleSettings"><Setting /></el-icon>
    <!-- 导入按钮 -->
    <button class="import-btn" @click.stop="handleImport">导入</button>
  </div>
</template>

<script setup>
import { 
  Setting, 
  Warning, 
  QuestionFilled, 
  Location, 
  Phone, 
  Message
} from '@element-plus/icons-vue'
import { ref } from 'vue'
const props =  defineProps({
  market: {
    type: Object,
    required: true
  }
})
const showSettingsDialog = ref(false)
const showImportDialog = ref(false)
const emit = defineEmits(['settings', 'import'])
const handleSettings = () => {
  emit('settings', props.market)
  showSettingsDialog.value = true
}
const handleImport = () => {
  showImportDialog.value = true
}
</script>

<style scoped>
.market-card {
  background: white;
  border-radius: 36px;
  width: 400px;
  height: 247px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}
.market-name{
  position: absolute;
  top: 15px;
  left: 19px;
  font-size: 20px;
  color: #4b4b4e;

  font-weight: 600;
}
.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.settings {
  position: absolute;
  top: 15px;
  right: 20px;
  color: #909399;
  cursor: pointer;
}

.settings:hover {
  color: #409eff;
}

.info-section {
  margin-bottom: 15px;
}

.address {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.address .el-icon {
  margin-top: 3px;
  color: #909399;
}

.contact {
  position: absolute;
  bottom: 7px;
  left: 19px;
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: start;
  display: flex;
  gap: 3px;              /* 图标和文字的间距 */
  margin-bottom: 3px;    /* 可选：行间距 */
}

.contact p {
  display: flex;
  gap: 5px;
  margin: 0;
  color: #606266;
  font-size: 14px;
  
}
.contact span{
  position: relative;
  left: 2px;
  bottom: 3px;
}
.contact .el-icon {
  color: #909399;
  position: relative;
  left: 0;
}
.import-btn{
  width: 60px;
  height: 20px;
  position: absolute;
  bottom: 14px;
  right: 14px;
  color: black;
  border: none;
  align-items: center;
  justify-content: center;
  display: flex;
  border-radius: 36px;
  background-color: white;
  border: 1px solid #e5e5e5;
  font-size: 12px;
}
.market-avatar{
  position: absolute;
  top: 63px;
  left: 19px;
  height: 100px;
  width: 100px;
  border-radius: 36px;
}

.footer {
  text-align: right;
}

</style>