<template>
  <el-aside width="220px" class="aside">
    <div class="logo">
      <el-icon :size="24"><Monitor /></el-icon>
      <span>Admin System</span>
    </div>
    <el-menu
      router
      :default-active="$route.path"
      class="menu"
      background-color="#001529"
      text-color="#a6adb4"
      active-text-color="#ffffff"
    >
      <el-menu-item index="/">
        <el-icon><Odometer /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
// 侧边导航菜单（新增页面时在此登记菜单项 + router/index.js 登记路由）
</script>

<style scoped>
.aside {
  background-color: #001529;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 60px;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
}

.menu {
  border-right: none;
}
</style>
