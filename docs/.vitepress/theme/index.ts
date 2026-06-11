/* .vitepress/theme/index.ts */
import DefaultTheme from 'vitepress/theme'
import './style/index.css'

/**
 * 客户端运行时给 hero name / text 元素加上 data-text 属性，
 * 让 CSS 的 ::before/::after 可以用 attr(data-text) 做出 Glitch 双层错位效果
 */
function applyGlitchAttrs() {
  if (typeof document === 'undefined') return
  const candidates = [
    '.VPHero .name .clip',
    '.VPHero .text'
  ]
  candidates.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      const text = el.textContent?.trim() || ''
      if (text && !el.getAttribute('data-text')) {
        el.setAttribute('data-text', text)
      }
    })
  })
}

export default {
  extends: DefaultTheme,
  // 左侧：给 hero 文字加 data-text，配合 CSS 实现 Glitch 文字效果
  enhanceApp(ctx) {
    if (typeof window === 'undefined') return

    setTimeout(applyGlitchAttrs, 100)

    const orig = ctx.router.onAfterRouteChanged
    ctx.router.onAfterRouteChanged = (to) => {
      orig?.(to)
      setTimeout(applyGlitchAttrs, 100)
    }
  }
}
