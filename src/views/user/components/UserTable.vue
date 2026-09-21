<template>
  <div>
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="username" label="用户名" min-width="200" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm
            title="确定删除该用户？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="emit('delete', row)"
          >
            <template #reference>
              <el-button type="danger" link size="small" :icon="Delete">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      class="pagination"
      @update:current-page="(v) => emit('update:page', v)"
      @update:page-size="(v) => emit('update:pageSize', v)"
      @change="emit('change')"
    />
  </div>
</template>

<script setup>
// 用户表格组件：纯展示 + 事件上抛，不直接调用 API
import { Delete } from '@element-plus/icons-vue'

defineProps({
  users: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:page', 'update:pageSize', 'change', 'delete'])
</script>

<style scoped>
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
