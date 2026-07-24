# 序言

> BearPlan 是一套面向中后台业务的全栈快速开发平台，目标是让开发者**专注业务，不被基础设施拖累**。

## 这是什么

BearPlan 是前后端分离、多端覆盖的开源开发平台：

- **后端**：基于 .NET 10 + SqlSugar 的分层架构，内置权限、缓存、日志、AOP、定时任务、多租户等开箱能力。
- **前端**：基于 Vue 3 + Element Plus 的管理后台，配合 Alova.js 实现 API 自动集成。
- **移动端**：基于 Uni-App，一套代码编译到 H5、各平台小程序、App、鸿蒙。

它不是「脚手架」，而是经过业务打磨的**可演进基座**——拿来即用，也能随业务自由扩展。

## 为什么做

市面上的 .NET 后台框架要么太重（绑定大量业务、难以裁剪），要么太轻（只给骨架、能力都要自己补）。BearPlan 的取舍是：

- **业务中立的核心库**：把与业务无关的通用能力沉淀为独立的 `BearPlan.Core`，作为 NuGet 包或 Git Submodule 复用，不绑定任何业务实体。
- **开箱即用的完整能力**：权限、审计、缓存、多库、事件总线、定时任务等常用能力已内置并打通，开箱可跑。
- **前后端 API 自动集成**：基于 Swagger + Alova.js，后端接口变更前端自动同步，告别手写请求函数。

## 适合谁

- 需要**快速搭建中后台系统**（OA / CRM / WMS / ERP 等）的团队。
- 想要一个**可长期演进、不被业务绑死**的 .NET 基座。
- 希望前后端**高效协同**，减少接口对接成本的开发者。

如果你只是想要一个纯前端模板，或一个不含任何框架封装的极简后端，BearPlan 可能偏重——它面向的是「正经业务系统」。

## 技术栈速览

| 层 | 技术 |
| --- | --- |
| **后端运行时** | .NET 10 |
| **ORM** | SqlSugarCore（支持 MySQL / SQL Server / PostgreSQL / Oracle / SQLite） |
| **缓存** | StackExchange.Redis |
| **日志** | Serilog |
| **依赖注入 / AOP** | Autofac（含 DynamicProxy） |
| **前端框架** | Vue 3.5+ / TypeScript |
| **前端 UI** | Element Plus（基于 SoybeanAdmin） |
| **请求层** | [Alova.js](https://alova.js.org/) |
| **移动端** | Uni-App |

更多细节见 [框架介绍](/core/framework)。

## 如何开始

1. **了解整体架构**：阅读 [框架介绍](/core/framework)，理解分层与依赖方向。
2. **拉取项目**：主项目通过 Git Submodule 引入 Core：

   ```bash
   # 克隆时一并拉取子模块
   git clone --recursive https://gitee.com/BearPlan/BearPlan.NET.git

   # 或已克隆的仓库补充拉取
   git submodule update --init --recursive
   ```

3. **启动运行**：默认账号 `admin / 123456`。
4. **部署上线**：参考 [部署总览](/core/deploy)，按端选择部署方式。

## 文档导航

| 文档 | 内容 |
| --- | --- |
| [框架介绍](/core/framework) | 整体架构、分层职责、依赖关系 |
| [BearPlan.Core 介绍](/core/introduction) | 通用核心库的能力清单 |
| [快速开始](/core/quickstart) | Core 的两种引入方式（Submodule / NuGet） |
| [部署总览](/core/deploy) | 前端、后端、移动端的部署方式 |

## 相关资源

- **主项目仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）

---

集百家之所长，千家之所强。BearPlan 站在 [SoybeanAdmin](https://docs.soybeanjs.cn/)、[Alova.js](https://alova.js.org/zh-CN/)、SqlSugar 等优秀开源项目肩上，向它们致敬。
