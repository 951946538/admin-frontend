import axios from 'axios'
import { ElMessage } from 'element-plus'

// axios 实例：统一前缀 /api/v1（开发环境由 vite 代理转发到后端）
const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

// 请求拦截器：自动携带 JWT
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理后端返回的 { code, msg, data } 结构
request.interceptors.response.use(
  (resp) => {
    const res = resp.data
    if (res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.data
  },
  (err) => {
    // 401：登录态失效，清除本地会话并回到登录页
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (location.pathname !== '/login') {
        ElMessage.warning('登录已过期，请重新登录')
        location.href = '/login'
      }
    } else {
      ElMessage.error(err.response?.data?.msg || err.message || '网络错误')
    }
    return Promise.reject(err)
  },
)

export default request
