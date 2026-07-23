# 框架介绍

> BearPlan 后端是一套自主设计的 .NET 分层架构，目标是**无业务入侵、开箱即用**。本文带你快速理解整体骨架与各模块职责。

## 设计理念

BearPlan 后端遵循三条核心原则：

- **🏢 分层清晰**：按职责严格分层（入口 → 业务 → 仓储 → 实体 → 基础设施），避免跨层调用，结构清晰、易扩展。
- **🎯 业务中立**：与具体业务无关的框架基础设施沉淀为独立通用库 `BearPlan.Core`，不绑定任何业务实体，可被任意 .NET 项目复用。
- **🧩 开箱即用**：内置权限控制、AOP 拦截、日志、定时任务、缓存、多库适配等常用能力，无需从零搭建。

## 整体架构

```
┌─────────────────────────────────────────────┐
│           BearPlan.Api（Web 入口）           │  HTTP 路由、中间件、控制器
├─────────────────────────────────────────────┤
│        BearPlan.Infrastructure               │  应用装配层：DI 注册、鉴权、
│   （依赖下方所有层，承载技术实现）            │  过滤器、中间件、种子数据
├──────────────┬──────────────────────────────┤
│  Business    │  EventBus / TaskService       │  业务实现 / 事件总线 / 定时任务
├──────────────┴──────────────────────────────┤
│  IBusiness  /  Models                        │  业务接口契约 / 请求响应 DTO
├─────────────────────────────────────────────┤
│           Repository                         │  数据库仓储、事务
├─────────────────────────────────────────────┤
│           Entity                             │  数据库实体映射
├─────────────────────────────────────────────┤
│  BearPlan.Core ⭐  +  BearPlan.Common         │  通用框架库 + 项目专属库
└─────────────────────────────────────────────┘
```

依赖方向**自上而下**：上层可引用下层，下层不得反向引用上层。其中 `BearPlan.Core` 是最底层的通用基座，`BearPlan.Common` 承载项目专属内容并同样位于底层。

## 模块职责

| 模块 | 职责 | 性质 |
| ---- | ---- | ---- |
| `BearPlan.Api` | Web 接口入口，路由注册、中间件管道、控制器 | 应用入口 |
| `BearPlan.Infrastructure` | DI 装配扩展、JWT 鉴权、ActionFilter、业务中间件、数据库种子、AOP/日志实现 | 应用装配层 |
| `BearPlan.Business` | 业务服务实现 | 业务层 |
| `BearPlan.IBusiness` | 业务服务接口契约 | 业务契约 |
| `BearPlan.EventBus` | 事件总线（含微信消息处理） | 事件层 |
| `BearPlan.TaskService` | 系统定时任务（Quartz） | 调度层 |
| `BearPlan.Repository` | SqlSugar 仓储扩展、工作单元事务 | 仓储层 |
| `BearPlan.Entity` | 数据库实体映射类 | 实体层 |
| `BearPlan.Models` | 请求 DTO、查询参数、响应模型 | 共享模型 |
| `BearPlan.Common` | 项目业务专属：业务缓存 key、UDhold 枚举、HttpUser 实现、多语言资源、AppConfig 常量 | 项目专属库 |
| `BearPlan.Core` ⭐ | 业务无关的框架基础设施（详见下节） | **通用框架库** |

## BearPlan.Core —— 通用框架核心库

`BearPlan.Core` 是整个架构的基石——业务无关的通用框架基础设施，已发布为独立 NuGet 包，可作为任意 .NET 项目的底层基座。

::: tip
BearPlan.Core 拥有独立的文档模块，包含完整的能力清单、使用方式与技术栈说明。
:::

👉 **前往 [BearPlan.Core 模块](/core/introduction) 了解详情。**

## 分层依赖关系

理解 BearPlan 的关键在于看清依赖方向：

- **Core 是地基**：被 `Entity` 引用，链式传递到几乎所有项目。Core 本身不依赖任何业务项目。
- **Common 是项目专属基座**：与 Core 同处底层，承载 BearPlan 项目特有的常量与实现，同样被 Entity 引用。
- **Infrastructure 是装配层**：唯一可以"引用一切"的层（依赖 Entity/IBusiness/Repository/TaskService/EventBus 等），承载让系统跑起来的技术实现。
- **Api 是入口**：最顶层，只被自己的 Program.cs 引用，组装所有模块。

## 技术栈

### 后端

- **运行时**：.NET 10
- **ORM**：SqlSugarCore（支持 MySQL、SQL Server、PostgreSQL、Oracle、SQLite）
- **缓存**：StackExchange.Redis
- **日志**：Serilog（含 Async / Elasticsearch Sink）
- **依赖注入**：Autofac（含 DynamicProxy AOP）
- **对象映射**：Mapster
- **图像处理**：SixLabors.ImageSharp
- **任务调度**：Quartz
- **鉴权**：JWT Bearer
- **API 文档**：Swashbuckle (Swagger)

### 前端

- **框架**：Vue 3.5+ / TypeScript
- **UI**：Element Plus（基于 SoybeanAdmin）
- **请求层**：[Alova.js](https://alova.js.org/)

## 快速开始

主项目通过 Git Submodule 引入 Core，克隆后需初始化子模块：

```bash
# 方式一：克隆时一并拉取子模块
git clone --recursive https://gitee.com/BearPlan/BearPlan.NET.git

# 方式二：已克隆的仓库补充拉取
git submodule update --init --recursive
```

默认账号：`admin / 123456`

## 关联资源

- **主项目仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）
