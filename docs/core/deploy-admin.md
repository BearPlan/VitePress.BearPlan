# 前端部署（BearPlan.Admin）

::: warning 🚧 开发中
本章节内容正在撰写中，暂未完成。完成前可参考现有 [Dockerfile](https://gitee.com/BearPlan/BearPlan.NET) 和下方的基础思路。
:::

BearPlan.Admin 是基于 Vue 3 + Vite + Element Plus 的管理后台，构建后是一堆纯静态文件，部署方式灵活。

## 构建产物

```bash
# 生产构建
pnpm install
pnpm build
```

构建产物输出到 `dist/`，包含：

```
dist/
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── ...
└── ...
```

## 部署方式预告

前端部署有三种常见方式，完整教程将覆盖：

### 方式一：Docker 多阶段构建（推荐）

`BearPlan.Admin/Dockerfile` 已提供多阶段构建模板：

```dockerfile
FROM node:21-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

一次 `docker build` 同时完成「构建 + 打包进 nginx」，服务器无需 Node.js 环境。

### 方式二：本机构建 + 静态托管

本机 `pnpm build` 后把 `dist/` 上传到：

- 服务器 nginx / Caddy / Apache
- 云存储 + CDN（阿里云 OSS、腾讯云 COS、Cloudflare Pages 等）

### 方式三：托管平台自动部署

接入 Vercel / Netlify / Cloudflare Pages，push 代码自动构建发布。

## 待完善内容

完整教程将补充：

- 多阶段 Docker 构建实操（含 build 参数优化、镜像体积控制）
- nginx 反向代理配置（前端 + API 同域名路由分发）
- 环境变量注入（`VITE_API_BASE_URL` 等构建期配置）
- gzip / brotli 压缩与静态资源缓存策略
- SPA history 模式 fallback 配置

敬请期待。
