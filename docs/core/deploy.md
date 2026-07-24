# 部署

BearPlan 是前后端分离的多端架构，部署分三条独立链路，各自构建产物、各自运行环境，互不耦合。

## 三端概览

| 端 | 项目 | 构建产物 | 运行环境 |
| --- | --- | --- | --- |
| **后端** | `BearPlan.Api` | .NET 程序文件（DLL + 配置 + 静态资源） | Docker 容器（aspnet 镜像） |
| **前端** | `BearPlan.Admin` | 静态文件（HTML/CSS/JS） | Docker 容器（nginx 镜像）或任意静态服务器 |
| **移动端** | Uni-App 工程 | 各平台安装包（H5/小程序/App） | 各平台对应分发渠道 |

## 部署链路

```
后端 BearPlan.Api              前端 BearPlan.Admin           移动端
─────────────────              ────────────────────          ──────────────────
dotnet publish                 pnpm build                    各平台构建
     │                              │                              │
产物上传服务器                       dist 产物                        安装包
     │                              │                              │
docker run (aspnet)            docker run (nginx) / 静态托管    分发到各平台
     │                              │                              │
     └──── 提供 API ────────────────┘                              │
                   │                                               │
                   └───────── 调用 API ────────────────────────────┘
```

三端共享同一套后端 API，部署相互独立：后端先就绪，前端和移动端各自指向后端地址即可。

## 选择部署方式

- **[后端部署（BearPlan.Api）](/core/deploy-api)** —— 本机发布 + 上传产物 + Docker 运行，生产可用方案。
- **[前端部署（BearPlan.Admin）](/core/deploy-admin)** —— 多阶段构建打包进 nginx，或托管到 CDN。
- **[移动端部署](/core/deploy-mobile)** —— Uni-App 多端构建与分发。

## 通用前提

无论部署哪一端，服务器都需要安装 Docker：

```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
```

如果后端依赖宿主机上的 MySQL / Redis 等中间件，还需配置防火墙放行 docker 网段，详见博客 [Docker 被防火墙拦截](/blog/docker-firewall-allow-subnet)。

## 下一步

从 [后端部署](/core/deploy-api) 开始，后端是前后端通信的基座，通常最先部署。
