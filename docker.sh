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
