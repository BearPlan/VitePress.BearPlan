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

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head:[
    [
      'link',
      {
        rel: 'icon',
        href: '/image/logo.png'
      }
    ]
  ],
  base: '/',
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
    // Open Graph 静态部分：社交平台分享卡片
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:image', content: OG_IMAGE_URL }],
    ['meta', { property: 'og:image:alt', content: SITE_NAME }],
    // Twitter / X 分享卡片
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE_URL }],
    // 结构化数据：Organization + WebSite，供搜索引擎富结果与 AI 引擎引用
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd[0])],
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd[1])]
  ],
  // 逐页动态注入 canonical / og:url / og:title / og:description
  // 静态全站标签放 head 数组，逐页差异化标签放 transformHead，职责分离
  transformHead({ pageData }) {
    // relativePath 形如 'core/first.md'；首页为 'index.md'
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

    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }]
    ]
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
