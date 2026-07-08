/* .vitepress/theme/index.ts */
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style/index.css'

export default {
  extends: DefaultTheme,
  // 首页使用自定义 Layout：注入自然动态背景(仅 index.md)，其余沿用默认主题
  Layout
}
