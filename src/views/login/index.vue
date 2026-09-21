<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-circle c1"></div>
    <div class="bg-circle c2"></div>
    <div class="bg-circle c3"></div>

    <!-- 登录/注册卡片 -->
    <div class="login-card">
      <div class="avatar">
        <el-icon :size="32" color="#fff"><UserFilled /></el-icon>
      </div>
      <h1 class="title">Admin System</h1>
      <p class="subtitle">
        {{ mode === 'login' ? '欢迎回来，请登录你的账号' : '创建一个新账号' }}
      </p>

      <!-- 模式切换：滑动指示条 -->
      <div class="mode-switch">
        <div class="mode-indicator" :class="mode"></div>
        <div
          v-for="m in ['login', 'register']"
          :key="m"
          class="mode-item"
          :class="{ active: mode === m }"
          @click="switchMode(m)"
        >
          {{ m === 'login' ? '登 录' : '注 册' }}
        </div>
      </div>

      <!-- 表单区：登录/注册无感切换 -->
      <Transition name="fade-slide" mode="out-in">
        <el-form v-if="mode === 'login'" key="login" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="form.username"
              size="large"
              placeholder="用户名"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button
            class="submit-btn"
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中…' : '登  录' }}
          </el-button>
        </el-form>

        <el-form v-else key="register" @submit.prevent="handleRegister">
          <el-form-item>
            <el-input
              v-model="form.username"
              size="large"
              placeholder="用户名（2-64 个字符）"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              placeholder="密码（至少 6 位）"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.confirm"
              size="large"
              type="password"
              placeholder="确认密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          <el-button
            class="submit-btn"
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中…' : '注册并登录' }}
          </el-button>
        </el-form>
      </Transition>

      <p class="tip">
        <el-icon><InfoFilled /></el-icon>
        {{ mode === 'login' ? '没有账号？点击上方「注册」' : '注册成功后将自动登录' }}
      </p>
    </div>

    <div class="footer">Go + Gin · Vue 3 · Element Plus · Naive UI</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, InfoFilled } from '@element-plus/icons-vue'
import { login, register } from '../../api/auth'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login') // login | register
const loading = ref(false)
// 两种模式共用一份表单数据，切换时不丢失已输入内容
const form = reactive({ username: '', password: '', confirm: '' })

function switchMode(m) {
  if (mode.value === m) return
  mode.value = m
  form.confirm = ''
}

function validate() {
  const name = form.username.trim()
  if (name.length < 2 || name.length > 64) {
    ElMessage.warning('用户名需为 2-64 个字符')
    return null
  }
  if (form.password.length < 6 || form.password.length > 64) {
    ElMessage.warning('密码需为 6-64 位')
    return null
  }
  return { username: name, password: form.password }
}

async function handleLogin() {
  const data = validate()
  if (!data) return
  loading.value = true
  try {
    const user = await login(data.username, data.password)
    userStore.setUser(user)
    ElMessage.success(`欢迎回来，${user.username}`)
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const data = validate()
  if (!data) return
  if (data.password !== form.confirm) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    // 注册成功 → 无感自动登录
    const user = await register(data.username, data.password)
    userStore.setUser(user)
    ElMessage.success(`注册成功，已自动登录，欢迎 ${user.username}`)
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1b2a4e 0%, #1e3c72 40%, #2a5298 100%);
}

/* 漂浮光斑 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  animation: float 12s ease-in-out infinite;
}

.c1 {
  width: 360px;
  height: 360px;
  background: #4f8cff;
  top: -80px;
  left: -60px;
}

.c2 {
  width: 300px;
  height: 300px;
  background: #8a5cf6;
  bottom: -60px;
  right: -40px;
  animation-delay: -4s;
}

.c3 {
  width: 200px;
  height: 200px;
  background: #22d3ee;
  bottom: 20%;
  left: 12%;
  animation-delay: -8s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.06);
  }
}

/* 玻璃拟态卡片 */
.login-card {
  position: relative;
  z-index: 1;
  width: 380px;
  padding: 40px 40px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #8a5cf6);
  box-shadow: 0 8px 20px rgba(79, 140, 255, 0.45);
}

.title {
  margin: 0;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
}

.subtitle {
  margin: 8px 0 22px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
}

/* 模式切换（滑动指示条） */
.mode-switch {
  position: relative;
  display: flex;
  margin-bottom: 24px;
  padding: 4px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
}

.mode-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: 6px;
  background: linear-gradient(135deg, #4f8cff, #6a5cff);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-indicator.register {
  transform: translateX(100%);
}

.mode-item {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s;
}

.mode-item.active {
  color: #fff;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
  font-size: 16px;
  letter-spacing: 4px;
  border: none;
  background: linear-gradient(135deg, #4f8cff, #6a5cff);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(90, 110, 255, 0.5);
}

.tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.footer {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  letter-spacing: 1px;
}

/* 表单切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
