<template>
  <el-dropdown v-if="userStore.isLoggedIn" trigger="click" class="bubble-wrap">
    <span class="bubble" :title="userStore.username">
      {{ userStore.username.charAt(0).toUpperCase() }}
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :icon="SwitchButton" @click="handleLogout">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
// 固定悬浮在页面右上角的用户头像泡泡：仅显示头像，点击弹出退出菜单
import { useRouter } from 'vue-router'
import { SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.bubble-wrap {
  position: fixed;
  top: 16px;
  right: 22px;
  z-index: 100;
}

.bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #8a5cf6);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  outline: none;
  box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bubble:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(79, 140, 255, 0.55);
}
</style>
