<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'Fireflies' });

interface Firefly {
  top: string;
  left: string;
  dx1: string;
  dy1: string;
  dx2: string;
  dy2: string;
  dx3: string;
  dy3: string;
  dur: number;
  blink: number;
  delay: number;
  size: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// 生成一只萤火虫：固定区域随机位置 + 小范围飘忽折线 + 慢速闪烁
function createFirefly(): Firefly {
  const px = (n: number) => `${n}px`;
  return {
    top: `${rand(58, 93)}%`, // 偏下(灌木丛/草原上空)，避开上方夜空(与星空区分)
    left: `${rand(0, 70)}%`, // 偏左，集中在灌木丛与左半草原
    dx1: px(rand(-45, 45)),
    dy1: px(rand(-35, 35)),
    dx2: px(rand(-45, 45)),
    dy2: px(rand(-35, 35)),
    dx3: px(rand(-45, 45)),
    dy3: px(rand(-35, 35)),
    dur: rand(10, 18), // 漂浮慢
    blink: rand(2.5, 5.5), // 闪烁
    delay: -rand(0, 12),
    size: rand(3, 5) // 提亮：略大
  };
}

// 萤火虫 16 只，集中在下方灌木丛/草原(避开星空所在的天空)
const fireflies = ref<Firefly[]>(Array.from({ length: 16 }, createFirefly));
</script>

<template>
  <!-- 萤火虫：暗色夜空点缀，慢飘 + 闪烁；白天不显示 -->
  <div class="fireflies" aria-hidden="true">
    <span
      v-for="(f, i) in fireflies"
      :key="i"
      class="firefly"
      :style="{
        '--top': f.top,
        '--left': f.left,
        '--dx1': f.dx1,
        '--dy1': f.dy1,
        '--dx2': f.dx2,
        '--dy2': f.dy2,
        '--dx3': f.dx3,
        '--dy3': f.dy3,
        '--dur': `${f.dur}s`,
        '--blink': `${f.blink}s`,
        '--delay': `${f.delay}s`,
        width: `${f.size}px`,
        height: `${f.size}px`
      }"
    />
  </div>
</template>

<!-- 暗色显示控制：放非 scoped 块，确保 html.dark 选择器稳定编译 -->
<style>
html.dark .fireflies {
  display: block;
}
</style>

<style scoped>
/* 容器：铺满、前景(z6)、仅暗色显示 */
.fireflies {
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
  display: none;
}

/* 萤火虫：暖黄发光点，漂浮 + 闪烁双动画 */
.firefly {
  position: absolute;
  top: var(--top);
  left: var(--left);
  border-radius: 50%;
  background: rgba(255, 240, 150, 0.95);
  box-shadow:
    0 0 10px 3px rgba(255, 235, 130, 0.88),
    0 0 20px 6px rgba(255, 215, 100, 0.45);
  animation:
    firefly-float var(--dur) ease-in-out infinite,
    firefly-blink var(--blink) ease-in-out infinite;
  animation-delay: var(--delay), var(--delay);
}

/* 飘忽：四点折线小范围游走，模拟萤火虫随机漂浮 */
@keyframes firefly-float {
  0%,
  100% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(var(--dx1), var(--dy1));
  }

  50% {
    transform: translate(var(--dx2), var(--dy2));
  }

  75% {
    transform: translate(var(--dx3), var(--dy3));
  }
}

/* 闪烁：明暗呼吸 */
@keyframes firefly-blink {
  0%,
  100% {
    opacity: 0.15;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .firefly {
    animation: none;
  }
}
</style>
