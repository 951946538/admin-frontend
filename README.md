# admin-frontend

管理系统的前端项目。Vue 3 + Vite + Element Plus + Naive UI + Pinia + Vue Router + Axios。

## 目录结构

```
admin-frontend/
├── index.html
├── vite.config.js           # 开发服务器 + /api 代理到后端 8080
├── src/
│   ├── main.js              # 入口（注册插件、全局样式）
│   ├── App.vue              # 根组件（仅 router-view）
│   ├── api/                 # 接口封装（request.js 为 axios 唯一创建处）
│   ├── router/index.js      # 路由（嵌套 Layout + 登录守卫）
│   ├── stores/              # Pinia 状态
│   ├── layout/              # 主布局 + 子组件（SideMenu、HeaderBar）
│   ├── styles/              # 全局样式
│   └── views/               # 页面（多级目录，一个模块一个目录）
│       ├── login/           # 登录页（全屏，不套布局）
│       ├── dashboard/       # 仪表盘
│       └── user/            # 用户管理
│           └── components/  # 页面私有组件（UserTable、UserCreateDialog）
├── log/                     # 运行日志目录（预留）
└── docs/                    # 文档（接口对接说明、AI实现规范）
```

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:5173 （需先启动后端 `admin-backend`，端口 8080）。

## 组件库说明

- **Element Plus**：全局注册，作为主力 UI 库（布局、表格、表单、弹窗、消息提示）
- **Naive UI**：按需引入（`import { NCard } from 'naive-ui'`），两者可共存，按喜好选用

## 构建

```bash
npm run build     # 产物输出到 dist/
```

## 文档

- 接口对接：`docs/接口对接说明.md`
- 实现规范：`docs/AI实现规范.md`（多级目录、组件式开发等强制规范）
