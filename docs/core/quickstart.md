# 快速开始

BearPlan.Core 提供两种引入方式，按需选择：

- **Git Submodule**：参与主项目源码编译，可自由修改 Core 源码，适合深度定制场景。
- **NuGet 包**：二进制引用，版本固定、依赖隔离，适合直接复用无需改源的场景。

## 方式一：Git Submodule

适合需要阅读或修改 Core 源码的项目（如 BearPlan 主项目本身）。

### 引入子模块

```bash
# 在主项目根目录执行
git submodule add https://gitee.com/BearPlan/BearPlan.NET.Core.git BearPlan.Core
git commit -m "add BearPlan.Core as submodule"
```

### 克隆含子模块的项目

```bash
# 方式一：克隆时一并拉取子模块
git clone --recursive https://gitee.com/BearPlan/BearPlan.NET.git

# 方式二：已克隆的仓库补充拉取
git submodule update --init --recursive
```

### 引用项目

在主解决方案的 `.csproj` 中添加项目引用：

```xml
<ProjectReference Include="..\BearPlan.Core\BearPlan.Core.csproj" />
```

### 更新子模块

当 Core 仓库有新提交时，拉取最新版本：

```bash
cd BearPlan.Core
git pull origin master
cd ..
git add BearPlan.Core
git commit -m "update BearPlan.Core submodule"
```

## 方式二：NuGet 包

适合直接复用、不需要修改 Core 源码的项目。

### 添加包引用

在 `.csproj` 中添加：

```xml
<ItemGroup>
  <PackageReference Include="BearPlan.Core" Version="1.0.0" />
</ItemGroup>
```

或使用 .NET CLI：

```bash
dotnet add package BearPlan.Core
```

### 升级版本

```bash
dotnet add package BearPlan.Core --version 1.1.0
```

## 初始化配置

无论哪种引入方式，都需在应用启动时初始化 Core 的全局服务（`App`、`InternalApp`）：

```csharp
var builder = WebApplication.CreateBuilder(args);

// 初始化 Core 全局上下文
builder.Configuration.ConfigureApplication();   // 绑定 IConfiguration
builder.ConfigureApplication();                 // 绑定 WebApplicationBuilder
// ...
var app = builder.Build();
app.ConfigureApplication();                     // 绑定 IHost / IServiceProvider
```

::: tip
`ConfigureApplication()` 是 Core 提供的扩展方法，用于把主机环境、服务容器、配置对象注入到静态的 `App` / `InternalApp`，使全局可用。
:::

## 验证安装

初始化后，可在任意位置通过 `App` 静态类访问服务：

```csharp
// 获取配置选项
var jwtOptions = App.GetOptions<JwtAuthOptions>();

// 解析服务
var cache = App.GetService<ICache>();
```

如能正常获取，说明 Core 已就绪。

## 下一步

- 阅读 [框架介绍](/support/framework) 了解 Core 在整体架构中的定位。
- 前往 [Core 仓库](https://gitee.com/BearPlan/BearPlan.NET.Core) 查看完整源码与模块文档。
