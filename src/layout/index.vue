<template>
  <el-container class="layout">
    <SideMenu />
    <el-main class="main">
      <router-view />
    </el-main>
    <!-- 固定悬浮在页面右上角的用户头像泡泡 -->
    <UserBubble />
  </el-container>
</template>

<script setup>
// 主布局：左侧菜单 + 内容区 + 悬浮用户头像
import SideMenu from './components/SideMenu.vue'
import UserBubble from './components/UserBubble.vue'
</script>

<style scoped>
.layout {
  height: 100%;
}

.main {
  background-color: #f5f7fa;
}
</style>
