<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'PetalWind' });

interface Petal {
  top: string;
  tx: string;
  ty: string;
  dur: number;
  delay: number;
  size: number;
  type: 'flower' | 'leaf';
  color: string;
}

// 花瓣(水滴形)与叶片(尖叶)路径：组件自带，不依赖父级 symbol
const PETAL_PATH = 'M0 0 Q4 -3 3 -8 Q0 -12 -3 -8 Q-4 -3 0 0 Z';
const LEAF_PATH = 'M0 0 Q-3 -5 0 -12 Q3 -5 0 0 Z';

// 区间随机(浏览器运行时)
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// 生成一片飘飞花瓣/叶：从屏幕底部随机 x 出发，斜向右上方飞出屏外
function createPetal(): Petal {
  const isFlower = Math.random() < 0.65; // 花瓣为主、少量叶
  const palette = isFlower ? ['#ba68c8', '#ff80ab', '#ce93d8', '#f48fb1'] : ['#66bb6a', '#81c784', '#9ccc65'];
  const color = palette[Math.floor(Math.random() * palette.length)] ?? (isFlower ? '#ba68c8' : '#66bb6a');
  // 从左侧下段(屏幕底部约 20% 区域)飘入、横向飘向右侧：tx 使 95% 抵达右边缘、100% 飞出右侧，ty 略上下漂
  return {
    top: `${rand(80, 97)}%`,
    tx: `${rand(104, 108)}vw`,
    ty: `${rand(-12, 18)}vh`,
    dur: rand(30, 48),
    delay: rand(0, 12),
    size: rand(7, 14),
    type: isFlower ? 'flower' : 'leaf',
    color
  };
}

// 12 片粒子，正 delay 错峰使各片从底部边缘陆续飘起(不凭空出现在屏中)；固定轨迹循环，避免每轮换轨迹导致中途闪现
const petals = ref<Petal[]>(Array.from({ length: 12 }, createPetal));
</script>

<template>
  <!-- 风吹花瓣/叶片：从屏幕底部飘起、斜向右上飞出，循环不断；不拦截交互 -->
  <div class="petal-wind" aria-hidden="true">
    <span
      v-for="(p, i) in petals"
      :key="i"
      class="petal"
      :style="{
        '--top': p.top,
        '--tx': p.tx,
        '--ty': p.ty,
        animationDuration: `${p.dur}s`,
        animationDelay: `${p.delay}s`
      }"
    >
      <svg viewBox="-6 -14 12 16" :width="p.size" :height="p.size">
        <path :d="p.type === 'flower' ? PETAL_PATH : LEAF_PATH" :fill="p.color" />
      </svg>
    </span>
  </div>
</template>

<!-- 暗色显示控制：放非 scoped 块，确保 html.dark 选择器稳定编译 -->
<style>
html.dark .petal-wind {
  display: none;
}

html.dark .petal {
  filter: brightness(1.15) saturate(0.9);
}
</style>

<style scoped>
/* 容器：铺满视口、前景(z6)、不拦截交互 */
.petal-wind {
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
}

/* 单片：外层做主轨迹(底部→右上方 translate + 淡入淡出)；内层 svg 做旋转 */
.petal {
  position: absolute;
  top: var(--top);
  left: -14px;
  opacity: 0;
  animation: petal-fly var(--dur, 12s) linear infinite;
}

@keyframes petal-fly {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }

  5% {
    opacity: 0.85;
  }

  95% {
    opacity: 0.85;
  }

  100% {
    transform: translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

/* 内层：边飞边旋转摆动，模拟花瓣/叶片翻飞 */
.petal svg {
  display: block;
  animation: petal-spin 4s ease-in-out infinite;
}

@keyframes petal-spin {
  0%,
  100% {
    transform: rotate(-30deg);
  }

  50% {
    transform: rotate(30deg);
  }
}

/* 尊重「减少动效」偏好：关闭飘飞与旋转 */
@media (prefers-reduced-motion: reduce) {
  .petal,
  .petal svg {
    animation: none;
  }
}
</style>
