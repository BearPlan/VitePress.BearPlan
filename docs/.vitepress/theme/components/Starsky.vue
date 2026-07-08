<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineOptions({ name: 'Starsky' });

interface Meteor {
  /** offset-path 的二次贝塞尔曲线：相对 .meteors-layer 左上角的像素坐标，带轻微上凸弧度 */
  path: string;
  /** 流星尾巴长度(px) */
  width: number;
  /** 单次划过时长(s) */
  duration: number;
  /** 首次出现延迟(s) */
  delay: number;
}

interface Star {
  top: string;
  left: string;
  /** 星等：决定大小与亮度(px) */
  size: number;
  /** 颜色：多数白，少数冷蓝/暖黄 */
  color: string;
  /** 大亮星：带十字衍射光芒 */
  bright: boolean;
  /** 闪烁周期(s) */
  duration: string;
  /** 闪烁延迟(s) */
  delay: string;
}

// 区间随机（浏览器运行时）
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// 生成一颗流星：起点位于屏幕外(上方或右侧)，沿 42°-62° 方向划向左下，轨迹带轻微上凸弧度（抛物线感）
function createMeteor(dim: { w: number; h: number }, duration: number, delay: number): Meteor {
  const { w, h } = dim;
  // 入口取屏幕上方或右侧屏外（与原逻辑一致）
  const fromTop = Math.random() < 0.6;
  let startTop: number;
  let startLeft: number;
  if (fromTop) {
    startTop = rand(-0.5, -0.1) * h; // 屏幕上方外
    startLeft = rand(-0.05, 0.95) * w;
  } else {
    startTop = rand(-0.15, 0.5) * h; // 垂直偏上
    startLeft = rand(1.05, 1.45) * w; // 屏幕右侧外
  }
  // 沿角度方向位移，长度随屏幕尺寸缩放，足以从屏外划入并穿过屏幕
  const angleDeg = rand(42, 62);
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const travel = rand(0.7, 1.2) * Math.max(w, h);
  const endLeft = startLeft - travel * cos; // 向左
  const endTop = startTop + travel * sin; // 向下
  // 控制点：起终连线中点向"左上法线"偏移，形成上凸弧度（"带点抛物线"）
  // 运动方向单位向量 (-cos, sin)，逆时针 90° 得法线 (-sin, -cos) 指向左上
  const bulge = rand(0.05, 0.09) * travel;
  const ctrlLeft = (startLeft + endLeft) / 2 - bulge * sin;
  const ctrlTop = (startTop + endTop) / 2 - bulge * cos;
  const f = (n: number) => n.toFixed(1);
  return {
    path: `M ${f(startLeft)} ${f(startTop)} Q ${f(ctrlLeft)} ${f(ctrlTop)} ${f(endLeft)} ${f(endTop)}`,
    width: Math.round(rand(70, 140)),
    duration,
    delay
  };
}

// 生成 n 颗星：星等/颜色/闪烁错峰分布，少数大亮星带十字光芒
function createStars(n: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < n; i += 1) {
    const r = Math.random();
    let starSize: number;
    let color: string;
    let bright = false;
    if (r > 0.93) {
      // ~7% 大亮星：暖白/冷白，带光芒
      starSize = rand(2.6, 3.6);
      color = Math.random() < 0.5 ? '#fff7e6' : '#cfe0ff';
      bright = true;
    } else if (r > 0.7) {
      // ~23% 中星
      starSize = rand(1.8, 2.4);
      color = Math.random() < 0.2 ? '#bcd0ff' : '#ffffff';
    } else {
      // ~70% 小暗星
      starSize = rand(1, 1.7);
      color = Math.random() < 0.15 ? '#d8e4ff' : 'rgba(255,255,255,0.8)';
    }
    stars.push({
      top: `${rand(0, 100).toFixed(2)}%`,
      left: `${rand(0, 100).toFixed(2)}%`,
      size: Number(starSize.toFixed(1)),
      color,
      bright,
      duration: `${rand(2.5, 6).toFixed(1)}s`,
      delay: `${rand(0, 4).toFixed(1)}s`
    });
  }
  return stars;
}

const layerRef = ref<HTMLElement>();
// 容器尺寸：流星轨迹基于像素，需在挂载/resize 时更新
const size = { w: 0, h: 0 };

const meteors = ref<Meteor[]>([]);
const stars = createStars(60);

