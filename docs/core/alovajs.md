# Alova.js

> BearPlan.Admin 的请求层。alova 用 hook 自管 `loading` / `data` / `error`，配合 [Worma](/core/worma) 自动生成的 API 代理，把"写请求函数 + 手维护 loading"压缩为解构一个 hook。

## 这是什么

alova 是一个请求策略库，定位类似 axios，但更进一步——把请求状态（loading、data、error）和请求策略（缓存、分页、表单、SSE）封装成 Vue 等框架的 hook，**页面只解构，不手动 `ref` 管理状态**。

| 对比项 | axios | alova |
| ------ | ----- | ----- |
| 返回值 | Promise（需手动管理 loading/data） | 框架响应式状态（hook 自管） |
| 分页 / 表单 / SSE | 自行封装 | 内置 `usePagination` / `useForm` / `useSSE` |
| 类型安全 | 手写接口类型 | 配合 Worma 自动生成 DTO 与 API |
| API 组织 | 散落各页面 | `Apis.{tag}.{method}()` 集中代理 |

BearPlan 选 alova 的核心原因是 **与 Worma 配套**：Worma 从后端 swagger 自动生成 `Apis` 代理与 TypeScript 类型，页面用 alova hook 消费它，**后端接口变更 → 前端重新生成即可同步**，告别手写请求函数。

整体架构与前后端协同见 [框架介绍](/core/framework)，API 自动生成机制见 [Worma](/core/worma)。本文聚焦请求库本身。

## 在 BearPlan 中的位置

```
后端 swagger.json
       │
       ▼
Worma 生成 Apis 代理 + TypeScript 类型（详见 /core/worma）
       │
       ▼
页面用 alova hook 消费 Apis.{tag}.{method}()
       │
       ▼
useRequest / useForm / usePagination / useSSE 自动管理状态
```

约定两层各司其职：

- **API 定义层**（Worma 生成）：封装 alova Method，PascalCase 命名，对应后端 Action。
- **页面调用层**（业务代码）：用 alova hooks 调用 API 定义层，**不直接 `ref` + `async/await`**。

## 实例与全局拦截器（createAlova）

alova 实例承载全局拦截器，所有 `Apis.{tag}.{method}()` 生成的 Method 都经过这里。

```ts
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { axiosRequestAdapter } from '@alova/adapter-axios'

export const alovaInstance = createAlova({
  statesHook: vueHook,
  baseURL: '/api',
  requestAdapter: axiosRequestAdapter(),
  beforeRequest(method) {
    // 统一注入鉴权头
    method.config.headers.Authorization = `Bearer ${token}`
  },
  responded: {
    onSuccess: async response => {
      const { data: rawData } = response
      // 原始响应（纯字符串、null、无 code 字段）直接放行，不走统一格式校验
      if (rawData === null || typeof rawData !== 'object' || rawData.code === undefined) {
        return rawData
      }
      // 统一格式 { code, data, msg }：code === 0 视为成功
      if (rawData.code === 0) return rawData
      return Promise.reject(rawData)
    },
    onError: error => {
      const status = error.status ?? error.response?.status
      if (status === 401) throw error   // 交给无感刷新
      if (status === 403) router.push('/pairing')
      throw error
    }
  }
})
```

BearPlan 后端大部分接口走统一响应包装 `{ code, data, msg }`，但带 `[NoFormatResponse]` 或 `[Produces("text/plain")]` 的接口（如微信扫码返回纯字符串）走原始响应——`onSuccess` 通过 `typeof` / `null` / 无 `code` 字段三判放行原始结构，避免误判。

::: tip 页面不写 try/catch
异常统一由底层 `responded.onError` 拦截器处理。页面只解构 hook 的状态、在 `transform` 里写副作用（提示、跳转、状态回写），**不要**用 `try/catch` 包裹请求，也不要写额外的 `onSuccess` / `onError` 回调。
:::

## 核心 Hooks 速览

| 场景 | hook | 用途 |
| ---- | ---- | ---- |
| 数据加载、详情查询 | `useRequest` | 自动管理 loading/data，挂载即请求 |
| 删除、切换等非自动操作 | `useRequest` + `immediate: false` | 手动触发 |
| 表单提交（新增 / 编辑） | `useForm` | 自动管理 form / reset / updateForm |
| 分页列表 | `usePagination` | 自动管理 page/pageSize/total |
| SSE 长连接（扫码、进度） | `useSSE` | 订阅消息流，终态显式 close |

