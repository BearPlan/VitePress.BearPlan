# 后端部署（BearPlan.Api）

BearPlan.Api 是基于 .NET 10 的后端服务，采用 **本机发布 + 上传产物 + Docker 运行** 的部署方式：开发机用 `dotnet publish` 生成完整运行时文件，上传到服务器，用精简的 aspnet 镜像直接跑。

这种方式的优点：

- **服务器零 SDK 依赖**：不需要在服务器装 .NET SDK，只需 Docker。
- **构建环境可控**：在本机发布的版本与开发环境完全一致，避免服务器构建差异。
- **镜像极小**：runtime-only 镜像只有约 200MB，无 SDK 冗余。

## 整体流程

```
开发机                                    服务器
─────────                                 ─────────
dotnet publish -c Release   ──┐
     │                        │
生成 publish/ 目录              ├──> scp 上传到 /data/udhold.api/publish/
     │                        │
docker build (可选本地验证) ──┘           docker run (aspnet 镜像)
                                          挂载 publish 目录、配置、日志
```

## 前置准备

### 服务器安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
docker --version
```

### 中间件就绪

后端依赖 MySQL（或 SQLite）、Redis、可选 RabbitMQ。确认这些服务已部署且 BearPlan.Api 容器能访问。如果中间件跑在宿主机上，需要：

1. 中间件监听 `0.0.0.0`（不是 `127.0.0.1`）。
2. 防火墙放行 docker 网段访问对应端口，详见 [Docker 被防火墙拦截](/blog/deploy/docker-firewall-allow-subnet)。

## 第一步：本机发布

在 `BearPlan.Api` 项目根目录执行发布命令：

```bash
# 发布 Release 版本到指定目录
dotnet publish BearPlan.Api/BearPlan.Api.csproj -c Release -o ./publish
```

::: tip 指定运行时
如果服务器是 Linux x64，开发机是 Windows，发布时要指定运行时：

```bash
dotnet publish BearPlan.Api/BearPlan.Api.csproj -c Release -r linux-x64 -o ./publish
```

`-r linux-x64` 让发布的产物自带 Linux 运行时，无需服务器再装 .NET。
:::

发布完成后 `publish/` 目录包含：

```
publish/
├── BearPlan.Api.dll           # 主程序
├── BearPlan.Api.exe           # Windows 入口（Linux 不用）
├── appsettings.json           # 默认配置
├── wwwroot/                   # 静态资源（含 ip2region.xdb）
├── *.dll                      # 依赖程序集
└── ...
```

## 第二步：编写 Dockerfile

Dockerfile 只含运行时镜像，不含 SDK 构建阶段——产物由本机发布好后整体放入镜像或挂载进容器。

```dockerfile
# 使用官方 .NET 10.0 运行时镜像
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /publish

# 环境变量
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV TZ=Asia/Shanghai
ENV ASPNETCORE_ENVIRONMENT=Production

# 入口点
ENTRYPOINT ["dotnet", "BearPlan.Api.dll"]
```

关键点：

- **`aspnet:10.0` 而非 `sdk:10.0`**：运行时镜像，体积小，只跑不编译。
- **`WORKDIR /publish`**：与后续挂载路径一致。
- **时区 `TZ=Asia/Shanghai`**：保证日志和业务时间正确。

## 第三步：构建镜像（可选）

如果选择把产物打进镜像（而非挂载），在本机 `publish/` 目录父级执行：

```bash
# 把整个 publish 目录拷进镜像
docker build -t udhold.api:1.0.0 .
```

镜像构建后可本机试跑验证：

```bash
docker run -d --name udhold.api.test -p 6010:6010 udhold.api:1.0.0
docker logs -f udhold.api.test
```

确认启动正常后停掉：

```bash
docker stop udhold.api.test && docker rm udhold.api.test
```

::: warning 推荐用挂载而非打进镜像
本项目实际部署用**挂载 publish 目录**的方式（见下一步 docker.sh），好处是更新代码只需替换目录文件、重启容器，不用重新构建镜像。镜像只负责提供运行时环境。
:::

## 第四步：上传产物到服务器

把本机 `publish/` 整个目录上传到服务器约定路径：

```bash
scp -r ./publish root@<服务器IP>:/data/udhold.api/
```

服务器目录结构约定：

```
/data/udhold.api/
├── publish/                    # 后端运行文件（含 DLL、wwwroot 等）
├── appsettings.Production.json # 生产环境配置（覆盖 publish 内默认配置）
├── App_Data/                   # 业务数据目录（数据库文件等）
├── wwwroot/                    # 可替换的静态资源（插件、导出文件）
├── logs/                       # 日志输出目录
├── db/                         # SQLite 数据库文件目录
├── Dockerfile                  # 镜像定义
└── docker.sh                   # 启动脚本
```

## 第五步：生产环境配置

`appsettings.Production.json` 是生产专属配置，会覆盖镜像内的默认 `appsettings.json`。关键配置项：

```json
{
  "System": {
    "MainDatabase": "BearPlan.MySql",
    "LogDatabase": "BearPlan.Log",
    "ConfigProviderDatabase": "BearPlan.ConfigProvider",
    "UseRedisCache": true,
    "IsInitDb": true
  },
  "DataConnection": {
    "ConnectionItem": [
      {
        "ConnId": "BearPlan.MySql",
        "DBType": 0,
        "Enabled": true,
        "ConnectionString": "Server=<宿主机真实网卡IP>;Port=3306;Database=baerplan_db;Uid=root;Pwd=<密码>;"
      }
    ]
  },
  "Redis": {
    "Host": "<宿主机真实网卡IP>",
    "Port": 6379,
    "Password": "<密码>"
  }
}
```

::: danger 容器内不要用 localhost
连接字符串的 `Server` **不能写 `localhost` 或 `127.0.0.1`**——容器内的 localhost 指向容器自己，连不到宿主机。要用：

- 宿主机真实网卡 IP（`ip addr` 查到的 eth0 地址）
- 或 `host.docker.internal`（需 docker.sh 加 `--add-host=host.docker.internal:host-gateway`）
:::

## 第六步：服务器启动容器

`docker.sh` 封装了容器的停止、删除、重建流程：

```bash
#!/bin/bash
# 使用：./docker.sh <容器名称> <端口>
# 示例：./docker.sh udhold.api 6010

