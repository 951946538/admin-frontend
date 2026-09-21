<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>用户管理</span>
        <el-button type="primary" :icon="Plus" @click="createVisible = true">
          新增用户
        </el-button>
      </div>
    </template>

    <!-- 用户表格组件：分页状态由父组件持有并下发 -->
    <UserTable
      v-model:page="page"
      v-model:page-size="pageSize"
      :users="users"
      :total="total"
      :loading="loading"
      @change="load"
      @delete="handleDelete"
    />

    <!-- 新增用户弹窗组件：成功后通知父组件刷新 -->
    <UserCreateDialog v-model="createVisible" @success="reload" />
  </el-card>
</template>

<script setup>
// 页面组件：只负责数据获取与子组件编排，UI 细节下沉到 components/
import { onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import UserTable from './components/UserTable.vue'
import UserCreateDialog from './components/UserCreateDialog.vue'
import { listUsers, deleteUser } from '../../api/user'

const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const createVisible = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await listUsers({
      page: page.value,
      page_size: pageSize.value,
    })
    users.value = data.list ?? []
    total.value = data.total ?? 0
  } finally {
    loading.value = false
  }
}

function reload() {
  page.value = 1
  load()
}

async function handleDelete(row) {
  await deleteUser(row.id)
  ElMessage.success('已删除')
  // 当前页删空后回退一页
  if (users.value.length === 1 && page.value > 1) {
    page.value -= 1
  }
  await load()
}

onMounted(load)
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
