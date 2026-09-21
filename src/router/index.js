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
    // 主布局下的业务页面（新增页面在此登记，并在 SideMenu 中加菜单项）
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
        },
      ],
    },
  ],
})

// 全局路由守卫：未登录跳转登录页
router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem('user')
  if (to.meta.public) {
    return isLoggedIn ? { path: '/' } : true
  }
  return isLoggedIn ? true : { path: '/login' }
})

export default router
