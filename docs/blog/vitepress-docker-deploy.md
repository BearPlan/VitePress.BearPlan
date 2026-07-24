# VitePress 站点 Docker 部署

VitePress 构建后是一堆纯静态文件（HTML/CSS/JS），部署只需一个静态服务器。本方案用 nginx 官方镜像托管，**本机构建 → 打进镜像 → 服务器拉起容器**，无需在服务器装 Node.js、无需拷贝文件，一次成型。

相比 scp 拷贝 dist 到服务器再 nginx reload，镜像化部署的优势是：版本可回滚、环境一致、迁移到新服务器零配置。

## 整体流程

```
开发机                       服务器
─────────                    ─────────
pnpm docs:build   ──┐
docker build      ──┼──> docker save / 镜像仓库 ──> docker load
docker run(可选)  ──┘                                 docker.sh 启动
```

镜像流转有两种方式：
- **save/load**（本文采用）：`docker save` 导出 tar，scp 上传，服务器 `docker load`。简单直接，不需镜像仓库。
- **registry**：推到私有仓库，服务器 `docker pull`。适合多台服务器或频繁发布。

## 前置准备

服务器需要安装 Docker 并启动：

```bash
# 安装 Docker（Ubuntu/Debian）
curl -fsSL https://get.docker.com | sh

# 启动并设置开机自启
sudo systemctl enable --now docker

# 验证
docker --version
```

## 部署目录约定

服务器上固定目录结构（脚本默认从 `/data/vite/` 读取）：

```
/data/vite/
├── dist/              # 不直接用，构建后打进镜像
├── Dockerfile         # 本教程提供的镜像构建文件
└── docker.sh          # 容器启动脚本
```

> `Dockerfile` 与 `docker.sh` 与 `dist/` 同级。`docker.sh` 用脚本所在目录定位镜像，不依赖绝对路径。

## 第一步：本机构建静态产物

VitePress 构建前确认 `docs/.vitepress/config.mts` 中 `base` 路径与最终访问路径一致（根路径部署用 `/`，子路径部署用 `/docs/` 等）。

```bash
# 安装依赖
pnpm install

# 构建，产物输出到 docs/.vitepress/dist
pnpm docs:build
```

构建完成后把产物拷到部署目录根（与 Dockerfile 同级）：

```bash
# 假设部署目录就是项目根
cp -r docs/.vitepress/dist ./dist
```

## 第二步：编写 Dockerfile

基于 `nginx:1.27-alpine`，把构建好的 `dist/` 拷进去。alpine 版本镜像只有约 40MB，非常轻量。

```dockerfile
# === nginx 托管 VitePress 静态站点 ===
# 部署位置：服务器 /data/vite/（与 dist 子目录同级）
# 构建命令：docker build -t site.bearplan:1.0.0 .

FROM nginx:1.27-alpine

# 清空 nginx 默认页面，拷入本地已构建好的静态产物
WORKDIR /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY dist/ ./

EXPOSE 80
```

关键点：

- `RUN rm -rf` 先清空 nginx 默认的欢迎页，避免残留。
- `COPY dist/ ./` 用尾部 `/` 表示拷贝目录内容，而非整个目录。
- **不需要自定义 nginx.conf**：VitePress 生成的是标准静态站点，nginx 默认配置即可托管。如需 SPA fallback、gzip、缓存策略，再额外挂载配置。

## 第三步：构建镜像

```bash
# 在 Dockerfile 所在目录执行
docker build -t site.bearplan:1.0.0 .
```

镜像名 `site.bearplan` 与版本 `1.0.0` 要和 `docker.sh` 里的 `IMAGE_NAME` 保持一致。

验证镜像构建成功：

```bash
docker images | grep site.bearplan
```

## 第四步：本地试跑（可选）

正式部署前先本机跑一下，确认站点正常：

```bash
docker run -d --name site.bearplan.test -p 8080:80 site.bearplan:1.0.0
```

浏览器访问 `http://localhost:8080`，确认页面渲染正常后停掉：

```bash
docker stop site.bearplan.test && docker rm site.bearplan.test
```

## 第五步：导出镜像并上传服务器

**服务器装 Docker 但不装 Node.js**，所以构建在本机完成，只把镜像传上去。

```bash
# 本机：导出镜像为 tar
docker save site.bearplan:1.0.0 -o site.bearplan.tar

# 上传到服务器
scp site.bearplan.tar root@<服务器IP>:/data/vite/

# 服务器：加载镜像
ssh root@<服务器IP>
cd /data/vite
docker load -i site.bearplan.tar

# 加载完可删除 tar 节省空间
rm site.bearplan.tar
```

> 镜像 tar 通常 50~100MB，比拷贝整个源码再服务器构建快得多。

## 第六步：服务器启动容器

