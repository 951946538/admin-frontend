<template>
  <el-container class="layout">
    <SideMenu />
    <el-container>
      <HeaderBar />
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 主布局：左侧菜单 + 顶栏 + 内容区（内容由子路由渲染）
import SideMenu from './components/SideMenu.vue'
import HeaderBar from './components/HeaderBar.vue'
</script>

<style scoped>
.layout {
  height: 100%;
}

.main {
  background-color: #f5f7fa;
}
</style>
