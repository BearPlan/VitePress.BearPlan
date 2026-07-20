# === nginx 托管 VitePress 静态站点 ===
# 部署位置：服务器 /data/vite/（与 dist 子目录同级）
# 构建命令：docker build -t site.bearplan:1.0.0 .

FROM nginx:1.27-alpine

# 清空 nginx 默认页面，拷入本地已构建好的静态产物
WORKDIR /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY dist/ ./

EXPOSE 80
