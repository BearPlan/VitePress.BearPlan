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
  title: "BearPlan - .NET全栈开源平台",
  description: "轻量灵活的 C# 核心库",
  appearance: 'dark',
  themeConfig: {
    logo: "/image/logo.png",
    nav: [
      { text: 'API', link: '/api-examples' },
      { text: 'BearPlan.Core', link: '/core/introduction.md' },
      { text: '博客', link: '/blog/create-component.md' },
      { text: '技术支持', link: '/support/framework.md' },
       { text: '链接',
        items: [
          { text: 'gitee', link: 'https://gitee.com/BearPlan/BearPlan.NET' },
          { text: 'github', link: 'https://github.com/BearPlan/BearPlan.NET' },
        ]
       }
    ],



    sidebar: {
      '/core/': [
        {
          text: '文档',
          items: [
            { text: '介绍', link: '/core/introduction.md' },
            { text: '快速开始', link: '/core/quickstart.md' }
          ]
        },
        {
          text: '核心能力',
          collapsed: false,
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
      ],
      '/support/': [
        {
          text: '技术支持',
          items: [
            { text: '框架介绍', link: '/support/framework.md' },
            { text: '序言', link: '/support/first.md' },
            { text: 'AlovaJs', link: '/support/alovajs.md' },
            { text: 'ApeVolo后端框架', link: '/support/ape-volo.md' }
          ]
        }
      ],
      '/blog/': [
        {
          text: '博客',
          items: [
            { text: 'Vue3函数式调用组件', link: '/blog/create-component.md' },
            { text: '前端Table下载excle', link: '/blog/excel-download.md' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'gitee', link: 'https://gitee.com/BearPlan/BearPlan.NET' },
      { icon: 'github', link: 'https://github.com/BearPlan/BearPlan.NET' }
    ],
    // 底部页脚：ICP 备案号，点击跳转工信部备案系统
    footer: {
      message: '<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">蜀ICP备2026041355号-1</a>',
      copyright: ''
    }
  }
})
