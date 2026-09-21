import request from './request'

/**
 * 登录（用户名 + 密码，密码为 bcrypt 校验）
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id: number, username: string}>}
 */
export function login(username, password) {
  return request.post('/login', { username, password })
}

/**
 * 注册（密码 bcrypt 哈希存储）
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id: number, username: string}>}
 */
export function register(username, password) {
  return request.post('/register', { username, password })
}
