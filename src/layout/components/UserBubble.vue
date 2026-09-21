<template>
  <div
    ref="bubbleRef"
    class="bubble"
    :class="{ docked: docked, dragging: dragging }"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    :title="userStore.username"
    @pointerdown="onPointerDown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    {{ userStore.username.charAt(0).toUpperCase() }}

    <!-- 点击弹出的菜单 -->
    <Transition name="menu-fade">
      <div v-if="menuVisible" class="menu" :style="menuStyle" @pointerdown.stop>
        <div class="menu-item" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// 360 风格悬浮头像泡泡：
// - 可任意拖动
// - 静置 2 秒自动吸附到最近的窗口边缘（缩小并半隐）
// - 鼠标悬停自动弹回，点击（非拖动）弹出菜单
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const SIZE = 60 // 泡泡基础尺寸（px）
const EDGE_MARGIN = 12 // 弹回时与窗口边缘的间距
const VISIBLE_RATIO = 0.55 // 停靠边缘时露出的比例
const IDLE_MS = 2000 // 静置多久后吸附边缘

const router = useRouter()
const userStore = useUserStore()

const bubbleRef = ref(null)
const pos = reactive({ x: 0, y: 16 })
const dragging = ref(false)
const docked = ref(false)
const menuVisible = ref(false)
const edge = ref('right')

let idleTimer = null
let dragStart = { x: 0, y: 0, px: 0, py: 0 }
let moved = false

const menuStyle = computed(() => (edge.value === 'right' ? { right: 0 } : { left: 0 }))

function clampY(y) {
  return Math.min(Math.max(y, 8), window.innerHeight - SIZE - 8)
}

function scheduleIdle() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(dock, IDLE_MS)
}

/** 静置超时：吸附到最近的水平边缘（缩小 + 半隐） */
function dock() {
  if (dragging.value || menuVisible.value) {
    scheduleIdle()
    return
  }
  const centerX = pos.x + SIZE / 2
  edge.value = centerX < window.innerWidth / 2 ? 'left' : 'right'
  const visible = SIZE * VISIBLE_RATIO
  pos.y = clampY(pos.y)
  pos.x = edge.value === 'left' ? visible - SIZE : window.innerWidth - visible
  docked.value = true
}

/** 从边缘弹回完全可见 */
function undock() {
  docked.value = false
  pos.x =
    edge.value === 'left' ? EDGE_MARGIN : window.innerWidth - SIZE - EDGE_MARGIN
}

function onPointerDown(e) {
  if (e.button !== 0) return
  clearTimeout(idleTimer)
  if (docked.value) undock()
  dragging.value = true
  moved = false
  dragStart = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e) {
  if (!dragging.value) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (Math.abs(dx) + Math.abs(dy) > 4) moved = true
  // 拖动范围：允许略超出边缘，松手再拉回
  pos.x = Math.min(
    Math.max(dragStart.px + dx, -SIZE * 0.6),
    window.innerWidth - SIZE * 0.4,
  )
  pos.y = clampY(dragStart.py + dy)
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  // 拉回可视范围
  pos.x = Math.min(
    Math.max(pos.x, EDGE_MARGIN),
    window.innerWidth - SIZE - EDGE_MARGIN,
  )
  if (!moved) {
    // 未产生位移视为点击：切换菜单
    menuVisible.value = !menuVisible.value
    if (!menuVisible.value) scheduleIdle()
  } else {
    scheduleIdle()
  }
}

function onPointerEnter() {
  if (docked.value && !dragging.value) undock()
  clearTimeout(idleTimer)
}

function onPointerLeave() {
  if (!dragging.value && !menuVisible.value) scheduleIdle()
}

function handleLogout() {
  menuVisible.value = false
  userStore.logout()
  router.push('/login')
}

/** 点击泡泡以外区域关闭菜单 */
function onDocClick(e) {
  if (!bubbleRef.value?.contains(e.target)) {
    menuVisible.value = false
    scheduleIdle()
  }
}

function onResize() {
  pos.x = Math.min(
    Math.max(pos.x, EDGE_MARGIN),
    window.innerWidth - SIZE - EDGE_MARGIN,
  )
  pos.y = clampY(pos.y)
}

onMounted(() => {
  pos.x = window.innerWidth - SIZE - 22
  pos.y = 16
  scheduleIdle()
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  clearTimeout(idleTimer)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.bubble {
  position: fixed;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #8a5cf6);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  touch-action: none;
  box-shadow: 0 6px 18px rgba(79, 140, 255, 0.45);
  transition:
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s ease;
}

.bubble:hover {
  box-shadow: 0 8px 22px rgba(79, 140, 255, 0.6);
}

.bubble.dragging {
  cursor: grabbing;
  transition: box-shadow 0.2s ease;
}

/* 停靠边缘时缩小 */
.bubble.docked {
  transform: scale(0.8);
  box-shadow: 0 4px 10px rgba(79, 140, 255, 0.35);
}

/* 弹出菜单 */
.menu {
  position: absolute;
  top: 68px;
  min-width: 124px;
  padding: 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  cursor: default;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  white-space: nowrap;
}

.menu-item:hover {
  background: #f0f5ff;
  color: #409eff;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
