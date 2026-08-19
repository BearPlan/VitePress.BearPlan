# 微信扫码登录：从公众号二维码到 Electron 桌面端的全链路实现

最近给 BearPlan 平台（.NET 后端 + Vue 管理端 + Electron 桌面端）接入了微信扫码登录。没有走微信开放平台的 OAuth 网站应用（需要企业资质与审核），而是用**认证服务号的带参二维码**实现了同等的扫码登录体验，并打通了「未注册微信扫码 → 验证码登录 → 自动绑定」的完整闭环。

这篇文章记录整体架构、关键实现，以及四个真实踩过的坑。

## 一、方案选型：为什么是公众号带参二维码

微信生态里做扫码登录，常见有三条路：

| 方案 | 前提 | 特点 |
| ---- | ---- | ---- |
| 微信开放平台（qrconnect） | 企业资质 + 网站应用审核 | 体验最标准（扫码后手机点确认），但门槛高 |
| 小程序码 | 小程序 | 需要额外开发小程序 |
| 公众号带参二维码 | 认证服务号 | 只需服务号，扫码即触发回调，成本最低 |

我们选了第三条：用户扫的是公众号的**带场景值二维码**（`QR_STR_SCENE`），微信服务器会把场景值随扫码事件回调给公众号消息接口——这个回调就是「用户已扫码」的信号，服务端据此判定登录状态并推送给等待中的客户端。

代价是没有「手机上点确认」的环节：扫码即终态。对工具型产品来说可以接受。

## 二、整体链路

```
┌──────────┐  1. CreateQrcode    ┌──────────┐
│  客户端   │ ──────────────────→ │  后端     │ ←── 微信 API：创建带参二维码
│ (浏览器/  │ ←────────────────── │          │      返回 { ticket, url }
│  Electron)│  2. SSE 长连接      │          │
└────┬─────┘  QrLoginStream     └────┬─────┘
     │                               │ 3. 用户扫码，微信服务器回调公众号接口
     │                               ↓
     │        4. 回调处理：按 OpenId/UnionId 查绑定用户
     │           ├─ 已绑定 → 状态 Confirmed + 写一次性登录凭证
     │           └─ 未绑定 → 状态 Unbound + 写一次性绑定凭证
     │                               │
     │        5. Redis Pub/Sub 通知 SSE 端点
     │ ←─────────────────────────────┘
     │  6. 收到 Confirmed → 调 LoginByWeixin 凭 ticket 换 Token
     └──────────────────────────────────→ 登录完成
```

几个设计决策：

**ticket 即会话标识。** `CreateQrcode` 生成 `"{客户端类型}_{雪花id}"` 形式的场景值（如 `Pc_123`、`UDhold_456`），同时作为 SSE 通道、缓存键、登录凭证的隔离键。客户端类型编码进前缀，扫码回调据此还原 Token 的签发版本。

**状态机只有四态。** `Waiting`（等扫码）/ `Confirmed`（已绑定用户扫码成功）/ `Unbound`（微信未绑定账号）/ `Expired`（二维码失效）。没有「已扫码待确认」——因为扫码即终态。

**Token 不走 SSE，凭证换 Token。** SSE 只推状态信号，客户端收到 `Confirmed` 后再发一次 HTTP 请求凭 ticket 换 Token。后文会讲为什么不做「SSE 直接推 Token」。

## 三、后端实现要点

### 3.1 创建二维码与状态初始化

```csharp
[HttpGet]
[AllowAnonymous]
public async Task<WeiXinQrCodeDTO> CreateQrcodeAsync(ApiVersion version)
{
    // 场景值编码客户端类型，扫码回调据此还原签发版本
    var ticket = $"{Enum.GetName(typeof(VersionEnum), version.MajorVersion)}_{IdHelper.NextId()}";
    var res = await QrCodeApi.CreateAsync(appId, 5000, 1,
        QrCode_ActionName.QR_STR_SCENE, ticket);

    // 初始化扫码状态为 Waiting，过期时间与二维码同步
    await App.Cache.SetAsync(CachePrefix.WeixinScanStatus + ticket,
        ScanLoginStatus.Waiting.ToString(), expire);

    return new WeiXinQrCodeDTO { Ticket = ticket, Url = res.url };
}
```

客户端拿到 `url` 后本地渲染二维码（前端 `qrcode` 库画 canvas，桌面端主进程转 dataURL），再凭 `ticket` 建立 SSE 连接。

### 3.2 扫码回调：状态判定与绑定凭证

公众号消息处理器里，两个事件都要接：**已关注用户**扫带参码触发 `Scan` 事件（EventKey 即场景值）；**未关注用户**扫码触发 `Subscribe` 事件（EventKey 带 `qrscene_` 前缀）。两条路最终进入同一个处理函数：

```csharp
private async Task HandleScanLoginEventAsync(string ticket, string openId)
{
    // 未关注用户扫码，EventKey 形如 qrscene_Pc_123，必须剥离前缀
    // 否则缓存键对不上，SSE 永远推不到状态
    if (ticket?.StartsWith("qrscene_") == true)
        ticket = ticket["qrscene_".Length..];

    await NotifyScanLoginAsync(ticket, openId);
}
```

