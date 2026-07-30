---
layout: home
title: "BearPlan - .NET 全栈开源平台"
description: "BearPlan —— 基于 .NET / SqlSugar / Vue 3 / Uni-App 的全栈开源平台，覆盖 Web、H5、APP、鸿蒙与小程序，集成权限、多租户、缓存、AOP 与前后端 API 自动生成。"

hero:
  name: "BearPlan"
  image:
    src: /image/logo.png
    alt: BearPlan
  text: |
    全栈重构 API 集成体验
    简单 · 精准 · 高效
  tagline: |
    基于 .NET Core、Vue 3、Uni-App
    集成 SqlSugar、Element Plus、Wot Design Uni
  actions:
    - theme: brand
      text: 项目地址
      link: https://gitee.com/BearPlan/BearPlan.NET
    - theme: alt
      text: 博客
      link: /blog/frontend/create-component.md

features:
  - title: "🌐 多端覆盖"
    details: 支持 Web、H5、APP、鸿蒙，以及微信/支付宝/钉钉等小程序。
    
  - title: "⚙️ 跨平台支持"
    details: 后端支持 Windows、Linux、macOS 等多操作系统。

  - title: "🧩 通用业务场景"
    details: 可应用于后台管理、CRM、OA、WMS、快递、ERP 等多种系统。

  - title: "🚀 前后端 API 快速集成"
    details: 使用 Alova.js 自动生成前端 API，无需手动编码。

  - title: "💻 技术选型现代化"
    details: 基于 .NET 8、SqlSugar、Alova.js、Vue 3、Element Plus 等技术栈。

  - title: "🌍 动态国际化"
    details: 支持多语言动态切换，可自定义语言配置。

  - title: "🛡️ 权限系统灵活"
    details: 支持多层级权限控制，规则可动态配置。

  - title: "🏢 多租户架构"
    details: 支持数据库分库、按租户隔离，满足 SaaS 场景。
---

## 常见问题

**BearPlan 是什么？**

BearPlan 是一套面向中后台业务的全栈开源快速开发平台，目标是让开发者专注业务、不被基础设施拖累。它前后端分离、多端覆盖，不是一次性脚手架，而是可长期演进的可扩展基座。

**BearPlan 解决什么问题？**

它解决从零搭建业务系统的重复劳动：把权限、审计、缓存、多库、事件总线、定时任务、多租户等通用能力沉淀为开箱即用的核心库，并通过 Swagger + Alova.js 自动同步前后端 API，告别手写请求函数与人工维护类型。

**BearPlan 用什么技术栈？**

- 后端：.NET + SqlSugar 分层架构，业务中立的核心库 `BearPlan.Core` 可作为 NuGet 包或 Git Submodule 复用。
- 前端：Vue 3 + Element Plus 管理后台，配合 Alova.js 请求层。
- 移动端：Uni-App 一套代码编译到 H5、各平台小程序、App、鸿蒙。

**BearPlan 适合哪些场景？**

适合需要快速搭建中后台系统（OA / CRM / WMS / ERP 等）的团队，以及希望拥有可长期演进、不被业务绑死的 .NET 基座的开发者。

**BearPlan 是开源的吗？**

是。代码托管在 [GitHub](https://github.com/BearPlan) 与 [Gitee](https://gitee.com/BearPlan)，主项目为 BearPlan.NET，核心库为 BearPlan.NET.Core。

**如何开始使用 BearPlan？**

阅读 [序言](/bearplan/first.md) 了解项目定位，参考 [Core 快速开始](/bearplan/quickstart.md) 引入核心库，或查看 [.NET 介绍](/bearplan/dotnet.md) 理解后端分层架构。
