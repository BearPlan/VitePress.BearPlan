/* .vitepress/theme/index.ts */
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style/index.css'

declare global {
  interface Window {
    /** 百度统计全局事件队列，由 config.mts head 注入 */
    _hmt: unknown[] | undefined
  }
}

export default {
  extends: DefaultTheme,
  // 首页使用自定义 Layout：注入自然动态背景(仅 index.md)，其余沿用默认主题
  Layout,
  // 百度统计 SPA 补充：VitePress 站内跳转不会重新加载页面，hm.js 只能统计到首次进入，
  // 需在路由切换后手动上报 PV；去掉锚点 hash，避免页内跳转产生重复 PV
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return
    router.onAfterRouteChange = to => {
      const url = new URL(to, window.location.origin)
      window._hmt?.push(['_trackPageview', url.pathname + url.search])
    }
  }
}
