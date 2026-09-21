import { defineStore } from 'pinia'

/**
 * 用户登录态 store（token + 用户信息，持久化到 localStorage）
 * 供路由守卫、菜单显隐、请求头共同使用
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    username: (s) => s.user?.username || '',
    role: (s) => s.user?.role || '',
    isSuperAdmin: (s) => s.user?.role === 'super_admin',
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
