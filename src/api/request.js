import axios from 'axios'
import { ElMessage } from 'element-plus'

// axios 实例：统一前缀 /api/v1（开发环境由 vite 代理转发到后端）
const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
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
    ElMessage.error(err.response?.data?.msg || err.message || '网络错误')
    return Promise.reject(err)
  },
)

export default request
