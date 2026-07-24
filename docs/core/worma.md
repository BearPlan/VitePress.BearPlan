# Worma

> alova 官方 OpenAPI 代码生成工具的继任者。Worma 从后端 swagger 自动生成前端 API 调用代码与完整的 TypeScript 类型，配合 VS Code 扩展提供生成、浏览、跳转能力——把"写请求函数 + 手维护类型"的 7 步流程压缩为 1 步。BearPlan.Admin 已迁移至此。

## 这是什么

Worma 解决的核心问题：**前后端 API 对接成本**。传统流程是后端写文档 → 前端读文档 → 手写请求函数 → 手维护 TypeScript 类型 → 接口变更再同步一遍，7 步且易错。Worma 直接从 OpenAPI 规范生成全部代码：

```
后端 swagger.json
       │
       ▼
Worma 生成 API 定义 + TypeScript 类型
       │
       ▼
页面 import Apis.{tag}.{method}() 调用，类型完整推导
```

### 与前身 @alova/wormhole 的关系

Worma 是 `@alova/wormhole` 的官方继任者。原包已废弃，演进关系：

| 项 | 旧（已废弃） | 新（当前） |
| -- | ------------ | ---------- |
| 项目名 | alova wormhole | **worma** |
| npm 包 | `@alova/wormhole` | **`wormajs`** |
| 配置文件 | `alova.config.ts` | **`worma.config.ts`** |
| 平台配置 | `platform: 'axios'` | `platforms.ax = '@alova/worma-adapter-axios'` |

::: tip 命名澄清
**worma** 是项目名与官方站点（<https://worma.js.org/>），**`wormajs`** 是 npm 包名（`pnpm add wormajs`）。安装时认包名，书写时认项目名。
:::

本文以 worma 为基准（与 BearPlan.Admin 实际栈一致）。整体架构与前后端协同见 [框架介绍](/core/framework)，alova hooks 调用见 [Alova.js](/core/alovajs)。

## 工作机制

```
后端 swagger.json（OpenAPI 2.0 / 3.0 / 3.1）
       │
       ▼
worma.config.ts 配置（input / output / platforms / 插件钩子）
       │
       ▼
生成三件套到 src/api/
       │
       ▼
页面 import Apis → Apis.{tag}.{method}() → 交给 alova hooks
```

### 生成产物三件套

每次生成在 `output` 目录产出三个文件：

| 文件 | 内容 | 用途 |
| ---- | ---- | ---- |
| `apiDefinitions.ts` | API 方法定义：每个接口的 Method 工厂（路径、参数、请求方式） | 被 `createApis` 聚合 |
| `createApis.ts` | API 工厂：`createApis(alovaInstance)` 与 `mountApis` | 把定义挂到 `Apis` 代理对象 |
| `globals.d.ts` | 完整 TypeScript 类型声明（请求参数、响应、DTO） | IDE 类型推导与编译期校验 |

## VS Code 扩展

Worma 的命令行生成能力由 VS Code 扩展承接，让开发者不用离开编辑器即可完成全部工作。

### 安装

在 VS Code 扩展市场搜索 **alova**（发布者 alova.js）安装。扩展会自动识别项目根目录的 `worma.config.ts`。

### 四大功能

| 功能 | 说明 |
| ---- | ---- |
| **生成 API** | 在 VS Code 内直接触发生成，把 swagger 转为 alova API 代码 |
| **浏览 API 文档** | 侧边栏以树形展示当前项目所有 API（按 tag 分组），无需翻后端文档 |
| **跳转 API 文档** | 代码里点击 API 调用，直接跳转到对应的 API 文档节点 |
| **autoUpdate 自动更新** | 配置开启后，监听 swagger 源变化时自动重新生成 |

::: tip 高频调用需缓存
VS Code 扩展会高频反复调用配置（每次保存、每次生成触发），若 `worma.config.ts` 里有自定义插件从后端 fetch 信息，应在插件内做进程内缓存（如 60 秒 TTL），避免重复请求触发后端 HTTP 429。
:::

## 最小配置（worma.config.ts）

### 安装

```bash
# 安装 worma 与 axios 适配器
pnpm add wormajs @alova/worma-adapter-axios
```

### 配置示例

```ts
// worma.config.ts
import { defineConfig } from 'wormajs'

export default defineConfig({
  generator: [
    {
      // OpenAPI 来源：本地 swagger.json 或后端 swagger 地址
      input: 'http://localhost:5000/swagger/v1/swagger.json',
      // 输出目录：生成三件套写到此处
      output: 'src/api',
      // 目标平台适配器（决定生成代码的请求风格）
      platforms: {
        ax: '@alova/worma-adapter-axios'
      },
      // 全局 API 代理名，页面用 Apis.{tag}.{method}() 调用
      global: 'Apis',
      // 生成代码引用的 alova 实例
      alovaConfig: './alovaInstance',
      // 自动更新：监听 swagger 变化时重新生成
      autoUpdate: true
    }
  ]
})
```

