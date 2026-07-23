# BearPlan.Core

> BearPlan 的通用框架核心库 —— 抽离权限、缓存、日志、ORM 等通用能力，业务无关、开箱即用，可作为任意 .NET 项目的底层基座。

## 这是什么

`BearPlan.Core` 是 BearPlan 后端架构的最底层基座，承载**与具体业务无关**的框架级基础设施。它不依赖任何业务实体或服务接口，任何 .NET / C# 应用程序都可以直接复用。

它作为独立仓库维护（[gitee.com/BearPlan/BearPlan.NET.Core](https://gitee.com/BearPlan/BearPlan.NET.Core)），已发布为 NuGet 包，可通过 Git Submodule 或 NuGet 引用。

## 核心特性

- **🎯 业务中立**：不引用任何业务项目（Entity / IBusiness / Repository / 业务实现），保持纯粹的通用性。
- **🧩 开箱即用**：内置缓存、日志、鉴权、AOP、配置、工具类等常用能力，无需从零搭建。
- **📦 可独立发布**：作为独立仓库与 NuGet 包演进，版本化、可复用。
- **🔗 多种引入方式**：Git Submodule（参与源码编译）或 NuGet 包（二进制引用），按需选择。

## 包含能力

按职责划分为五个能力域。每个小模块都可作为独立代码单元直接引用，无需整体引入 Core。

### 应用核心 {#app-core}

承载全局上下文、依赖注入底座与全局配置，是 Core 被引用时最先接触的部分。

- #### App / Internal {#app-internal}

  全局应用入口，统一的服务定位器：`App.GetService<T>()`、`App.GetOptions<T>()` 等，让服务与配置在任意位置可用。

- #### ConfigOptions {#config-options}

  强类型配置选项：JWT、Redis、CORS、数据库连接、Serilog、Swagger、中间件开关。

- #### Global {#global}

  全局常量与配置：`AppSettings`、`AuthConstants`、`MimeTypes`、`Mapper`。

- #### Consts {#consts}

  通用常量。

- #### DI {#di}

  依赖注入基础设施：拦截器、过滤器、Autofac 辅助、DI 标记接口。

### AOP 与中间件 {#aop-middleware}

横切关注点：基于 Autofac DynamicProxy 的拦截器与 ASP.NET Core 中间件管道。

- #### Attributes {#attributes}

  通用特性：缓存、事务、权限、响应格式化、多库路由标记、Redis 订阅。

- #### Aop {#aop}

  Autofac DynamicProxy 实现的 AOP 拦截器（缓存拦截等）。

- #### Middleware {#middleware}

  纯中间件：CORS、IP 限流、真实 IP、MiniProfiler、Swagger 授权、404。

### 缓存、日志与多语言 {#cache-log-i18n}

跨业务的基础设施能力：分布式缓存、结构化日志、多语言契约。

- #### Caches {#caches}

  缓存抽象与实现：`ICache`、Redis、分布式缓存、Redis 消息队列。

- #### Serilog {#serilog}

  Serilog 日志输出扩展。

- #### MultiLanguage {#multi-language}

  多语言契约（`ILocalizationService`、`Localizer` 资源访问器）。

### 数据模型与映射 {#data-model}

通用数据契约与对象映射，供 Entity / Repository / Models 共享。

- #### Model {#model}

  通用模型契约：审计实体接口、分页参数、操作结果。

- #### Pager {#pager}

  分页相关模型。

- #### Mapping {#mapping}

  对象映射配置（Mapster）。

- #### Enums {#enums}

  通用枚举：架构、缓存类型、列类型、部门、字典、性别、菜单、触发器、版本等。

- #### Exception {#exception}

  通用异常：`BusException`、`BadRequestException`。

### 工具与扩展 {#utils-extensions}

通用算法、扩展方法、工具类与资源文件。

- #### Extensions {#extensions}

  扩展方法：字符串、日期、集合、枚举、表达式、字节流、DataTable。

- #### Helper {#helper}

  工具类：文件、日期、加密（BCrypt/RSA）、HTTP、IP、日志、树结构、Excel、雪花 ID。

- #### IdGenerator {#id-generator}

  雪花 ID 生成器。

- #### ClassLibrary {#class-library}

  通用算法与工具：一致性哈希、MurmurHash、JSON 转换器、同步集合。

- #### Fonts {#fonts}

  验证码生成所需的字体资源。

## 关键约束

::: warning 核心原则
`BearPlan.Core` **不得引用任何业务项目**（Entity / IBusiness / Repository / 业务实现），保持业务中立，确保可独立编译与发布。
:::

这意味着：依赖业务实体或服务接口的代码（如数据库种子 `SeedService`、事务 AOP、日志写库 Sink）即使看起来是"框架设施"，也必须放在上层的 `BearPlan.Infrastructure`，而不能进入 Core——否则会形成循环依赖。

## 技术栈

- **运行时**：.NET 10
- **ORM 适配**：SqlSugarCore
- **缓存**：StackExchange.Redis
- **日志**：Serilog（含 Async / Elasticsearch Sink）
- **依赖注入**：Autofac（含 DynamicProxy AOP）
- **对象映射**：Mapster
- **图像处理**：SixLabors.ImageSharp
- **任务调度**：Quartz
- **其它**：Newtonsoft.Json、NodaTime、MiniProfiler、Swashbuckle

## 关联资源

- **Core 仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **主项目**：<https://gitee.com/BearPlan/BearPlan.NET>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）

准备好开始使用？前往 [快速开始](/core/quickstart) 了解引入方式。