`NotifyScanLoginAsync` 按 OpenId 查绑定用户（UnionId 兜底跨应用关联），分两个终态写缓存并经 Redis Pub/Sub 通知 SSE 端点：

```csharp
// 已绑定：写一次性登录凭证（读后即删），客户端凭 ticket 换 Token
// 未绑定：写一次性绑定凭证 bindToken → 真实 openId，
//         SSE 推 "Unbound:{bindToken}"，引导客户端走验证码登录 + 绑定
var statusValue = weixinUser?.UserId != null
    ? ScanLoginStatus.Confirmed.ToString()
    : $"{ScanLoginStatus.Unbound}:{bindToken}";

await App.Cache.SetAsync(CachePrefix.WeixinScanStatus + ticket, statusValue, expire);
await _redisSubscriber.PublishAsync(CachePrefix.WeixinScanNotify + ticket, statusValue);
```

注意 `Unbound` 的值是 `Unbound:{bindToken}` 带后缀的——所有消费端都要按「冒号前状态名」解析，终态判断同理。

### 3.3 SSE 端点：先查状态再订阅

有一个必须处理的竞态：**SSE 连接建立前用户就已经扫码**。所以端点先查一次当前状态（缓存里有就直接推、是终态就结束），再订阅 Redis 通道等后续变更：

```csharp
public async Task QrLoginStream(string ticket)
{
    Response.ContentType = "text/event-stream";

    // 1. 先查当前状态，处理「SSE 建立前已扫码」的竞态
    var current = await App.Cache.GetAsync<string>(statusKey);
    if (await HandleStatusAsync(current)) return;   // 终态推完即关流

    // 2. 订阅 Redis 通道等待扫码事件或客户端断开
    var tcs = new TaskCompletionSource<bool>();
    await _redisSubscriber.SubscribeAsync(notifyChannel, onNotify);
    await tcs.Task;

    // 3. 结束后退订（这一步的必要性见下文坑二）
    await _redisSubscriber.UnsubscribeAsync(notifyChannel, onNotify);
}
```

### 3.4 凭 ticket 换 Token

`LoginByWeixin` 从缓存读一次性登录凭证（含 UserId 与客户端类型），读后立即删除防重放，复用统一的 `LoginResult` 签发 AccessToken/RefreshToken——与账号密码登录、手机验证码登录同一套令牌体系。

### 3.5 未注册闭环：验证码登录即绑定

未绑定微信的用户扫码后，客户端自动跳到手机验证码登录，登录请求带上 SSE 下发的 `bindToken`：

```csharp
// LoginByPhone：验证码校验、建号/查号通过后
if (!string.IsNullOrEmpty(param.OpenId))   // 参数名叫 openId，承载的是 bindToken
{
    var bindKey = CachePrefix.WeixinScanBind + param.OpenId;
    var openId = await App.Cache.GetAsync<string>(bindKey);
    if (!string.IsNullOrEmpty(openId))
    {
        await App.Cache.RemoveAsync(bindKey);   // 一次性凭证，读后即删
        // upsert UserWeiXin：把真实 openId 绑定到当前登录用户
    }
}
```

**为什么参数不直接收 openId？** 安全考量：如果接口信任前端传来的裸 openId，攻击者可以把别人的 openId 绑到自己的账号——之后受害者微信一扫码，就会登进攻击者的账号。所以真实 openId 全程只存服务端缓存，前端只经手不透明的 `bindToken`（一次性、短时效），伪造它绑不了任何东西。

绑定完成后，该微信下次扫码直接 `Confirmed` 秒登。

## 四、Electron 桌面端：主进程消费 SSE

管理端（浏览器）可以用 `EventSource` 或 alova 的 `useSSE`，但 Electron 桌面端的请求都在主进程发（token 注入、登录态管理都在主进程），alova/axios 都不支持流式响应——只能用原生 `fetch` 手写 SSE 解析：

```ts
const res = await fetch(`${base}/api/Auth/QrLoginStream?ticket=${ticket}`, {
  headers: { 'api-version': '4.0' },
  signal: abortController.signal
})
const reader = res.body!.getReader()
const decoder = new TextDecoder()
let buffer = ''
for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  // SSE 以空行分帧，逐帧消费防半包
  let sep = buffer.indexOf('\n\n')
  while (sep >= 0) {
    const frame = buffer.slice(0, sep)
    buffer = buffer.slice(sep + 2)
    sep = buffer.indexOf('\n\n')
    const dataLine = frame.split('\n').find((l) => l.startsWith('data:'))
    if (dataLine) handleStatus(dataLine.slice(5).trim())
  }
}
```

两个细节：`AbortController` 用于刷新二维码/关窗时主动断开；undici 的 fetch 有默认 body 空闲超时（约 5 分钟），长时间无人扫码的连接会被客户端掐断，需要按 expired 引导用户刷新二维码。

## 五、踩坑实录

### 坑一：SSE 推的是 C# 枚举名，PascalCase

