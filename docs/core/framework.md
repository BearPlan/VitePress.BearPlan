# BearPlan.NET 介绍

> BearPlan.NET 是 BearPlan 的后端工程，基于 .NET 10 + SqlSugar 的分层架构。本文聚焦后端的**整体骨架与分层职责**，帮助读者建立全局认知：一个请求怎么流转、各模块负责什么、依赖方向如何约束。

项目整体背景见 [序言](/core/first)；通用核心库 `BearPlan.Core` 的能力清单见 [Core 介绍](/core/introduction)；后端部署见 [后端部署](/core/deploy-api)。本文不重复这些内容。

## 分层架构

BearPlan.NET 按职责严格分层，依赖方向**自上而下**——上层可引用下层，下层不得反向引用上层。

```
┌─────────────────────────────────────────────────────────┐
│  BearPlan.Api                  应用入口                  │
│  路由 · 中间件管道 · 控制器 · Program.cs 装配             │
├─────────────────────────────────────────────────────────┤
│  BearPlan.Infrastructure      应用装配层（唯一可引用一切）│
│  DI 注册 · JWT 鉴权 · ActionFilter · 业务中间件          │
│  种子数据 · AOP 实现 · 日志 Sink                         │
├──────────────────────┬──────────────────────────────────┤
│  Business            │  EventBus / TaskService          │
│  业务服务实现         │  事件总线（含微信）· 定时任务     │
├──────────────────────┴──────────────────────────────────┤
│  IBusiness  /  Models         业务契约 / 请求响应 DTO    │
├─────────────────────────────────────────────────────────┤
│  Repository          SqlSugar 仓储扩展 · 工作单元事务    │
├─────────────────────────────────────────────────────────┤
│  Entity              数据库实体映射                       │
├─────────────────────────────────────────────────────────┤
│  BearPlan.Core ⭐    通用框架库（业务中立，独立发布）     │
│  BearPlan.Common     项目专属库（业务常量/枚举/实现）     │
└─────────────────────────────────────────────────────────┘
```

### 模块职责

| 模块 | 职责 |
| --- | --- |
| `BearPlan.Api` | Web 接口入口：路由注册、中间件管道、控制器 |
| `BearPlan.Infrastructure` | 应用装配层：DI 扩展、JWT 鉴权、过滤器、业务中间件、种子数据、AOP/日志实现 |
| `BearPlan.Business` | 业务服务实现 |
| `BearPlan.IBusiness` | 业务服务接口契约 |
| `BearPlan.EventBus` | 事件总线（含微信消息处理） |
| `BearPlan.TaskService` | 系统定时任务（Quartz） |
| `BearPlan.Repository` | SqlSugar 仓储扩展、工作单元事务 |
| `BearPlan.Entity` | 数据库实体映射类 |
| `BearPlan.Models` | 请求 DTO、查询参数、响应模型 |
| `BearPlan.Common` | 项目业务专属：缓存 key、业务枚举、HttpUser、多语言资源、AppConfig |
| `BearPlan.Core` | 业务无关的通用框架基础设施 |

### 分层依赖关系

理解 BearPlan.NET 的关键在于看清依赖方向：

- **Core 是地基**：被 `Entity` 引用，链式传递到几乎所有项目。Core 本身不依赖任何业务项目。
- **Common 是项目专属基座**：与 Core 同处底层，承载 BearPlan 特有的常量与实现，同样被 Entity 引用。
- **Infrastructure 是装配层**：**唯一可以「引用一切」的层**（依赖 Entity / IBusiness / Repository / TaskService / EventBus 等），承载让系统跑起来的技术实现。
- **Api 是入口**：最顶层，只被自己的 Program.cs 引用，组装所有模块。

::: warning 核心约束
`BearPlan.Core` **不得引用任何业务项目**（Entity / IBusiness / Repository / 业务实现），保持业务中立，确保可独立编译与发布。

依赖业务实体的代码（如数据库种子 `SeedService`、事务 AOP、日志写库 Sink）即使看起来是"框架设施"，也必须放在 `Infrastructure`，而不能进入 Core——否则会形成循环依赖。
:::

## 请求链路

一个 HTTP 请求从进入到响应，经过以下层：

```
HTTP 请求
   │
   ▼
┌──────────────────────────────────────────────────────┐
│ Api 层：路由匹配 → 中间件管道（CORS / 限流 / 鉴权）    │
├──────────────────────────────────────────────────────┤
│ Infrastructure 层：                                    │
│   · PermissionHandler（权限校验）                      │
│   · AuditLogFilter（审计日志，记录操作）                │
│   · ExceptionLogFilter（异常捕获，写日志库）            │
├──────────────────────────────────────────────────────┤
│ Controller → 调用 Business 服务                        │
├──────────────────────────────────────────────────────┤
│ Business 层：业务逻辑（可能经 AOP 拦截：缓存/事务）    │
├──────────────────────────────────────────────────────┤
│ Repository 层：SqlSugar 仓储读写数据库                  │
├──────────────────────────────────────────────────────┤
│ Entity / Core：实体映射 · 通用模型 · 工具               │
└──────────────────────────────────────────────────────┘
   │
   ▼
HTTP 响应（统一格式化）
```

关键点：

- **鉴权统一在 Infrastructure 的 `PermissionHandler`**：Controller 不写权限判断。
- **横切关注点用 AOP / Filter**：缓存、事务、审计日志通过特性声明，不侵入业务代码。
- **响应统一格式化**：所有接口返回统一结构，由 Infrastructure 的中间件处理。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| **运行时** | .NET 10 |
| **ORM** | SqlSugarCore（支持 MySQL / SQL Server / PostgreSQL / Oracle / SQLite） |
| **缓存** | StackExchange.Redis |
| **日志** | Serilog（含 Async / Elasticsearch Sink） |
| **依赖注入 / AOP** | Autofac（含 DynamicProxy） |
| **对象映射** | Mapster |
| **图像处理** | SixLabors.ImageSharp |
| **任务调度** | Quartz |
| **鉴权** | JWT Bearer |
| **API 文档** | Swashbuckle (Swagger) |

## 设计理念

BearPlan.NET 遵循三条核心原则：

- **🏢 分层清晰**：按职责严格分层，避免跨层调用，结构清晰、易扩展。
- **🎯 业务中立**：与具体业务无关的框架基础设施沉淀为独立通用库 `BearPlan.Core`，不绑定任何业务实体，可被任意 .NET 项目复用。
- **🧩 开箱即用**：内置权限控制、AOP 拦截、日志、定时任务、缓存、多库适配等常用能力，无需从零搭建。

## 关联资源

- **主项目仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）
