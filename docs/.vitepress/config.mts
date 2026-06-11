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
  title: "BearPlatform - .NET全栈开源平台",
  description: "轻量灵活的 C# 核心库",
  appearance: 'dark',
  themeConfig: {
    logo: "/image/logo.png",
    nav: [
      { text: 'API', link: '/api-examples' },
      { text: '博客', link: '/blog/create-component.md' },
      { text: '技术支持', link: '/support/first.md' },
       { text: '链接',
        items: [
          { text: 'gitee', link: 'https://gitee.com/ByteXiong/BearPlatform' },
          { text: 'github', link: 'https://github.com/ByteXiong/BearPlatform' },
        ]
       }
    ],
    
    

    sidebar: [
    {
        text: '博客',
        items: [
          { text: 'Vue3函数式调用组件', link: '/blog/create-component.md' },
          { text: '前端Table下载excle', link: '/blog/excel-download.md' }
        ]
      },
      {
        text: '技术支持',
        items: [
          { text: '序言', link: '/support/first.md' },
          { text: 'AlovaJs', link: '/support/alovajs.md' },
          { text: 'ApeVolo后端框架', link: '/support/ape-volo.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'gitee', link: 'https://gitee.com/ByteXiong/BearPlatform' },
      { icon: 'github', link: 'https://github.com/ByteXiong/BearPlatform' }
    ]
  }
})
