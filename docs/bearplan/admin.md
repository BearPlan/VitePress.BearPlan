---
title: "BearPlan.Admin 前端管理后台"
description: "BearPlan.Admin 是基于 Vue 3 + Element Plus + SoybeanAdmin 的前端管理后台，集成 Alova.js 接口自动生成、权限路由、国际化与 UnoCSS 主题定制。"
---

# BearPlan.Admin

> BearPlan.Admin 是 BearPlan 的前端管理后台，基于 Vue 3 + TypeScript + Element Plus，在 [SoybeanAdmin](https://docs.soybeanjs.cn/) 基座上深度定制，配合 [Alova.js](https://alova.js.org/) 实现与后端 Swagger 的接口自动集成。

本文聚焦「**拿到代码后如何跑起来**」：项目定位、开发环境、运行命令、子模块拉取。前端架构详解（路由、状态管理、权限菜单、主题）将在后续专题文档展开。

## 项目定位

BearPlan.Admin 不是独立运行的前端模板，而是 **BearPlan 主仓库的一个 git submodule**——它依赖后端 BearPlan.Api 提供接口，与后端共享同一套认证（JWT）和权限码。

```
BearPlan.NET/                    # BearPlan 主仓库
├── BearPlan.Api/                # 后端入口（.NET）
├── BearPlan.Business/           # 业务层
├── BearPlan.Core/               # 通用核心库（submodule）
└── BearPlan.Admin/              # 前端管理后台（submodule，本文）👈
```

::: tip 仓库关系
- **主仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Admin 独立仓库**：<https://gitee.com/BearPlan/BearPlan.Admin>（作为 submodule 引入）
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>（同为 submodule）

Admin 单独 clone 也能跑（连后端 API 即可），但完整业务联调建议放在主仓库内进行。
:::

## 技术栈

| 类别 | 技术 |
| --- | --- |
| **框架** | Vue 3.5 + TypeScript |
| **构建** | Vite（rolldown-vite）|
| **UI 库** | Element Plus |
| **状态管理** | Pinia |
| **路由** | Vue Router 4（history 模式）+ Elegant Router（文件式路由）|
| **请求层** | [Alova.js](https://alova.js.org/)（基于 Swagger 自动生成，见 [Alova 集成](/bearplan/alovajs)）|
| **样式** | UnoCSS |
| **国际化** | vue-i18n |
| **图表** | ECharts / AntV / VisActor |
| **基座** | [SoybeanAdmin](https://docs.soybeanjs.cn/) |

## 开发环境

### 必备工具

| 工具 | 最低版本 | 说明 |
| --- | --- | --- |
| **Node.js** | `>= 20.19.0` | 推荐 LTS 版本 |
| **pnpm** | `>= 8.7.0` | 包管理器（项目用 pnpm workspace，**不可用 npm/yarn**）|
| **IDE** | VSCode | 推荐安装 Vue (Volar)、UnoCSS、ESLint 插件 |

::: warning 包管理器约束
项目根目录有 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml`，必须使用 pnpm 安装依赖。混用 npm/yarn 会导致 lock 文件冲突和 workspace 解析失败。
:::

### 验证环境

```bash
node -v      # 应 >= v20.19.0
pnpm -v      # 应 >= 8.7.0
```

若未安装 pnpm：

```bash
# 任选一种
npm install -g pnpm
# 或启用 Node 自带的 corepack
corepack enable
```

### 后端依赖

Admin 是前后端分离架构，**运行前需先启动后端 BearPlan.Api**：

- 默认后端地址：`http://127.0.0.1:3000`（见 `.env.test` 的 `VITE_SERVICE_BASE_URL`）
- 后端启动方式见 [框架介绍](/bearplan/dotnet) 与 [后端部署](/bearplan/deploy-api)
- 默认登录账号：`admin / 123456`

如后端地址不同，修改 `.env.test`（dev 模式默认加载）或对应模式的环境文件即可。

## 拉取代码

Admin 作为 submodule 引入主仓库，有「整体克隆」和「补充拉取」两种场景。

### 场景一：首次克隆主仓库（含全部子模块）

```bash
# --recursive 会一并拉取 BearPlan.Admin 和 BearPlan.Core
git clone --recursive https://gitee.com/BearPlan/BearPlan.NET.git
```

### 场景二：已克隆主仓库，补充拉取子模块

如果之前是普通 `git clone`（不带 `--recursive`），子模块目录会是空的：

```bash
cd BearPlan.NET
# 初始化并拉取所有子模块
git submodule update --init --recursive
```

拉取完成后，`BearPlan.Admin/` 和 `BearPlan.Core/` 都会有完整代码。

### 场景三：单独克隆 Admin 仓库

只想看前端、不需要主仓库结构时：

```bash
git clone https://gitee.com/BearPlan/BearPlan.Admin.git
```

::: tip 子模块 vs 独立克隆
- **在主仓库内开发**（推荐）：submodule 方式，前后端代码同目录，联调方便。
- **单独克隆**：适合只改前端、连远程后端的场景。注意此时不在主仓库版本控制链路中。
:::

## 安装依赖

进入 `BearPlan.Admin` 目录安装依赖：

```bash
cd BearPlan.Admin
pnpm install
```

首次安装约 30 秒，会拉取 `@sa/*` workspace 包（SoybeanAdmin 基座）和全部业务依赖。

## 运行命令

所有命令在 `BearPlan.Admin/` 目录下执行。

### 开发模式

```bash
pnpm dev        # 等同于 vite --mode test，加载 .env + .env.test
```

启动后访问 Vite 输出的本地地址（默认 localhost:9527，以实际输出为准），会自动代理到后端 `http://127.0.0.1:3000`。

::: tip 环境文件
- `.env`：所有模式共享的基础配置
- `.env.test`：`dev` 命令加载（虽叫 test，实为开发默认）
- `.env.prod`：`dev:prod` 与 `build` 加载
- `.env.production`：生产构建专用
:::

其他开发命令：

```bash
pnpm dev:prod   # 以 prod 环境配置启动开发服务器（连生产后端，慎用）
```

### 生产构建

```bash
pnpm build      # vite build --mode prod，产物输出到 dist/
```

构建产物是纯静态文件，部署方式见 [前端部署](/bearplan/deploy-admin)。

### 代码检查

```bash
pnpm lint       # ESLint 检查并自动修复（eslint . --fix）
pnpm typecheck  # TypeScript 类型检查（vue-tsc --noEmit）
```

建议提交前本地跑一遍这两个命令。

### 接口生成

前后端 API 自动集成的核心命令（详见 [Alova 集成](/bearplan/alovajs)）：

```bash
pnpm gen        # 从后端 Swagger 拉取接口定义，自动生成前端请求函数
```

后端接口变更后，重新执行此命令即可同步，无需手写请求层。

### 其他常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm gen-route` | 重新生成路由声明（基于文件式路由） |
| `pnpm commit` | 交互式生成符合规范的 commit message |
| `pnpm release` | 发布新版本 |
| `pnpm update-pkg` | 检查并更新依赖 |

## 常见问题

### 子模块目录是空的

忘记带 `--recursive` 克隆，执行：

```bash
git submodule update --init --recursive
```

### `pnpm install` 报 workspace 解析失败

确认在 `BearPlan.Admin/` 目录下执行，且使用的是 pnpm（不是 npm/yarn）。项目根有 `pnpm-workspace.yaml`，必须由 pnpm 解析 `@sa/*` 工作区包。

### 启动后接口全部 401 / 网络错误

检查后端是否启动、地址是否匹配：

1. 后端 BearPlan.Api 是否运行在 `http://127.0.0.1:3000`
2. `.env.test` 的 `VITE_SERVICE_BASE_URL` 是否正确
3. `.env` 的 `VITE_HTTP_PROXY=Y`（开发模式走 Vite 代理，避免跨域）

### 子模块改动如何提交

子模块内的修改，需**先在子模块内提交**，再回主仓库提交指针变更：

```bash
cd BearPlan.Admin
# ...改代码...
git add .
git commit -m "feat: xxx"
git push                     # 推到 Admin 自己的远程

cd ..                        # 回到主仓库
git add BearPlan.Admin       # 记录子模块新 commit 指针
git commit -m "chore: bump BearPlan.Admin submodule"
```

::: warning 不要在主仓库直接改子模块文件而不提交子模块
主仓库只记录子模块的 commit 指针，子模块内的修改必须先在子模块内成提交，否则主仓库 `git status` 会一直显示子模块 dirty。
:::

## 下一步

- [前端部署](/bearplan/deploy-admin) —— 构建 + Docker + nginx 方案
- [Alova 集成](/bearplan/alovajs) —— 前后端 API 自动集成机制
- [框架介绍](/bearplan/dotnet) —— 整体架构与前后端协同
