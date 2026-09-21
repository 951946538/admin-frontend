<template>
  <div class="login-page" :class="{ cheer: cheering }">
    <!-- 背景光斑 -->
    <div class="bg-circle c1"></div>
    <div class="bg-circle c2"></div>
    <div class="bg-circle c3"></div>

    <!-- 闪烁星星 -->
    <span v-for="n in 8" :key="'star' + n" class="star" :class="'s' + n">✦</span>

    <!-- 漂移云朵 -->
    <span class="cloud cloud1">☁️</span>
    <span class="cloud cloud2">☁️</span>

    <!-- 左侧小动物 -->
    <div class="animal a-bear">
      <span class="inner">🐻</span>
    </div>
    <div class="animal a-bunny">
      <span class="inner">🐰</span>
    </div>
    <div class="animal a-koala">
      <span class="inner">🐨</span>
    </div>

    <!-- 右侧小动物 -->
    <div class="animal a-cat">
      <span class="inner">🐱</span>
    </div>
    <div class="animal a-fox">
      <span class="inner">🦊</span>
    </div>
    <div class="animal a-panda">
      <span class="inner">🐼</span>
    </div>

    <!-- 底部漫步的爪印 -->
    <div class="paw-track">
      <span class="paw">🐾</span>
    </div>

    <!-- 登录/注册卡片 -->
    <div class="login-card">
      <div class="avatar">
        <el-icon :size="32" color="#fff"><UserFilled /></el-icon>
      </div>
      <div class="chick">🐥</div>
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
const cheering = ref(false) // 切换模式时小动物集体欢呼
// 两种模式共用一份表单数据，切换时不丢失已输入内容
const form = reactive({ username: '', password: '', confirm: '' })

function switchMode(m) {
  if (mode.value === m) return
  mode.value = m
  form.confirm = ''
  // 欢呼动画
  cheering.value = true
  setTimeout(() => (cheering.value = false), 700)
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
    const session = await login(data.username, data.password)
    userStore.setSession(session.token, session.user)
    ElMessage.success(`欢迎回来，${session.user.username}`)
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
    const session = await register(data.username, data.password)
    userStore.setSession(session.token, session.user)
    ElMessage.success(`注册成功，已自动登录，欢迎 ${session.user.username}`)
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

/* ===== 背景光斑 ===== */
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

/* ===== 星星 ===== */
.star {
  position: absolute;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  animation: twinkle 2.4s ease-in-out infinite;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.s1 { top: 12%; left: 8%; animation-delay: 0s; }
.s2 { top: 22%; left: 30%; animation-delay: 0.6s; font-size: 10px; }
.s3 { top: 8%; left: 55%; animation-delay: 1.2s; }
.s4 { top: 30%; left: 78%; animation-delay: 0.3s; font-size: 11px; }
.s5 { top: 15%; left: 90%; animation-delay: 1.8s; }
.s6 { top: 65%; left: 5%; animation-delay: 1.5s; font-size: 10px; }
.s7 { top: 80%; left: 25%; animation-delay: 0.9s; font-size: 11px; }
.s8 { top: 85%; left: 88%; animation-delay: 2.1s; font-size: 9px; }

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* ===== 云朵 ===== */
.cloud {
  position: absolute;
  font-size: 52px;
  opacity: 0.28;
  animation: drift 40s linear infinite;
}

.cloud1 {
  top: 10%;
  left: -80px;
}

.cloud2 {
  top: 55%;
  left: -140px;
  animation-duration: 55s;
  animation-delay: -20s;
  font-size: 40px;
}

@keyframes drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw + 200px));
  }
}

/* ===== 小动物 ===== */
.animal {
  position: absolute;
  z-index: 1;
  cursor: pointer;
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.35));
  transition: transform 0.2s ease;
}

.animal:hover {
  transform: scale(1.18);
}

.animal .inner {
  display: inline-block;
  line-height: 1;
}

/* 左侧：熊（摇摆） */
.a-bear {
  left: 7%;
  bottom: 16%;
  font-size: 84px;
}