关键字段速查：

| 字段 | 作用 |
| ---- | ---- |
| `input` | OpenAPI 规范来源（本地路径或 URL） |
| `output` | 生成产物输出目录 |
| `platforms` | 目标平台适配器（axios / fetch / uniapp 等） |
| `global` | 全局 API 代理导出名，默认 `Apis` |
| `alovaConfig` | 生成代码引用的 alova 实例路径 |
| `autoUpdate` | 是否监听 swagger 自动重新生成 |

::: warning 配置入口是 worma.config.ts
BearPlan.Admin 的配置入口是 `worma.config.ts`，**不是**旧版的 `alova.config.ts`。从 `@alova/wormhole` 迁移时需同步改名，并调整 `platform` → `platforms`、钩子签名等变更。
:::

## 生成与调用

### 触发生成

两种方式任选：

- **命令行**：`npx alova gen`（worma 复用 alova CLI）
- **VS Code 扩展**：侧边栏 alova 面板点击生成按钮，或开启 `autoUpdate` 自动触发

### 代理调用模式

```ts
import Apis from '@/api'

// Apis.{tag}.{method}() 返回 alova Method 实例，交给 hooks 消费
const {
  send: getDevices,
  loading: getDevicesLoading,
  data: devices
} = useRequest(
  () => Apis.device.getDevices(),
  { immediate: true, initialData: [], force: true }
)
```

- `{tag}`：由 swagger 的 tag 决定（通常对应后端 Controller 名，如 `device`、`WeiXin`）。
- `{method}`：PascalCase 命名，保留后端 Action 名（如 `GetPage`、`CreateQrcode`）。
- 返回值是 alova Method 实例，可交给 `useRequest` / `useForm` / `usePagination`，详见 [Alova.js](/core/alovajs)。

::: warning 不要手动修改自动生成文件
`src/api/` 下的 `apiDefinitions.ts` / `createApis.ts` / `globals.d.ts` 是自动生成的，**任何手动修改都会在下次生成时被覆盖**。新增接口应改后端 Controller 后重新生成，自定义逻辑写在 hook 调用层。
:::

## BearPlan 落地：枚举与 schema 同步

BearPlan.Admin 在标准 worma 配置之上，通过 `dynamic-enums` 自定义插件扩展了三类信息同步，这是项目最独特的实践。

### 三轨同步

插件在 `config` 钩子里从一次 swagger fetch + 后端枚举接口，同步三类信息到三个 TS 文件：

| 产物文件 | 内容 | 数据源 | 用途 |
| -------- | ---- | ------ | ---- |
| `apiEnums.ts` | TS `enum` 源码 | swagger 枚举 + 后端 XML `<summary>` 注释 | 供 worma 当 `externalTypes` 引用，DTO 直接复用 |
| `apiEnumsDisplay.ts` | `Record<Enum, string>` 中文映射 | 后端反射 `[Display(Name)]` 特性 | 运行时"枚举值 → 中文"渲染 |
| `apiModels.ts` | `SchemaName` 字面量联合类型 | swagger `components.schemas` 全部 key | 约束动态组件 prop，获得 IDE 补全 |

### 关键决策：Display 为中文显示名权威源

后端枚举的中文显示名**以 `[Display(Name = "...")]` 特性为准**（`System.ComponentModel.DataAnnotations`），不依赖 XML `<summary>` 注释：

- XML `<summary>` 描述更完整，作为 TS 类型注释给**开发者**读（写入 `apiEnums.ts`）。
- `[Display]` 面向终端用户文案，作为**运行时中文**渲染来源（写入 `apiEnumsDisplay.ts`）。

两者受众与语义不同，故分轨维护，不强行统一。

### 通用工程化模式

这套实践沉淀了若干跨项目通用的模式：

- **按需同步**：只同步 swagger 中被 DTO 实际引用的枚举，避免同步前端用不到的枚举。
- **externalTypes 跳过生成**：手写的 `apiEnums.ts` 设为 `externalTypes`，让 worma 跳过这些类型生成，避免重复定义冲突。
- **60 秒进程内缓存**：VS Code 扩展高频调用配置时，缓存避免重复打后端触发 HTTP 429。
- **降级保留旧文件**：后端不可用时跳过写文件，保留旧产物，worma 自动生成兜底类型。
- **CRLF → LF 归一化**：后端在 Windows 返回的字符串含 CRLF，统一替换为 LF 以符合 `.gitattributes`。

::: details 实现细节
完整的插件实现、双轨后端接口契约（`GetByNamesEnums` / `GetByNamesEnumDisplay`）、变量命名约定（`XxxEnum → XxxDisplay`）、边界情况与已知技术债，记录在项目内部知识库，不在官网展开。
:::

## 关联资源

- **Worma 官方文档**：<https://worma.js.org/docs>
- **alova 官方文档**：<https://alova.js.org/>
- **请求库用法**：见 [Alova.js](/core/alovajs)
- **主项目仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）
