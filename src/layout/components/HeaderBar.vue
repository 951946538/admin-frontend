<template>
  <el-header class="header">
    <div class="header-right">
      <el-dropdown v-if="userStore.isLoggedIn" trigger="click">
        <span class="user-entry">
          <span class="avatar">{{ userStore.username.charAt(0).toUpperCase() }}</span>
          <span class="name">{{ userStore.username }}</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="SwitchButton" @click="handleLogout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid #e4e7ed;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #8a5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.arrow {
  font-size: 12px;
  color: #909399;
}

.user-entry:hover .arrow {
  color: #409eff;
}
</style>