把 `docker.sh` 也上传到 `/data/vite/`，赋予执行权限后运行：

```bash
chmod +x docker.sh
./docker.sh site.bearplan 7004
```

`docker.sh` 完整内容：

```bash
#!/bin/bash
# Docker 容器管理脚本（VitePress 静态站点）
# 部署位置：服务器 /data/vite/（与 dist 子目录同级）

CONTAINER_NAME="$1"
SERVER_PORT="$2"
IMAGE_NAME="site.bearplan:1.0.0"
INTERNAL_PORT=80

if [ -z "$CONTAINER_NAME" ] || [ -z "$SERVER_PORT" ]; then
    echo "使用方法: $0 <容器名称> <端口号>"
    echo "示例: $0 site.bearplan 7004"
    exit 1
fi

echo "🐳 创建 Docker 容器：${CONTAINER_NAME}"
echo "📡 端口：${SERVER_PORT} -> ${INTERNAL_PORT}"

# 停止并删除现有容器（如果存在）
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🔄 停止并删除现有容器..."
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
fi

# 创建新容器
docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${SERVER_PORT}:${INTERNAL_PORT}" \
    --restart unless-stopped \
    "${IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ 容器创建成功！"
    echo "🌐 访问地址：http://127.0.0.1:${SERVER_PORT}"
    echo "📝 查看日志：docker logs ${CONTAINER_NAME}"
    echo "🛑 停止容器：docker stop ${CONTAINER_NAME}"
else
    echo "❌ 容器创建失败！"
    exit 1
fi
```

脚本设计要点：

- **参数化容器名和端口**：一份脚本可部署多套环境（测试/生产），通过参数区分。
- **自动清理旧容器**：重复执行不会报错，自动停删旧容器再创建新的，天然支持重新部署。
- **`--restart unless-stopped`**：容器异常退出自动拉起，除非手动 stop。服务器重启后也会自动恢复。

## 第七步：验证与访问

```bash
# 查看容器状态（应显示 Up）
docker ps | grep site.bearplan

# 查看启动日志
docker logs site.bearplan

# 容器内 nginx 是否正常
curl http://127.0.0.1:7004
```

服务器本机能访问后，配置 Nginx 反向代理或云厂商 SLB 把域名指向 `7004` 端口即可对外服务。

## 日常更新流程

文档更新后的完整发布步骤（熟练后 1 分钟搞定）：

```bash
# === 本机 ===
pnpm docs:build
cp -r docs/.vitepress/dist ./dist
docker build -t site.bearplan:1.0.0 .
docker save site.bearplan:1.0.0 -o site.bearplan.tar
scp site.bearplan.tar root@<服务器IP>:/data/vite/

# === 服务器 ===
cd /data/vite
docker load -i site.bearplan.tar
rm site.bearplan.tar
./docker.sh site.bearplan 7004
```

## 常见问题

### 端口被占用

```bash
# 查看端口占用
ss -tlnp | grep 7004
```

换一个空闲端口，或停掉占用进程。阿里云/腾讯云服务器还要在云控制台**安全组**放行对应端口。

### 页面 404 但容器正常

检查 `docs/.vitepress/config.mts` 的 `base` 配置：
- 根路径部署（`http://domain.com/`）：`base: '/'`
- 子路径部署（`http://domain.com/docs/`）：`base: '/docs/'`

### 镜像过大

确认 Dockerfile 用的是 `nginx:alpine` 而非 `nginx:latest`。alpine 版本约 40MB，默认版本超过 150MB。

### 访问很慢

nginx 默认不开 gzip。在容器内挂载自定义 nginx.conf 开启压缩：

```bash
docker run -d \
    --name site.bearplan \
    -p 7004:80 \
    -v /data/vite/nginx.conf:/etc/nginx/conf.d/default.conf \
    --restart unless-stopped \
    site.bearplan:1.0.0
```

自定义 `nginx.conf` 关键片段：

```nginx
server {
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # 开启 gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1k;

    # SPA fallback：刷新子路由不 404
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 小结

整套部署方案的核心优势：

1. **服务器零环境依赖**：只需 Docker，不装 Node.js、不装 nginx、不拷贝文件。
2. **版本可回滚**：保留旧镜像，出问题 `docker run` 旧版本即可。
3. **迁移简单**：换服务器只需 `docker load` + `docker.sh`，无配置残留。
4. **脚本可复用**：`docker.sh` 参数化，多环境多端口一份脚本搞定。

完整部署目录结构：

```
/data/vite/
├── dist/                    # 构建产物（打进镜像后可删）
├── Dockerfile               # 镜像定义
├── docker.sh                # 启动脚本
└── site.bearplan.tar        # 导出的镜像（load 后可删）
```

五个文件（三个常驻 + 两个临时），即可完成 VitePress 站点的完整 Docker 化部署。
