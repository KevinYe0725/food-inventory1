<template>
  <el-form 
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
  >
    <el-form-item label="店名" prop="marketName">
      <el-input v-model="form.marketName" placeholder="请输入" />
    </el-form-item>
    
    <el-form-item label="地址" prop="address">
      <el-input v-model="form.address" placeholder="请输入" />
    </el-form-item>
    
    <el-form-item label="负责人" prop="person">
      <el-input v-model="form.person" placeholder="请输入" />
    </el-form-item>
    
    <el-form-item label="邮件" prop="email">
      <el-input v-model="form.email" placeholder="请输入" />
    </el-form-item>
    
    <el-form-item label="联系电话" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入" />
    </el-form-item>

    <el-form-item label="商家图片">
      <el-upload
        class="image-upload"
        action="http://localhost:8080/api/upload"
        :show-file-list="false"
        :on-success="handleImageSuccess"
        :before-upload="beforeImageUpload"
      >
        <img v-if="form.image" :src="form.image" class="preview-image">
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">确认</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  market: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const form = ref({
  marketName: '',
  address: '',
  person: '',
  email: '',
  phone: '',
  image: ''
})

const rules = {
  marketName: [{ required: true, message: '请输入店名', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  person: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

onMounted(() => {
  if (props.market) {
    form.value = { ...props.market }
  }
})

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', form.value)
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

const handleImageSuccess = (response) => {
  form.value.image = response.data.url
}

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
</script>

<style scoped>
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

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>