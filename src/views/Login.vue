<template>
  <div class="login-container">
    <div class="login-box">
      <h2>食品库存管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input 
              v-model="loginForm.captcha" 
              placeholder="请输入验证码"
              prefix-icon="Key"
            />
            <div class="captcha-img" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码">
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginFormRef = ref(null)
const captchaUrl = ref('https://dummyimage.com/120x40/ccc/fff.png&text=1234') // 这里替换为实际的验证码接口

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {        const response = await axios.post('http://localhost:8080/api/login', {
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (response.data.code === 0) {
          ElMessage.success('登录成功')
          localStorage.setItem('token', response.data.data.token)
          router.push('/dashboard')
        } else {
          ElMessage.error(response.data.msg || '登录失败')
          refreshCaptcha()
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
        refreshCaptcha()
      }
    }
  })
}

const refreshCaptcha = () => {
  // 刷新验证码
  loginForm.captcha = ''
  captchaUrl.value = `https://dummyimage.com/120x40/ccc/fff.png&text=${Math.random().toString(36).slice(-4)}`
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #efefef;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #f7f8fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-button {
  width: 35%;
  height: 40px;
  font-size: 16px;
  border-radius: 20px;

  margin: 0 auto;
  /* 可以添加更多自定义样式 */
}
</style>
