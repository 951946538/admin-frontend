import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 登录页：独立全屏页面，不套主布局
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/index.vue'),
      meta: { public: true },
    },
    // 主布局下的业务页面
    // 新增页面在此登记，并在 SideMenu 中加菜单项；
    // 仅超管可见的页面加 meta: { requiresSuperAdmin: true }
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/dashboard/index.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/user/index.vue'),
          meta: { requiresSuperAdmin: true },
        },
      ],
    },
  ],
})

// 全局路由守卫：未登录跳登录页；无权限页面跳首页
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.public) {
    return token && user ? { path: '/' } : true
  }
  if (!token || !user) {
    return { path: '/login' }
  }
  if (to.meta.requiresSuperAdmin && user.role !== 'super_admin') {
    return { path: '/' }
  }
  return true
})

export default router
