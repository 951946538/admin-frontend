<template>
  <div class="dashboard">
    <!-- Naive UI 组件示例 -->
    <n-card title="系统概览" size="small">
      <div class="stats">
        <n-statistic label="用户总数" :value="userTotal">
          <template #suffix>
            <span class="unit">人</span>
          </template>
        </n-statistic>
        <n-statistic label="前端框架" value="Vue 3" />
        <n-statistic label="UI 库" value="Element Plus + Naive UI" />
        <n-statistic label="后端" value="Go + Gin + MySQL" />
      </div>
    </n-card>

    <el-card shadow="never" style="margin-top: 16px">
      <template #header>
        <span>环境自检</span>
      </template>
      <el-space wrap>
        <el-tag :type="apiOk ? 'success' : 'danger'">
          {{ apiOk ? '后端接口连接正常' : '后端接口不可用' }}
        </el-tag>
        <el-tag type="info">当前登录：{{ userStore.username || '—' }}</el-tag>
        <el-tag type="info">Vite 开发服务器 :5173</el-tag>
      </el-space>
      <p class="tip">
        提示：此页面同时使用了 Naive UI（上方统计卡片）与 Element Plus（标签、卡片），
        验证两套组件库共存。数据来自后端 <code>GET /api/v1/users</code>。
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { NCard, NStatistic } from 'naive-ui'
import { listUsers } from '../../api/user'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const userTotal = ref(0)
const apiOk = ref(false)

onMounted(async () => {
  try {
    const data = await listUsers({ page: 1, page_size: 1 })
    userTotal.value = data.total ?? 0
    apiOk.value = true
  } catch {
    apiOk.value = false
  }
})
</script>

<style scoped>
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 48px;
}

.unit {
  font-size: 14px;
}

.tip {
  margin: 12px 0 0;
  color: #909399;
  font-size: 13px;
}
</style>
