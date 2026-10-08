import { defineConfig } from 'vitepress'

// 站点级常量：SEO / GEO 统一引用，避免散落硬编码
const SITE_URL = 'https://bear.js.org'
const SITE_NAME = 'BearPlan'
const SITE_TITLE = 'BearPlan - .NET 全栈开源平台'
const SITE_DESC =
  'BearPlan —— 基于 .NET / SqlSugar / Vue 3 / Uni-App 的全栈开源平台，覆盖 Web、H5、APP、鸿蒙与小程序，集成权限、多租户、缓存、AOP 与前后端 API 自动生成。'
const OG_IMAGE = '/image/logo.png'
const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE}`

// 站点级结构化数据：帮助 Google 富结果与 AI 引擎理解站点实体
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/image/logo.png`,
    sameAs: [
      'https://github.com/BearPlan',
      'https://gitee.com/BearPlan'
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    inLanguage: 'zh-CN'
  }
]

// 首页 FAQ 结构化数据：问答内容与 index.md「常见问题」保持同步，供 AI 引擎直接采纳
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'BearPlan 是什么？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BearPlan 是一套面向中后台业务的全栈开源快速开发平台，前后端分离、多端覆盖，目标是让开发者专注业务、不被基础设施拖累，可作为长期演进的可扩展基座。'
      }
    },
    {
      '@type': 'Question',
      name: 'BearPlan 解决什么问题？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '把权限、审计、缓存、多库、事件总线、定时任务、多租户等通用能力沉淀为开箱即用的核心库，并通过 Swagger + Alova.js 自动同步前后端 API，减少从零搭建业务系统的重复劳动。'
      }
    },
    {
      '@type': 'Question',
      name: 'BearPlan 用什么技术栈？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '后端 .NET + SqlSugar 分层架构，核心库 BearPlan.Core 可作为 NuGet 包或 Git Submodule 复用；前端 Vue 3 + Element Plus 管理后台，配合 Alova.js 请求层；移动端 Uni-App 一套代码编译到 H5、小程序、App 与鸿蒙。'
      }
    },
    {
      '@type': 'Question',
      name: 'BearPlan 适合哪些场景？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '适合需要快速搭建中后台系统（OA / CRM / WMS / ERP 等）的团队，以及希望拥有可长期演进、不被业务绑死的 .NET 基座的开发者。'
      }
    },
    {
      '@type': 'Question',
      name: 'BearPlan 是开源的吗？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '是。代码托管在 GitHub 与 Gitee，主项目为 BearPlan.NET，核心库为 BearPlan.NET.Core。'
      }
    }
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  // 语言声明：中文站 SEO 基础信号，默认是 en-US
  lang: 'zh-CN',
  // 浏览器标签页标题：保留完整长标题，利于 SEO 与书签识别
  title: SITE_TITLE,
  description: SITE_DESC,
  appearance: 'dark',
  // 启用 VitePress 内置 sitemap，构建时自动生成 sitemap.xml 到 dist
  sitemap: {
    hostname: SITE_URL
  },
  head: [
    ['link', { rel: 'icon', href: '/image/logo.png' }],
    // Open Graph 静态部分：社交平台分享卡片（og:type 逐页不同，在 transformHead 注入）
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:image', content: OG_IMAGE_URL }],
    ['meta', { property: 'og:image:alt', content: SITE_NAME }],
    // Twitter / X 分享卡片
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE_URL }],
    // 结构化数据：Organization + WebSite，供搜索引擎富结果与 AI 引擎引用
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd[0])],
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd[1])],
    // 百度统计：先声明全局事件队列 _hmt，再异步加载统计脚本；SPA 路由切换的 PV 上报在 theme/index.ts
    ['script', {}, 'var _hmt = _hmt || [];'],
    ['script', { async: '', src: 'https://hm.baidu.com/hm.js?6583c51fa9b21058eb81e8ade7a097e0' }]
  ],
  // 逐页动态注入 canonical / og:url / og:title / og:description / og:type
  // 静态全站标签放 head 数组，逐页差异化标签放 transformHead，职责分离
  transformHead({ pageData }) {
    // relativePath 形如 'bearplan/first.md'；首页为 'index.md'
    // canonical 需与 sitemap 默认产物一致（非 cleanUrls 时带 .html 后缀）
    const relative = pageData.relativePath
    const path =
      relative === 'index.md'
        ? ''
        : relative.replace(/\.md$/, '.html')
    const url = `${SITE_URL}/${path}`
    const title = pageData.frontmatter.title
      ? `${pageData.frontmatter.title} | ${SITE_NAME}`
      : SITE_TITLE
    const description = pageData.frontmatter.description || SITE_DESC
    // 博客文章 og:type 用 article，其余页面用 website
    const isPost = relative.startsWith('blog/')
    const ogType = isPost ? 'article' : 'website'

    const tags = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:type', content: ogType }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }]
    ]

    // 首页注入 FAQPage 结构化数据，与页面可见问答对应
    if (relative === 'index.md') {
      tags.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(faqJsonLd)
      ])
    }

    // 博客文章注入 TechArticle 结构化数据，帮助搜索引擎与 AI 引擎识别文章实体
    if (isPost) {
      const article = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description,
        url,
        image: OG_IMAGE_URL,
        inLanguage: 'zh-CN',
        datePublished: pageData.frontmatter.date,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: OG_IMAGE_URL }
        }
      }
      tags.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(article)
      ])
    }

    return tags
  },
  themeConfig: {
    logo: "/image/logo.png",
    nav: [
      { text: '文档', link: '/bearplan/first.md' },
      { text: '博客', link: '/blog/frontend/create-component.md' },
       { text: '链接',
        items: [
          {
            text: 'BearPlan.NET（主项目）',
            items: [
              { text: 'GitHub', link: 'https://github.com/BearPlan/BearPlan.NET' },
              { text: 'Gitee',  link: 'https://gitee.com/BearPlan/BearPlan.NET' }
            ]
          },
          {
            text: 'BearPlan.NET.Core',
            items: [
              { text: 'GitHub', link: 'https://github.com/BearPlan/BearPlan.NET.Core' },
              { text: 'Gitee',  link: 'https://gitee.com/BearPlan/BearPlan.NET.Core' }
            ]
          },
          {
            text: 'BearPaln.UniApp（开发中）',
            items: [
              { text: 'GitHub', link: 'https://github.com/BearPlan/BearPaln.UniApp' },
              { text: 'Gitee',  link: 'https://gitee.com/BearPlan/BearPaln.UniApp' }
            ]
          },
          {
            text: 'BearPlan.Admin',
            items: [
              { text: 'GitHub', link: 'https://github.com/BearPlan/BearPlan.Admin' },
              { text: 'Gitee',  link: 'https://gitee.com/BearPlan/BearPlan.Admin' }
            ]
          }
        ]
       }
    ],



    sidebar: {
      '/bearplan/': [
        {
          text: '概览',
          items: [
            { text: '序言', link: '/bearplan/first.md' },
            { text: '部署总览', link: '/bearplan/deploy.md' }
          ]
        },
        {
          text: '.NET',
          collapsed: false,
          items: [
            { text: '介绍', link: '/bearplan/dotnet.md' },
            { text: '后端部署', link: '/bearplan/deploy-api.md' }
          ]
        },
        {
          text: 'BearPlan.Admin',
          collapsed: false,
          items: [
            { text: '介绍', link: '/bearplan/admin.md' },
            { text: '前端部署', link: '/bearplan/deploy-admin.md' }
          ]
        },
        {
          text: 'BearPlan.UniApp',
          collapsed: false,
          items: [
            { text: '介绍（开发中）', link: '/bearplan/uniapp.md' },
            { text: '移动端部署', link: '/bearplan/deploy-mobile.md' }
          ]
        },
        {
          text: 'BearPlan.Core',
          collapsed: false,
          items: [
            { text: '介绍', link: '/bearplan/introduction.md' },
            { text: '快速开始', link: '/bearplan/quickstart.md' },
            {
              text: '核心能力',
              collapsed: true,
              items: [
                {
                  text: '应用核心',
                  collapsed: true,
                  items: [
                    { text: 'App / Internal', link: '/bearplan/introduction.md#app-internal' },
                    { text: 'ConfigOptions', link: '/bearplan/introduction.md#config-options' },
                    { text: 'Global', link: '/bearplan/introduction.md#global' },
                    { text: 'Consts', link: '/bearplan/introduction.md#consts' },
                    { text: 'DI', link: '/bearplan/introduction.md#di' }
                  ]
                },
                {
                  text: 'AOP 与中间件',
                  collapsed: true,
                  items: [
                    { text: 'Attributes', link: '/bearplan/introduction.md#attributes' },
                    { text: 'Aop', link: '/bearplan/introduction.md#aop' },
                    { text: 'Middleware', link: '/bearplan/introduction.md#middleware' }
                  ]
                },
                {
                  text: '缓存、日志与多语言',
                  collapsed: true,
                  items: [
                    { text: 'Caches', link: '/bearplan/introduction.md#caches' },
                    { text: 'Serilog', link: '/bearplan/introduction.md#serilog' },
                    { text: 'MultiLanguage', link: '/bearplan/introduction.md#multi-language' }
                  ]
                },
                {
                  text: '数据模型与映射',
                  collapsed: true,
                  items: [
                    { text: 'Model', link: '/bearplan/introduction.md#model' },
                    { text: 'Pager', link: '/bearplan/introduction.md#pager' },
                    { text: 'Mapping', link: '/bearplan/introduction.md#mapping' },
                    { text: 'Enums', link: '/bearplan/introduction.md#enums' },
                    { text: 'Exception', link: '/bearplan/introduction.md#exception' }
                  ]
                },
                {
                  text: '工具与扩展',
                  collapsed: true,
                  items: [
                    { text: 'Extensions', link: '/bearplan/introduction.md#extensions' },
                    { text: 'Helper', link: '/bearplan/introduction.md#helper' },
                    { text: 'IdGenerator', link: '/bearplan/introduction.md#id-generator' },
                    { text: 'ClassLibrary', link: '/bearplan/introduction.md#class-library' },
                    { text: 'Fonts', link: '/bearplan/introduction.md#fonts' }
                  ]
                }
              ]
            }
          ]
        },
        {
          text: '生态',
          collapsed: false,
          items: [
            { text: 'Alova.js', link: '/bearplan/alovajs.md' },
            { text: 'Worma', link: '/bearplan/worma.md' }
          ]
        }
      ],
      '/blog/': [
        {
          text: '前端',
          collapsed: false,
          items: [
            { text: 'Vue3函数式调用组件', link: '/blog/frontend/create-component.md' },
            { text: '前端Table下载Excel', link: '/blog/frontend/excel-download.md' }
          ]
        },
        {
          text: '后端',
          collapsed: false,
          items: [
            { text: '微信扫码登录', link: '/blog/backend/weixin-scan-login.md' },
            { text: 'Swagger', link: '/blog/backend/swagger.md' },
            { text: '全局返回配置', link: '/blog/backend/formatResponseAttribute.md' }
          ]
        },
        {
          text: '部署',
          collapsed: false,
          items: [
            { text: 'Docker被防火墙拦截', link: '/blog/deploy/docker-firewall-allow-subnet.md' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BearPlan' },
      {
        icon: {
          light: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333H8.32a4.36 4.36 0 0 0-4.36 4.36v4.36a4.36 4.36 0 0 0 4.36 4.36h6.453a3.65 3.65 0 0 0 3.65-3.65v-1.453H12.5a.85.85 0 1 1 0-1.7h6.728a.85.85 0 0 1 .85.85v2.303a5.45 5.45 0 0 1-5.45 5.45H8.32a6.06 6.06 0 0 1-6.06-6.06V9.693a6.06 6.06 0 0 1 6.06-6.06h9.755a.85.85 0 1 1 0 1.7z" fill="currentColor"/></svg>',
          dark:  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333H8.32a4.36 4.36 0 0 0-4.36 4.36v4.36a4.36 4.36 0 0 0 4.36 4.36h6.453a3.65 3.65 0 0 0 3.65-3.65v-1.453H12.5a.85.85 0 1 1 0-1.7h6.728a.85.85 0 0 1 .85.85v2.303a5.45 5.45 0 0 1-5.45 5.45H8.32a6.06 6.06 0 0 1-6.06-6.06V9.693a6.06 6.06 0 0 1 6.06-6.06h9.755a.85.85 0 1 1 0 1.7z" fill="currentColor"/></svg>'
        },
        link: 'https://gitee.com/BearPlan'
      }
    ],
    // 底部页脚：ICP 备案号，点击跳转工信部备案系统
    footer: {
      message: '<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">蜀ICP备2026041355号-1</a>',
      copyright: ''
    }
  }
})
