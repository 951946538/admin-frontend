import axios from 'axios'
import request from './request'

/**
 * 用户列表（分页）
 * @param {{page?: number, page_size?: number}} params
 */
export function listUsers(params = {}) {
  return request.get('/users', { params })
}

/**
 * 创建用户
 * @param {{username: string, password: string, nickname?: string, email?: string}} data
 */
export function createUser(data) {
  return request.post('/users', data)
}

/**
 * 删除用户
 * @param {number} id
 */
export function deleteUser(id) {
  return request.delete(`/users/${id}`)
}

/**
 * 健康检查（走根路径，不在 /api/v1 下）
 */
export function checkHealth() {
  return axios.get('/health')
}
