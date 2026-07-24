**Docker 被防火墙拦截的排查与修复**

## 背景

在宿主机用 Docker 部署 .NET / Java 应用，宿主机上同时跑着 MySQL、Redis 等中间件。容器启动时报连接错误，例如：

```
Unable to connect to any of the specified MySQL hosts.
An exception was thrown while activating RedisCache.
```

但宿主机上对应服务明明启动了，`bind` 也设了 `0.0.0.0`，从容器内 `ping` 宿主机 IP 也能通。问题到底出在哪？

## 根因

UFW（Uncomplicated Firewall）等防火墙的 INPUT 链默认策略是 `DROP`，会丢弃所有进入宿主机的流量。Docker 容器访问宿主机服务时，源 IP 是 docker 网段（如 `172.18.0.x`），这些流量会被 INPUT 链默认丢弃，导致容器 TCP 连不上宿主机端口。

`ping` 能通是因为 ICMP 常被放行；但 MySQL / Redis 是 TCP，会被拦下。这是「能 ping 通但端口连不上」的典型成因之一。

## 排查步骤

### 1. 查看本机 IP 段

确认宿主机真实网卡 IP 与 docker 网桥网段，避免把 Server 写成 `docker0` 的 IP（网桥上没有跑业务服务）。

```bash
ip addr | grep "inet " | grep -v 127.0.0.1
```

典型输出：

```
inet 192.168.1.100/24   ... eth0       # 真实网卡，可作 Server
inet 172.18.0.1/16      ... docker0    # 默认网桥，不能作 Server
inet 172.19.0.1/16     ... br-xxxx    # 自定义 docker 网络
```

### 2. 查看防火墙是否放行 docker 网段

```bash
sudo iptables -L INPUT -n --line-numbers | head -20
```

如果看到 `Chain INPUT (policy DROP)`，说明默认拒绝所有进入流量，docker 容器流量也会被丢弃。

### 3. 确认目标服务监听 0.0.0.0

```bash
ss -tlnp | grep 6379
```

- `127.0.0.1:6379` → 只监听本地，容器连不进来，需改 `bind 0.0.0.0`。
- `0.0.0.0:6379` 或 `*:6379` → 监听所有网卡，符合预期。

### 4. 容器内验证 TCP 连通

`ping` 走 ICMP，不能代表 TCP 可达。要用 TCP 探测：

```bash
docker exec <容器名> sh -c "(echo > /dev/tcp/<宿主机IP>/6379) 2>&1 && echo OK || echo FAIL"
```

返回 `FAIL` 即说明 TCP 被防火墙拦截。

## 修复：放行 docker 网段

放行 docker 网段到宿主机的流量（按上一步查到的网段填写）：

```bash
sudo iptables -I INPUT -s 172.18.0.0/16 -j ACCEPT
sudo iptables -I INPUT -s 172.19.0.0/16 -j ACCEPT
```

放行后再次验证：

```bash
docker exec <容器名> sh -c "(echo > /dev/tcp/<宿主机IP>/6379) 2>&1 && echo OK || echo FAIL"
```

返回 `OK` 即网络层已通。

### 持久化规则

iptables 规则重启后默认丢失，需要持久化：

```bash
# Ubuntu / Debian
sudo apt install iptables-persistent -y
sudo netfilter-persistent save
```

## 连接字符串的 Server 怎么填

放行网段后，连接字符串里的 Server 要写**宿主机真实网卡 IP**（用 `ip addr` 查到的 eth0 地址），不要写以下值：

| 错误写法 | 原因 |
|---|---|
| `localhost` / `127.0.0.1` | 容器内的 localhost 指向容器自己，连不到宿主机 |
| `docker0` 的 IP（如 `172.18.0.1`） | 网桥上没有跑业务服务，连不上 |
| `host.docker.internal` | 部分 Linux docker 环境下解析不稳定，实测可能连不通 |

正确示例（假设宿主机 eth0 IP 为 `192.168.1.100`）：

```json
{
  "Redis": {
    "Host": "192.168.1.100",
    "Port": 6379
  }
}
```

> 选 IP 时务必通过 `ip addr` 确认它绑定在 `eth0` 这类真实网卡上，而不是 docker 网桥。

## 安全说明

放行 `172.18.0.0/16` 是放行 docker 内部容器到宿主机的流量，**不会对公网开放端口**。docker 网段是私网，公网流量源 IP 不会是 `172.18.x.x`，因此不影响对外暴露面。如果仍需收紧，可以把规则限定到具体端口：

```bash
sudo iptables -I INPUT -s 172.18.0.0/16 -p tcp --dport 6379 -j ACCEPT
sudo iptables -I INPUT -s 172.18.0.0/16 -p tcp --dport 3306 -j ACCEPT
```

## 小结

容器访问宿主机服务连不上，按这个顺序排查最快定位：

1. 目标服务是否监听 `0.0.0.0`（`ss -tlnp`）。
2. 容器内 TCP 是否可达（`/dev/tcp` 探测，不要只用 `ping`）。
3. 防火墙 INPUT 链是否放行 docker 网段（`iptables -L INPUT`）。
4. 连接字符串 Server 是否写了**宿主机真实网卡 IP**（不是 localhost / docker0 / host.docker.internal）。
5. 账号授权是否允许 docker 网段来源（数据库的 `user@host`）。

五层都通，连接就稳了。