function regenMeteors() {
  meteors.value = [createMeteor(size, 12, 1), createMeteor(size, 15, 4.5), createMeteor(size, 10, 7)];
}

// 每次划过结束重新随机轨迹，实现"从屏幕各处随机进入"
function rerollMeteor(i: number) {
  const m = meteors.value[i];
  if (!m) return;
  meteors.value[i] = createMeteor(size, m.duration, m.delay);
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const el = layerRef.value;
  if (!el) return;
  size.w = el.clientWidth;
  size.h = el.clientHeight;
  regenMeteors();
  // 监听容器尺寸变化，重新生成像素轨迹，避免 resize 后错位
  resizeObserver = new ResizeObserver(entries => {
    const rect = entries[0]?.contentRect;
    if (!rect) return;
    size.w = rect.width;
    size.h = rect.height;
    regenMeteors();
  });
  resizeObserver.observe(el);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <!-- 星空 + 流星：仅暗色夜空显示，铺满天空区域、不拦截交互 -->
  <div class="login-starsky" aria-hidden="true">
    <div class="stars-layer">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="star"
        :class="{ 'star--bright': s.bright }"
        :style="{
          top: s.top,
          left: s.left,
          width: `${s.size}px`,
          height: `${s.size}px`,
          backgroundColor: s.color,
          animationDuration: s.duration,
          animationDelay: s.delay
        }"
      />
    </div>
    <!-- 流星：沿随机弧线(offset-path)划过，方向随切线；每轮结束换新轨迹 -->
    <div ref="layerRef" class="meteors-layer">
      <span
        v-for="(m, i) in meteors"
        :key="i"
        class="meteor"
        :style="{
          offsetPath: `path('${m.path}')`,
          width: `${m.width}px`,
          animationDuration: `${m.duration}s`,
          animationDelay: `${m.delay}s`
        }"
        @animationiteration="rerollMeteor(i)"
      />
    </div>
  </div>
</template>

<!-- 暗色显示控制：放非 scoped 块，确保 html.dark 选择器稳定编译（scoped + :global 组合在产物里会丢失）-->
<style>
html.dark .login-starsky {
  display: block;
}
</style>

<style scoped>
/* 根容器：铺满天空，默认隐藏(亮色白天无星)，暗色夜空显示；层级与天空同级(山/草/卡均在更上层) */
.login-starsky {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  display: none;
}

.stars-layer,
.meteors-layer {
  position: absolute;
  inset: 0;
}

.meteors-layer {
  overflow: hidden;
}

/* 星点基类：位置/大小/颜色/闪烁周期由内联 style 注入，无需逐颗写类 */
.star {
  position: absolute;
  border-radius: 50%;
  animation: twinkle ease-in-out infinite;
}

/* 大亮星：中心柔光晕 + 十字衍射光芒（伪元素两条交叉渐变细线）*/
.star--bright {
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.7);
}

.star--bright::before,
.star--bright::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  transform: translate(-50%, -50%);
}

.star--bright::before {
  width: 18px;
  height: 1px;
}

.star--bright::after {
  width: 1px;
  height: 18px;
}

/* 闪烁：明暗 + 轻微缩放呼吸 */
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.4);
  }
}

/* 流星：沿 offset-path 弧线滑动，offset-rotate:auto 使方向跟随切线 */
.meteor {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  border-radius: 2px;
  offset-rotate: auto;
  /* offset-rotate:auto 下元素 +x 沿运动方向(前方)，故右端=亮头、左端=暗尾 */
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(96, 165, 250, 0.85) 15%,
    rgba(129, 140, 248, 0.55) 40%,
    rgba(139, 92, 246, 0.2) 75%,
    transparent 100%
  );
  opacity: 0;
  filter: drop-shadow(0 0 4px rgba(150, 180, 255, 0.6));
  will-change: offset-distance, opacity;
  animation: meteor-fly 7s ease-in infinite;
}

/* 划过：沿弧线 offset-distance 0%→100%，淡入划出；每轮结束由 JS 换新轨迹 */
@keyframes meteor-fly {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }

  4% {
    opacity: 1;
  }

  80% {
    opacity: 0.5;
  }

  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}

/* 尊重「减少动效」偏好：关闭闪烁与流星 */
@media (prefers-reduced-motion: reduce) {
  .star,
  .meteor {
    animation: none !important;
  }
}
</style>
