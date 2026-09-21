<template>
  <div
    ref="bubbleRef"
    class="bubble-wrap"
    :class="{ dragging }"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    :title="userStore.username"
    @pointerdown="onPointerDown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <span class="bubble" :class="{ docked, jelly: jellyActive }">
      {{ userStore.username.charAt(0).toUpperCase() }}
    </span>

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
// 360 风格悬浮头像泡泡（生动版）：
// - 拖动松手后立即弹向最近的屏幕边缘（弹性回弹 + 落地果冻抖动）
// - 静置 1 秒自动缩小半隐停靠，停靠后带呼吸动画
// - 鼠标悬停弹回放大，点击（非拖动）弹出菜单
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const SIZE = 60 // 泡泡基础尺寸（px）
const EDGE_MARGIN = 14 // 贴边时与窗口边缘的间距
const VISIBLE_RATIO = 0.55 // 缩回停靠时露出的比例
const IDLE_MS = 250 // 鼠标移开后多久缩回
const DOCK_AFTER_DRAG_MS = 1050 // 拖动贴边后多久缩回（等弹跳+果冻动画播完）
const SNAP_MS = 450 // 贴边动画时长

const router = useRouter()
const userStore = useUserStore()

const bubbleRef = ref(null)
const pos = reactive({ x: 0, y: 16 })
const dragging = ref(false)
const docked = ref(false)
const jellyActive = ref(false)
const menuVisible = ref(false)
const edge = ref('right')

let idleTimer = null
let snapTimer = null
let jellyTimer = null
let dragStart = { x: 0, y: 0, px: 0, py: 0 }
let moved = false

const menuStyle = computed(() => (edge.value === 'right' ? { right: 0 } : { left: 0 }))

function clampY(y) {
  return Math.min(Math.max(y, 8), window.innerHeight - SIZE - 8)
}

function scheduleIdle(ms = IDLE_MS) {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(dock, ms)
}

/** 弹向最近的水平边缘，落地时触发果冻抖动 */
function snapToEdge() {
  const centerX = pos.x + SIZE / 2
  edge.value = centerX < window.innerWidth / 2 ? 'left' : 'right'
  pos.y = clampY(pos.y)
  pos.x =
    edge.value === 'left'
      ? EDGE_MARGIN
      : window.innerWidth - SIZE - EDGE_MARGIN

  // 落地果冻效果
  clearTimeout(snapTimer)
  clearTimeout(jellyTimer)
  snapTimer = setTimeout(() => {
    jellyActive.value = true
    jellyTimer = setTimeout(() => (jellyActive.value = false), 560)
  }, SNAP_MS)
}

/** 静置超时：缩小半隐停靠 */
function dock() {
  if (dragging.value || menuVisible.value) {
    scheduleIdle()
    return
  }
  const visible = SIZE * VISIBLE_RATIO
  pos.x =
    edge.value === 'left' ? visible - SIZE : window.innerWidth - visible
  docked.value = true
}

/** 从停靠弹回完全显示 */
function undock() {
  docked.value = false
  pos.x =
    edge.value === 'left'
      ? EDGE_MARGIN
      : window.innerWidth - SIZE - EDGE_MARGIN
}

function onPointerDown(e) {
  if (e.button !== 0) return
  clearTimeout(idleTimer)
  clearTimeout(snapTimer)
  clearTimeout(jellyTimer)
  jellyActive.value = false
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
  pos.x = Math.min(
    Math.max(dragStart.px + dx, -SIZE * 0.4),
    window.innerWidth - SIZE * 0.6,
  )
  pos.y = clampY(dragStart.py + dy)
}

function onPointerUp() {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)

  if (!moved) {
    // 未产生位移视为点击：切换菜单
    menuVisible.value = !menuVisible.value
    if (!menuVisible.value) scheduleIdle()
    return
  }
  // 拖动结束：立即弹向边缘，动画播完后静置缩回
  snapToEdge()
  scheduleIdle(DOCK_AFTER_DRAG_MS)
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
  clearTimeout(snapTimer)
  clearTimeout(jellyTimer)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.bubble-wrap {
  position: fixed;
  z-index: 100;
  width: 60px;
  height: 60px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  /* 弹性贴边动画（带过冲回弹） */
  transition:
    left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-wrap.dragging {
  cursor: grabbing;
  transition: none;
}

.bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f8cff, #8a5cf6);
  background-size: 150% 150%;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(79, 140, 255, 0.45);
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    background-position 0.6s ease;
}

.bubble-wrap:hover .bubble {
  transform: scale(1.1);
  background-position: 100% 100%;
  box-shadow: 0 10px 26px rgba(106, 92, 255, 0.6);
}

/* 落地果冻抖动 */
.bubble.jelly {
  animation: jelly 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes jelly {
  0% {
    transform: scale(1, 1);
  }
  30% {
    transform: scale(1.25, 0.72);
  }
  55% {
    transform: scale(0.82, 1.18);
  }
  75% {
    transform: scale(1.08, 0.94);
  }
  100% {
    transform: scale(1, 1);
  }
}

/* 停靠态：缩小 + 呼吸动画 */
.bubble.docked {
  animation: breathe 2.6s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(79, 140, 255, 0.35);
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(0.78);
  }
  50% {
    transform: scale(0.85);
  }
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
  transition: background 0.15s ease, color 0.15s ease;
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
