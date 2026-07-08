# BearPlan 文档

欢迎使用 **BearPlan** —— 基于 .NET 8、Vue 3、Uni-App 构建的多端全栈平台。

> 工欲善其事，必先利其器。

BearPlan 致力于构建简单、精准、高效的开发体验。后端基于 `BearPlan` 架构，前端多端适配，适用于后台管理、App、小程序、IoT 等多种场景。

- 🌐 多端支持：Web、H5、小程序、App、鸿蒙
- ⚙️ 技术先进：.NET 8 / SqlSugar / Vue 3 / Uni-App
- 🚀 快速集成：Alova.js 自动生成 API 接口
- 🛡️ 权限控制 + 多租户 + 国际化支持

> 快速开始，请阅读 [使用指南](https://bear.js.org/)。

## 构建和发布

本项目文档基于 [VitePress](https://vitepress.dev/) 构建，通过 [GitHub Pages](https://pages.github.com/) 部署，自定义域名 `bear.js.org`。

### 环境要求

- Node.js 18+
- 包管理器：[pnpm](https://pnpm.io/)

### 首次准备

安装依赖，并加入发布工具 `gh-pages`（用于将构建产物推送到 `gh-pages` 分支）：

```bash
pnpm install
pnpm install gh-pages --save-dev
```

### 本地开发

```bash
pnpm dev
```

启动后访问控制台输出的本地地址（默认 `http://localhost:5173`）实时预览。

### 构建

```bash
pnpm docs:build
```

构建产物输出到 `docs/.vitepress/dist`，可用以下命令本地预览构建结果：

```bash
pnpm docs:preview
```

### 发布到 GitHub Pages

```bash
pnpm run deploy
```

该命令依次执行：构建文档 → 写入 `CNAME`（`bear.js.org`）→ 通过 `gh-pages` 将 `docs/.vitepress/dist` 推送到仓库的 `gh-pages` 分支。

> 首次发布前，需在仓库 **Settings → Pages** 中将 Source 指向 `gh-pages` 分支；部署生效后即可通过 `bear.js.org` 访问。