### useRequest — 数据加载

```ts
const {
  send: getDevices,
  loading: getDevicesLoading,
  data: devices
} = useRequest(
  () => Apis.device.getDevices(),
  { immediate: true, initialData: [], force: true }
)
```

### useRequest 手动触发 — 删除

`immediate: false` 配合 `send` 别名，用于非自动加载场景：

```ts
const { send: deleteDevice } = useRequest(
  (id: string) => Apis.device.deleteDevice({
    pathParams: { id },
    transform: () => {
      devices.value = devices.value.filter(d => d.id !== id)  // 副作用写进 transform
    }
  }),
  { immediate: false, initialData: [], force: true }
)

deleteDevice(deviceId)
```

### useForm — 表单提交

```ts
const { form, send: submit, reset, updateForm } = useForm(
  formData => Apis.device.postApiDevice({
    data: { name: formData.name?.trim(), type: formData.type }
  }),
  { resetAfterSubmiting: true }
)
```

- **新增对话框**：`reset()` 清空表单后打开。
- **编辑对话框**：`updateForm(row)` 预填数据后打开。
- `resetAfterSubmiting: true` 提交成功后自动清空（编辑场景设 `false` 保留）。

### usePagination — 分页列表

```ts
const {
  data, page, pageSize, total, loading,
  send: getData, reload
} = usePagination(
  (page, pageSize) => Apis.order.getMyPage({
    params: { PageIndex: page, PageSize: pageSize, KeyWord: keyword.value }
  }),
  {
    watchingStates: [],           // 不监听状态自动触发，改为手动
    immediate: true,
    initialPage: 1,
    initialPageSize: 10,
    total: res => res.data.pagerInfo?.totalRowCount || 0,
    data: res => res?.data.data
  }
)
```

- 搜索：先 `page.value = 1` 再 `getData()`，避免在第 N 页搜不到数据。
- 重置：清空搜索条件后用 `reload()` 回到第一页。
- `total` / `data` 两个回调用于适配后端嵌套响应结构。

### useSSE — Server-Sent Events

```ts
const { send: openStream, close: closeStream, onMessage } = useSSE(
  () => Apis.auth.qrLoginStream({
    params: { ticket: ticket.value },
    headers: { 'api-version': 1.0 }   // SSE 不走 beforeRequest，需显式声明头
  }),
  { interceptByGlobalResponded: false, initialData: '' }
)

onMessage(event => {
  const msg = String(event.data || '').trim()
  if (!msg) return
  if (msg === 'confirmed' || msg === 'expired') closeStream()  // 终态必须显式关闭
})
```

::: warning SSE 两个坑
- **`interceptByGlobalResponded: false`**：SSE 流非 `{ code, data, msg }` 结构，走全局拦截器会误判抛错。
- **不走 `beforeRequest`**：alova 的 SSE 实现用 `fetch` 模拟 `EventSource`，不会触发实例的 `beforeRequest`，鉴权头需在 Method 上显式声明。
:::

## 命名规范（项目约定）

BearPlan 项目对 alova hooks 解构别名有统一约定，详见书写规范，要点：

- **`send` 别名用 camelCase + 动词前缀**：`send: getDevices`、`send: deleteDevice`、`send: openStream`——不跟随 API 定义层的 PascalCase。
- **`loading` 别名加 `Loading` 后缀**：`loading: getDevicesLoading`、`loading: deleteDeviceLoading`。
- **多个 loading 用 `computed` 合并**：`const loading = computed(() => a.value || b.value)`。
- **三参数必写**：每个 `useRequest` 必须明文写 `immediate`、`initialData`、`force`。
- **箭头函数单参数省括号**：`transform: res => ...`、`transform: async res => ...`，靠类型推断，**不写** `(res: any)`；零参数或多参数才加括号。
- **API 定义层仍用 PascalCase**：`Apis.WeiXin.CreateQrcode`，两层命名各司其职。

## 关联资源

- **alova 官方文档**：<https://alova.js.org/>
- **Worma（API 自动生成）**：见 [Worma](/core/worma)
- **主项目仓库**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Core 独立仓库**：<https://gitee.com/BearPlan/BearPlan.NET.Core>
- **开发文档**：<https://bear.js.org/>
- **作者微信**：Byte_Xiong（备注：框架）