processName=$1
serverPort=$2

if [[ -z $processName || -z $serverPort ]]; then
    echo "Usage: $0 <process_name> <server_port>"
    exit 1
fi

WORK_DIR=$(cd $(dirname $0) && pwd)
LOG_DIR=$WORK_DIR/logs
DB_DIR=$WORK_DIR/db

mkdir -p $LOG_DIR $DB_DIR
chmod -R 777 $LOG_DIR $DB_DIR

IMAGE_NAME="udhold.api:1.0.0"

docker stop $processName 2>/dev/null
docker rm $processName 2>/dev/null

docker run -d \
  --restart always \
  --add-host=host.docker.internal:host-gateway \
  -p $serverPort:$serverPort \
  -v $WORK_DIR/publish:/publish \
  -v $WORK_DIR/appsettings.Production.json:/publish/appsettings.Production.json \
  -v $WORK_DIR/App_Data:/publish/App_Data \
  -v $WORK_DIR/wwwroot:/publish/wwwroot \
  -v $LOG_DIR:/publish/Logs \
  -v $DB_DIR/BearPlan.Log.db:/publish/BearPlan.Log.db \
  -e TZ=Asia/Shanghai \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ASPNETCORE_URLS=http://+:$serverPort \
  --name $processName \
  $IMAGE_NAME
```

脚本设计要点：

| 设计 | 作用 |
| --- | --- |
| **参数化容器名和端口** | 一份脚本可部署多套环境（测试 / 生产），通过参数区分 |
| **自动停删旧容器** | 重复执行不报错，天然支持重新部署 |
| **`--add-host=host.docker.internal:host-gateway`** | Linux 必需，让容器能解析到宿主机 |
| **挂载 `publish` 目录** | 更新代码只替换文件 + 重启，不重构建镜像 |
| **挂载 `appsettings.Production.json`** | 配置与镜像解耦，改配置不重构建 |
| **挂载 `wwwroot`、`App_Data`、`Logs`、`db`** | 可变数据持久化到宿主机，容器重建不丢数据 |
| **`--restart always`** | 容器异常退出自动拉起，服务器重启后自动恢复 |

启动：

```bash
cd /data/udhold.api
chmod +x docker.sh
./docker.sh udhold.api 6010
```

## 第七步：验证

```bash
# 容器状态（应显示 Up）
docker ps | grep udhold.api

# 启动日志
docker logs -f udhold.api --tail 80

# 本机访问健康检查（如有健康检查接口）
curl http://127.0.0.1:6010/health
```

日志中出现 `Now listening on: http://+:6010` 即启动成功。

## 日常更新流程

代码更新后的发布步骤：

```bash
# === 本机 ===
cd <项目根目录>
dotnet publish BearPlan.Api/BearPlan.Api.csproj -c Release -r linux-x64 -o ./publish
scp -r ./publish/* root@<服务器IP>:/data/udhold.api/publish/

# === 服务器 ===
cd /data/udhold.api
./docker.sh udhold.api 6010
```

## 常见问题

### 启动报 `Unable to connect to MySQL hosts`

容器连不到数据库。排查顺序：

1. 中间件是否监听 `0.0.0.0`（`ss -tlnp | grep 3306`）。
2. 容器内 TCP 是否可达（`docker exec udhold.api sh -c "(echo > /dev/tcp/<IP>/3306) && echo OK"`）。
3. 防火墙是否放行 docker 网段（`iptables -L INPUT`）。
4. 连接字符串 `Server` 是否写了宿主机真实网卡 IP（不是 localhost）。

详见 [Docker 被防火墙拦截](/blog/deploy/docker-firewall-allow-subnet)。

### 启动报 `Could not find ip2region.xdb`

挂载 `wwwroot` 时把镜像内的 `resources/ip/ip2region.xdb` 遮蔽了。两种解决方式：

- 把 `ip2region.xdb` 补到宿主机 `$WORK_DIR/wwwroot/resources/ip/` 目录。
- 或调整挂载策略，只挂载需要可写的子目录（如 `exportFile`、`plugins`），不整体覆盖 `wwwroot`。

### 配置不生效

确认 `appsettings.Production.json` 文件**不是空的**，且挂载路径与 `docker.sh` 中 `-v` 一致：

```bash
docker exec udhold.api cat /publish/appsettings.Production.json
```

### 容器时区不对

`docker.sh` 已设置 `-e TZ=Asia/Shanghai`。如果仍不对，确认镜像内安装了 `tzdata`，或挂载宿主机时区：

```bash
-v /etc/localtime:/etc/localtime:ro
```

## 小结

后端部署核心思路：**镜像只管运行时环境，业务文件全部挂载**。这样：

- 更新业务代码：替换 `publish/` 文件 + 重启容器，无需重新 build 镜像。
- 改配置：编辑 `appsettings.Production.json` + 重启容器。
- 数据持久化：`App_Data`、`Logs`、`db` 都挂载到宿主机，容器销毁不丢数据。

一次搭建好后，日常更新只需「发布 → 上传 → `./docker.sh`」三步。
