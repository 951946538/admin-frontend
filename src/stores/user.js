import { defineStore } from 'pinia'

/**
 * 用户登录态 store
 * 持久化到 localStorage，供路由守卫、顶栏、登录页共同使用
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isLoggedIn: (s) => !!s.user,
    username: (s) => s.user?.username || '',
  },
  actions: {
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout() {
      this.user = null
      localStorage.removeItem('user')
    },
  },
})
