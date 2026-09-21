<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-circle c1"></div>
    <div class="bg-circle c2"></div>
    <div class="bg-circle c3"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="avatar">
        <el-icon :size="32" color="#fff"><UserFilled /></el-icon>
      </div>
      <h1 class="title">Admin System</h1>
      <p class="subtitle">欢迎回来，请输入用户名登录</p>

      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="username"
            size="large"
            placeholder="用户名（2-64 个字符）"
            :prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="username.trim().length < 2"
          @click="handleLogin"
        >
          {{ loading ? '登录中…' : '登  录' }}
        </el-button>
      </el-form>

      <p class="tip">
        <el-icon><InfoFilled /></el-icon>
        首次登录的用户名将自动注册
      </p>
    </div>

    <div class="footer">Go + Gin · Vue 3 · Element Plus · Naive UI</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled, InfoFilled } from '@element-plus/icons-vue'
import { login } from '../../api/auth'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const loading = ref(false)

async function handleLogin() {
  const name = username.value.trim()
  if (name.length < 2) {
    ElMessage.warning('用户名至少 2 个字符')
    return
  }
  loading.value = true
  try {
    const user = await login(name)
    userStore.setUser(user)
    ElMessage.success(`欢迎，${user.username}`)
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
  padding: 44px 40px 32px;
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
  margin: 0 auto 18px;
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
  margin: 8px 0 28px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
}

.login-btn {
  width: 100%;
  margin-top: 4px;
  font-size: 16px;
  letter-spacing: 6px;
  border: none;
  background: linear-gradient(135deg, #4f8cff, #6a5cff);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.login-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(90, 110, 255, 0.5);
}

.tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 20px 0 0;
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
</style>
