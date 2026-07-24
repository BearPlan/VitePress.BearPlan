# 移动端部署

::: warning 🚧 开发中
本章节内容正在撰写中，暂未完成。下方先介绍多端构建与分发的基础思路，完整教程随后补充。
:::

BearPlan 移动端基于 Uni-App，一套代码可编译到多个平台。不同平台的构建方式、产物格式和分发渠道完全不同，需要分别处理。

## 多端目标

| 平台 | 构建命令 | 产物 | 分发方式 |
| --- | --- | --- | --- |
| **H5** | `uni build -p h5` | 静态文件 | nginx / CDN 托管 |
| **微信小程序** | `uni build -p mp-weixin` | 小程序代码包 | 微信开发者工具上传 + 提审 |
| **支付宝小程序** | `uni build -p mp-alipay` | 小程序代码包 | 支付宝 IDE 上传 + 提审 |
| **Android App** | `uni build -p app` + HBuilderX 打包 | APK / AAB | 应用市场 / 自有渠道分发 |
| **iOS App** | `uni build -p app` + 云打包 / 本地打包 | IPA | App Store / TestFlight |
| **鸿蒙（HarmonyOS）** | HBuilderX 鸿蒙打包 | APP 包 | 华为应用市场 |

## 分发方式预告

### H5 端

与前端 Admin 部署方式一致——静态文件托管，配置 nginx / CDN 即可。通常挂在 `m.domain.com` 或 `h5.domain.com` 子域名。

### 小程序端

Uni-App 编译产出小程序代码包后：

1. 用对应平台的开发者工具打开 `dist/build/mp-weixin` 等目录。
2. 在工具内点「上传」，填写版本号和备注。
3. 到小程序管理后台提交审核，通过后发布。

注意小程序需在后台配置 **request 合法域名**（后端 API 地址，必须是 HTTPS）。

### App 端

- **云打包**：HBuilderX 提交打包参数到 DCloud 云端，生成 APK / IPA。简单但依赖第三方。
- **本地打包**：离线集成 Uni-App SDK 到原生工程，适合需要原生定制或保护证书的场景。

## 待完善内容

完整教程将补充：

- HBuilderX CLI 命令行构建（脱离 GUI，支持 CI/CD）
- 各平台环境配置（小程序 AppID、App 证书、签名）
- CI/CD 自动化构建（GitHub Actions / Gitee Go 多平台矩阵构建）
- 版本号管理与多环境配置（测试 / 预发 / 生产）
- 热更新方案（App 端 wgt 资源热更新）

敬请期待。
