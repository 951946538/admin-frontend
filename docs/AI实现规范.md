# AI 实现规范（前端）

> 本文档是所有 AI 助手（及开发者）在本仓库实现功能时**必须遵守**的规范。
> 每次实现新功能前请先通读本文档；规范如有更新须同步登记到文末变更记录。

## 1. 目录结构（强制）

```
admin-frontend/
├── index.html
├── vite.config.js           # 开发服务器 + /api 代理到后端 8080
├── src/
│   ├── main.js              # 入口：注册插件、全局样式
│   ├── App.vue              # 根组件，保持极简（仅 router-view）
│   ├── api/                 # 接口封装层：一个后端模块一个文件
│   │   ├── request.js       # axios 实例 + 拦截器（唯一创建处）
│   │   ├── auth.js
│   │   └── user.js
│   ├── router/index.js      # 路由（嵌套 Layout 结构）
│   ├── stores/              # Pinia 状态（一个领域一个文件）
│   │   └── user.js
│   ├── layout/              # 布局
│   │   ├── index.vue        # 主布局（侧边栏 + 顶栏 + 内容区）
│   │   └── components/      # 布局子组件（SideMenu、HeaderBar…）
│   ├── styles/              # 全局样式
│   ├── views/               # 页面（多级目录，一个模块一个目录）
│   │   ├── login/index.vue
│   │   ├── dashboard/index.vue
│   │   └── user/
│   │       ├── index.vue        # 页面入口：只做数据编排
│   │       └── components/      # 页面私有组件
│   │           ├── UserTable.vue
│   │           └── UserCreateDialog.vue
│   └── components/          # 跨页面通用组件（预留）
├── log/                     # 运行日志目录（预留）
└── docs/                    # 文档
```

## 2. 组件式开发（强制）

- **页面 = 编排**：`views/<模块>/index.vue` 只负责获取数据、持有状态、组合子组件，禁止堆砌 UI 代码
- **UI 下沉**：表格、弹窗、表单等一律拆成 `views/<模块>/components/` 下的独立组件；跨页面复用的放 `src/components/`
- **组件通信**：props 下发 + emits 上抛；弹窗显隐用 `v-model`；禁止子组件直接调用 API 改父组件状态
- **命名**：页面目录小驼峰（`user/`）；组件文件大驼峰（`UserTable.vue`）；页面入口固定 `index.vue`
- **新增页面三步**：`views/<模块>/index.vue` → `router/index.js` 登记子路由 → `layout/components/SideMenu.vue` 加菜单项

## 3. 编码约定

- 统一使用 `<script setup>` 组合式 API，禁止 Options API
- 接口调用只通过 `src/api/`，页面/组件禁止直接 `import axios`
- 后端响应统一 `{ code, msg, data }`，由 `request.js` 拦截器解包，组件里拿到的直接是 `data`
- 登录态、用户信息统一走 `stores/user.js`，禁止各处散落 `localStorage` 读写（路由守卫除外）
- UI 库：Element Plus 为主（全局注册），Naive UI 按需引入（`import { NCard } from 'naive-ui'`）
- 样式：组件内 `scoped`；全局样式只写 `styles/index.css`
- 注释使用中文；复杂逻辑必须注释

## 4. 角色与权限（强制）

- 登录态与角色统一从 `stores/user.js` 读取（`token` + `user.role`），禁止在组件中散落 localStorage 读写
- 所有请求自动携带 `Authorization: Bearer <token>`（`api/request.js` 统一处理）；收到 401 自动清除会话并回登录页，**不要在各页面单独处理 401**
- 受限页面**三件套缺一不可**：
  1. 路由 `meta: { requiresSuperAdmin: true }`（守卫统一拦截，无权限回首页）
  2. `SideMenu` 菜单项 `v-if="userStore.isSuperAdmin"`（不显示入口）
  3. 页面内受限数据：非授权角色**不发起请求**（如仪表盘用户总数仅超管拉取），避免必然 403 的调用
- 前端显隐只是体验层，接口权限由后端强制校验，**不得以"前端已经隐藏"为由省略后端权限**

## 5. 文档同步（强制）

- 接口对接变化 → 更新 `docs/接口对接说明.md` 的接口表格
- 结构/规范变化 → 更新 `README.md` 与本文档变更记录
- 后端接口的权威定义见后端仓库 `docs/API_CHANGELOG.md`

## 6. 提交规范

- commit message 格式：`<类型>: <描述>`，类型：feat / fix / refactor / docs / chore
- 示例：`feat: 新增登录页`、`refactor: 用户页拆分为组件`

## 变更记录

| 日期 | 内容 |
|------|------|
| 2026-09-22 | v0.4.0 新增「角色与权限」强制规范（token、路由守卫、菜单显隐、401 统一处理） |
| 2026-09-22 | 初版：多级目录、组件式开发、状态与接口分层规范 |
