<template>
  <el-dialog
    :model-value="modelValue"
    title="新增用户"
    width="420px"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @closed="reset"
  >
    <el-form @submit.prevent="submit">
      <el-form-item label="用户名" label-width="70px" required>
        <el-input
          v-model="username"
          placeholder="2-64 个字符"
          maxlength="64"
          @keyup.enter="submit"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// 新增用户弹窗组件：v-model 控制显隐，成功后上抛 success 事件
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createUser } from '../../../api/user'

defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'success'])

const username = ref('')
const submitting = ref(false)

function reset() {
  username.value = ''
  submitting.value = false
}

async function submit() {
  const name = username.value.trim()
  if (name.length < 2) {
    ElMessage.warning('用户名至少 2 个字符')
    return
  }
  submitting.value = true
  try {
    await createUser({ username: name })
    ElMessage.success('创建成功')
    emit('update:modelValue', false)
    emit('success')
  } finally {
    submitting.value = false
  }
}
</script>