.a-bear .inner {
  transform-origin: 50% 90%;
  animation: sway 3.6s ease-in-out infinite;
}

/* 左侧：兔子（蹦跳） */
.a-bunny {
  left: 14%;
  top: 28%;
  font-size: 58px;
}

.a-bunny .inner {
  animation: hop 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 左侧：考拉（荡秋千） */
.a-koala {
  left: 5%;
  top: 10%;
  font-size: 52px;
}

.a-koala .inner {
  transform-origin: 50% -20%;
  animation: swing 4.2s ease-in-out infinite;
}

/* 右侧：猫（扭动） */
.a-cat {
  right: 8%;
  top: 18%;
  font-size: 56px;
}

.a-cat .inner {
  animation: wiggle 2.8s ease-in-out infinite;
}

/* 右侧：狐狸（弹跳） */
.a-fox {
  right: 14%;
  top: 45%;
  font-size: 62px;
}

.a-fox .inner {
  animation: foxbounce 1.9s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
}

/* 右侧：熊猫（慢滚） */
.a-panda {
  right: 6%;
  bottom: 14%;
  font-size: 80px;
}

.a-panda .inner {
  animation: rock 5s ease-in-out infinite;
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-7deg);
  }
  50% {
    transform: rotate(7deg);
  }
}

@keyframes hop {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  25% {
    transform: translateY(-26px) scale(0.94, 1.08);
  }
  45% {
    transform: translateY(0) scale(1.08, 0.9);
  }
  60% {
    transform: translateY(0) scale(1, 1);
  }
  75% {
    transform: translateY(-10px);
  }
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-14deg);
  }
  50% {
    transform: rotate(14deg);
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-10deg) translateY(0);
  }
  30% {
    transform: rotate(8deg) translateY(-8px);
  }
  60% {
    transform: rotate(-4deg) translateY(0);
  }
}

@keyframes foxbounce {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  35% {
    transform: translateY(-30px) rotate(-8deg);
  }
  55% {
    transform: translateY(0) rotate(0);
  }
  70% {
    transform: translateY(-12px) rotate(6deg);
  }
}

@keyframes rock {
  0%,
  100% {
    transform: rotate(-16deg) translateY(0);
  }
  25% {
    transform: rotate(0) translateY(-8px);
  }
  50% {
    transform: rotate(16deg) translateY(0);
  }
  75% {
    transform: rotate(0) translateY(-8px);
  }
}

/* 欢呼：切换模式时全体跳跃 */
.cheer .animal .inner {
  animation: cheer 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

@keyframes cheer {
  0% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-42px) scale(1.15, 0.9);
  }
  70% {
    transform: translateY(0) scale(0.92, 1.1);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

/* ===== 爪印漫步 ===== */
.paw-track {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.paw {
  position: absolute;
  bottom: 0;
  left: -40px;
  font-size: 22px;
  opacity: 0;
  animation: paw-walk 18s linear infinite;
}

@keyframes paw-walk {
  0% {
    left: -40px;
    opacity: 0;
  }
  5% {
    opacity: 0.5;
  }
  45% {
    opacity: 0.5;
  }
  50% {
    left: 100vw;
    opacity: 0;
  }
  100% {
    left: 100vw;
    opacity: 0;
  }
}

/* ===== 卡片 ===== */
.login-card {
  position: relative;
  z-index: 2;
  width: 380px;
  padding: 40px 40px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  text-align: center;
  animation: card-float 6s ease-in-out infinite;
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 卡片上的小鸡 */
.chick {
  position: absolute;
  top: -34px;
  right: 26px;
  font-size: 34px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  animation: chick-bounce 2.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

@keyframes chick-bounce {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-10px) rotate(8deg);
  }
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  background: linear-gradient(135deg, #4f8cff, #6a5cff, #8a5cf6, #4f8cff);
  background-size: 300% 300%;
  animation: btn-flow 7s linear infinite;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

@keyframes btn-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  z-index: 0;
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

/* 窄屏隐藏小动物，避免遮挡 */
@media (max-width: 1024px) {
  .animal,
  .cloud,
  .paw-track {
    display: none;
  }
}
</style>
