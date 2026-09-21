import request from './request'

/**
 * 登录（用户名存在则登录成功，不存在则自动注册并登录）
 * @param {string} username
 * @returns {Promise<{id: number, username: string}>}
 */
export function login(username) {
  return request.post('/login', { username })
}
