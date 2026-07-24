import { defineConfig } from 'vitepress'

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
  title: "BearPlan - .NET全栈开源平台",
  description: "轻量灵活的 C# 核心库",
  appearance: 'dark',
  themeConfig: {
    logo: "/image/logo.png",
    nav: [
      { text: '文档', link: '/core/first.md' },
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
            text: 'BearPlan.Admin（开发中）',
            items: [
              { text: 'GitHub', link: 'https://github.com/BearPlan/BearPlan.Admin' },
              { text: 'Gitee',  link: 'https://gitee.com/BearPlan/BearPlan.Admin' }
            ]
          }
        ]
       }
    ],



    sidebar: {
      '/core/': [
        {
          text: '概览',
          items: [
            { text: '序言', link: '/core/first.md' },
            { text: '部署总览', link: '/core/deploy.md' }
          ]
        },
        {
          text: 'BearPlan.NET',
          collapsed: false,
          items: [
            { text: '介绍', link: '/core/framework.md' },
            { text: '后端部署', link: '/core/deploy-api.md' }
          ]
        },
        {
          text: 'BearPlan.Admin',
          collapsed: false,
          items: [
            { text: '介绍（开发中）', link: '/core/admin.md' },
            { text: '前端部署', link: '/core/deploy-admin.md' }
          ]
        },
        {
          text: 'BearPlan.UniApp',
          collapsed: false,
          items: [
            { text: '介绍（开发中）', link: '/core/uniapp.md' },
            { text: '移动端部署', link: '/core/deploy-mobile.md' }
          ]
        },
        {
          text: 'BearPlan.Core',
          collapsed: false,
          items: [
            { text: '介绍', link: '/core/introduction.md' },
            { text: '快速开始', link: '/core/quickstart.md' },
            {
              text: '核心能力',
              collapsed: true,
              items: [
                {
                  text: '应用核心',
                  collapsed: true,
                  items: [
                    { text: 'App / Internal', link: '/core/introduction.md#app-internal' },
                    { text: 'ConfigOptions', link: '/core/introduction.md#config-options' },
                    { text: 'Global', link: '/core/introduction.md#global' },
                    { text: 'Consts', link: '/core/introduction.md#consts' },
                    { text: 'DI', link: '/core/introduction.md#di' }
                  ]
                },
                {
                  text: 'AOP 与中间件',
                  collapsed: true,
                  items: [
                    { text: 'Attributes', link: '/core/introduction.md#attributes' },
                    { text: 'Aop', link: '/core/introduction.md#aop' },
                    { text: 'Middleware', link: '/core/introduction.md#middleware' }
                  ]
                },
                {
                  text: '缓存、日志与多语言',
                  collapsed: true,
                  items: [
                    { text: 'Caches', link: '/core/introduction.md#caches' },
                    { text: 'Serilog', link: '/core/introduction.md#serilog' },
                    { text: 'MultiLanguage', link: '/core/introduction.md#multi-language' }
                  ]
                },
                {
                  text: '数据模型与映射',
                  collapsed: true,
                  items: [
                    { text: 'Model', link: '/core/introduction.md#model' },
                    { text: 'Pager', link: '/core/introduction.md#pager' },
                    { text: 'Mapping', link: '/core/introduction.md#mapping' },
                    { text: 'Enums', link: '/core/introduction.md#enums' },
                    { text: 'Exception', link: '/core/introduction.md#exception' }
                  ]
                },
                {
                  text: '工具与扩展',
                  collapsed: true,
                  items: [
                    { text: 'Extensions', link: '/core/introduction.md#extensions' },
                    { text: 'Helper', link: '/core/introduction.md#helper' },
                    { text: 'IdGenerator', link: '/core/introduction.md#id-generator' },
                    { text: 'ClassLibrary', link: '/core/introduction.md#class-library' },
                    { text: 'Fonts', link: '/core/introduction.md#fonts' }
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
            { text: 'Alova.js', link: '/core/alovajs.md' },
            { text: 'Worma', link: '/core/worma.md' }
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