后端 `nameof(ScanLoginStatus.Confirmed)` 推出来的是 `"Confirmed"`，而客户端按惯用的小写 `'confirmed'` 比较——**永远不命中**。症状非常隐蔽：链路全通、日志能看到状态到达，但 UI 毫无反应。客户端解析时统一归一：

```ts
const raw = dataLine.slice(5).trim()
const sepIdx = raw.indexOf(':')
const status = (sepIdx >= 0 ? raw.slice(0, sepIdx) : raw).toLowerCase()
const bindToken = sepIdx >= 0 ? raw.slice(sepIdx + 1) : undefined
```

注意只对状态名小写化——`Unbound:` 后缀里的绑定凭证是大小写敏感的。

### 坑二：断开的连接 + 悬挂的 Redis 回调 = 进程崩溃

这是最凶的一个。现象是后端无征兆抛 `ObjectDisposedException: IFeatureCollection has been disposed`，调用栈指向 SSE 的 `Response.WriteAsync`。

根因是一个组合拳：

1. 客户端断开（用户关窗、刷新二维码 abort 连接），HTTP 上下文随之 dispose；
2. 但 Redis 订阅**没有退订**，回调还挂着；
3. 此时用户扫了码，回调被触发，向已释放的 Response 写数据 → `ObjectDisposedException`；
4. 致命的一步：`SubscribeAsync(channel, async msg => ...)` 的 lambda 是 `Action<string>` 的 async lambda，本质 **async void**——异常不经过 ASP.NET 管线，直接成为进程级未处理异常。

修复分三层：

```csharp
// 回调提为局部变量（退订要传同一实例），入口查取消态，写入包 try/catch
Action<string> onNotify = async message =>
{
    if (cts.IsCancellationRequested) { tcs.TrySetResult(false); return; }
    try
    {
        if (await HandleStatusAsync(message)) tcs.TrySetResult(true);
    }
    catch (ObjectDisposedException)
    {
        tcs.TrySetResult(false);   // 响应已随连接释放，静默结束
    }
};
await _redisSubscriber.SubscribeAsync(notifyChannel, onNotify);
await tcs.Task;
await _redisSubscriber.UnsubscribeAsync(notifyChannel, onNotify);  // 结束必退订
```

退订还有个实现细节：StackExchange.Redis 按**回调实例**匹配退订，中间包装过一层的话必须用 map 保存「业务回调 → 包装实例」的对应关系，否则退不掉。

### 坑三：preload 包装的 `ipcRenderer.on` 剥掉了 event

Electron 的 preload 里常见这样封装：

```ts
on: (channel, callback) => {
  const subscription = (_event, ...args) => callback(...args)  // 剥掉了 event！
  ipcRenderer.on(channel, subscription)
  return () => ipcRenderer.removeListener(channel, subscription)
}
```

渲染层按 Electron 惯例写 `(_event, payload) => {...}`，实际 payload 落在 `_event` 位上、`payload` 是 `undefined`，一访问属性就抛 TypeError——又是「链路全通但 UI 无反应」。用这类包装 API 时，回调**首参即 payload**。

### 坑四：API 多版本路由要按客户端注册

接口带 `[ApiVersion(VersionEnum.Pc)]` 就只对 Pc 版本（`api-version: 1.0`）开放。桌面端统一带 `api-version: 4.0`（UDhold），调这些接口直接 404。新增客户端类型时，所有登录相关接口都要补注册对应版本，并且 ticket 前缀要能在回调侧还原出正确的签发版本。

## 六、为什么不在 SSE 里直接推 Token

实现过程中考虑过：已绑定用户扫码成功时，让后端直接在 SSE 里把 Token 推下来，省一次 HTTP 往返。最终没这么做，三个理由：

1. **Token 白签**：扫码回调在微信服务器的同步链路里，微信对回调有 5 秒超时（超时重试 3 次）；签发 Token 是重操作（查权限、生成 JWT、写在线状态）。而且扫码时 SSE 连接可能早已断开——签了没人收，还占在线缓存。「轻凭证 + 按需换 Token」让回调只做一次缓存 SET。
2. **丢消息不可恢复**：SSE 没有送达确认，客户端恰好在收到 Token 的瞬间断开，Token 即丢失且二维码已终态失效，只能重新扫码。而「信号 + 换 Token」模型下，SSE 断了可以重连重查状态，ticket 凭证有时效兜底。
3. **泄露面**：Token 会明文经过 Redis 通道与 SSE 帧，任何 `console.log(data)` 式的调试打印都会把它落进日志。ticket 只是能换 Token 的一次性中间凭证，泄露危害可控。

## 七、总结

公众号带参二维码 + Redis Pub/Sub + SSE 的组合，可以在不申请微信开放平台的前提下做出完整的扫码登录。整条链路的复杂度不在任何单个环节，而在**三端契约的一致性**（状态字符串格式、带后缀的解析、多版本路由）与**生命周期的收口**（SSE 连接与 Redis 订阅的成对创建/销毁）。

最有价值的经验是坑二：**凡是用「回调 + 长连接」组合，连接结束时必须回收回调**，否则悬挂回调会在你意想不到的时刻向已释放的资源写入；而 async void 的回调里任何未捕获异常都是进程级事故。
