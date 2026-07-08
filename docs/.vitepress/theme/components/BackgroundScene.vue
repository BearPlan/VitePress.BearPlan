<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Starsky from './Starsky.vue';
import PetalWind from './PetalWind.vue';
import Fireflies from './Fireflies.vue';

defineOptions({ name: 'BackgroundScene' });

// 标签页隐藏时暂停所有动画（长期挂载时显著省电）
const isPaused = ref(typeof document !== 'undefined' ? document.hidden : false);
const onVisibilityChange = () => {
  isPaused.value = document.hidden;
};

// 挂载时给 <html> 加 .nature-bg 类，用于作用域透明化背景（仅首页生效）
onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.documentElement.classList.add('nature-bg');
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.documentElement.classList.remove('nature-bg');
});
</script>

<template>
  <!-- 背景层根容器：fixed 铺满视口、置于内容之下，白天/夜晚随 .dark 自适应 -->
  <div class="nature-background" :data-paused="isPaused">
    <!-- 背景层：上方蓝天白云(流动) + 底部小草(风吹摇摆) + 地平线微光，清新自然 -->
    <div class="sky-layer" aria-hidden="true">
      <!-- 太阳/月亮光源光晕：天空从右上光源向外柔和渐暗，赋予明暗指向 -->
      <div class="sky-glow"></div>
      <!-- 云朵图形定义：两种蓬松轮廓复用，fill 取 currentColor 随明暗切换 -->
      <svg class="cloud-defs" aria-hidden="true">
        <defs>
          <!-- 云朵内部明暗渐变：顶部受光亮 → 底部背光暗，呈现云体内部体积（亮色底偏冷灰蓝）-->
          <linearGradient id="cloud-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset="0.5" stop-color="#f4f7fb" />
            <stop offset="1" stop-color="#d2dde9" />
          </linearGradient>
          <!-- 暗色：顶部淡亮 → 底部深冷蓝，夜空剪影保留内部明暗 -->
          <linearGradient id="cloud-grad-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c8d4ee" />
            <stop offset="0.55" stop-color="#8e9dc4" />
            <stop offset="1" stop-color="#566389" />
          </linearGradient>
        </defs>
        <symbol id="cloud-a" viewBox="0 0 120 56">
          <path
            d="M6 50 Q-4 38 8 34 Q4 20 22 22 Q26 6 48 12 Q60 0 80 10 Q100 4 104 22 Q120 22 114 38 Q122 54 104 50 L6 50 Z"
          />
        </symbol>
        <symbol id="cloud-b" viewBox="0 0 120 56">
          <path d="M10 50 Q0 40 10 34 Q6 22 24 22 Q30 8 54 14 Q74 4 92 16 Q110 14 112 32 Q122 40 112 50 L10 50 Z" />
        </symbol>
      </svg>
      <!-- 外层 .cloud 做横向漂移，内层 .cloud-shape 做上下浮动 + 透明呼吸 -->
      <div class="cloud cloud--1">
        <svg class="cloud-shape"><use href="#cloud-a" /></svg>
      </div>
      <div class="cloud cloud--2">
        <svg class="cloud-shape"><use href="#cloud-b" /></svg>
      </div>
      <div class="cloud cloud--3">
        <svg class="cloud-shape"><use href="#cloud-a" /></svg>
      </div>
      <div class="cloud cloud--4">
        <svg class="cloud-shape"><use href="#cloud-b" /></svg>
      </div>
      <div class="cloud cloud--5">
        <svg class="cloud-shape"><use href="#cloud-a" /></svg>
      </div>
    </div>
    <!-- 星空 + 流星：暗色夜空场景（封装于 Starsky，亮色白天不显示） -->
    <Starsky />
    <!-- 远山：多层深浅起伏，由远到近呈现忽远忽近的纵深 -->
    <div class="hills-layer" aria-hidden="true">
      <svg class="hills-svg" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path
          class="hill hill-1"
          d="M0 150 Q180 95 380 125 Q560 150 760 108 Q940 75 1140 118 Q1180 130 1200 122 L1200 200 L0 200 Z"
        />
        <path class="hill hill-2" d="M0 164 Q200 118 420 150 Q640 176 880 138 Q1060 116 1200 156 L1200 200 L0 200 Z" />
        <path class="hill hill-3" d="M0 178 Q220 144 460 170 Q700 188 940 156 Q1080 140 1200 174 L1200 200 L0 200 Z" />
        <path class="hill hill-4" d="M0 190 Q240 166 500 182 Q740 192 980 170 Q1100 164 1200 184 L1200 200 L0 200 Z" />
      </svg>
    </div>
    <!-- 草原：山脚延伸到屏幕底的绿色平原 -->
    <div class="meadow" aria-hidden="true"></div>
    <div class="grass-layer" aria-hidden="true">
      <!-- 三层草叶 SVG：远景浅/中景中/前景深，摇摆时长由 CSS :nth-child 错峰分配 -->
      <svg class="grass-svg" viewBox="0 0 1200 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <!-- 前景草渐变：根部深草绿→尖部嫩黄绿，objectBoundingBox 使每片叶自适应 -->
          <linearGradient id="blade-front-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#2e7d32" />
            <stop offset="0.55" stop-color="#66bb6a" />
            <stop offset="1" stop-color="#b2dd9c" />
          </linearGradient>
          <!-- 中景草渐变：整体偏浅一档 -->
          <linearGradient id="blade-mid-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#43a047" />
            <stop offset="1" stop-color="#a5d6a7" />
          </linearGradient>
          <!-- 暗色对应：冷翠向夜空气质靠拢 -->
          <linearGradient id="blade-front-grad-dark" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#143620" />
            <stop offset="0.55" stop-color="#1f4631" />
            <stop offset="1" stop-color="#2c5a40" />
          </linearGradient>
          <linearGradient id="blade-mid-grad-dark" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#1c3a28" />
            <stop offset="1" stop-color="#26513a" />
          </linearGradient>
        </defs>
        <g class="grass-back">
          <path class="blade" d="M13 150 Q18 136 27 124 Q19 136 17 150 Z" />
          <path class="blade" d="M33 150 Q29 137 24 126 Q32 137 37 150 Z" />
          <path class="blade" d="M53 150 Q58 135 68 122 Q60 135 57 150 Z" />
          <path class="blade" d="M73 150 Q69 138 65 128 Q75 138 77 150 Z" />
          <path class="blade" d="M93 150 Q99 136 109 124 Q95 136 97 150 Z" />
          <path class="blade" d="M113 150 Q108 137 103 126 Q113 137 117 150 Z" />
          <path class="blade" d="M133 150 Q137 135 146 122 Q137 135 137 150 Z" />
          <path class="blade" d="M156 150 Q151 138 145 128 Q155 138 160 150 Z" />
          <path class="blade" d="M181 150 Q185 136 193 124 Q185 136 185 150 Z" />
          <path class="blade" d="M208 150 Q202 137 196 126 Q205 137 212 150 Z" />
          <path class="blade" d="M238 150 Q243 135 252 122 Q243 135 242 150 Z" />
          <path class="blade" d="M272 150 Q268 138 263 128 Q272 138 276 150 Z" />
          <path class="blade" d="M310 150 Q315 136 325 124 Q313 136 314 150 Z" />
          <path class="blade" d="M353 150 Q349 137 345 126 Q355 137 357 150 Z" />
          <path class="blade" d="M402 150 Q408 135 418 122 Q405 135 406 150 Z" />
          <path class="blade" d="M458 150 Q453 138 448 128 Q458 138 462 150 Z" />
          <path class="blade" d="M524 150 Q528 136 537 124 Q528 136 528 150 Z" />
          <path class="blade" d="M602 150 Q597 137 591 126 Q601 137 606 150 Z" />
          <path class="blade" d="M694 150 Q698 135 706 122 Q698 135 698 150 Z" />
          <path class="blade" d="M804 150 Q798 138 792 128 Q803 138 808 150 Z" />
          <path class="blade" d="M936 150 Q941 136 950 124 Q938 136 940 150 Z" />
          <path class="blade" d="M1088 150 Q1084 137 1079 126 Q1088 137 1092 150 Z" />
        </g>
        <g class="grass-mid">
          <path class="blade" d="M22 150 Q30 128 45 110 Q29 128 28 150 Z" />
          <path class="blade" d="M52 150 Q45 129 37 112 Q58 129 58 150 Z" />
          <path class="blade" d="M82 150 Q91 126 107 106 Q89 126 88 150 Z" />
          <path class="blade" d="M115 150 Q109 130 102 114 Q121 130 121 150 Z" />
          <path class="blade" d="M152 150 Q160 128 174 110 Q156 128 158 150 Z" />
          <path class="blade" d="M193 150 Q185 129 175 112 Q195 129 199 150 Z" />
          <path class="blade" d="M239 150 Q246 126 259 106 Q245 126 245 150 Z" />
          <path class="blade" d="M292 150 Q284 130 275 114 Q293 130 298 150 Z" />
          <path class="blade" d="M353 150 Q360 128 374 110 Q357 128 359 150 Z" />
          <path class="blade" d="M425 150 Q416 129 406 112 Q427 129 431 150 Z" />
          <path class="blade" d="M511 150 Q517 126 530 106 Q517 126 517 150 Z" />
          <path class="blade" d="M615 150 Q607 130 599 114 Q617 130 621 150 Z" />
          <path class="blade" d="M741 150 Q749 128 765 110 Q745 128 747 150 Z" />
          <path class="blade" d="M893 150 Q886 129 879 112 Q894 129 899 150 Z" />
          <path class="blade" d="M1077 150 Q1085 126 1100 106 Q1085 126 1083 150 Z" />
          <path class="blade" d="M1177 150 Q1170 130 1162 114 Q1179 130 1183 150 Z" />
          <!-- 中景右侧补片：填补原右半屏空旷 -->
          <path class="blade" d="M614 150 Q622 128 637 110 Q621 128 620 150 Z" />
          <path class="blade" d="M714 150 Q722 128 737 110 Q721 128 720 150 Z" />
          <path class="blade" d="M824 150 Q832 128 847 110 Q831 128 830 150 Z" />
          <path class="blade" d="M954 150 Q962 128 977 110 Q961 128 960 150 Z" />
        </g>
        <!-- 前景草：细尖/宽弯/双叉三种叶形混排，约 20 片均匀铺满全宽，渐变 + 高光描边 -->
        <g class="grass-front">
          <path class="blade" d="M26 150 Q26.5 126 29 108 Q31.5 126 30 150 Z" />
          <path class="blade" d="M69 150 Q68 130 64 114 Q70 130 71 150 Z M73 150 Q74 130 79 116 Q75 130 75 150 Z" />
          <path class="blade" d="M116 150 Q116.5 126 119 108 Q121.5 126 120 150 Z" />
          <path class="blade" d="M164 150 Q165 128 173 114 Q171 132 171 150 Z" />
          <path class="blade" d="M212 150 Q212.5 126 215 108 Q217.5 126 216 150 Z" />
          <path
            class="blade"
            d="M259 150 Q258 130 254 114 Q260 130 261 150 Z M263 150 Q264 130 269 116 Q265 130 265 150 Z"
          />
          <path class="blade" d="M310 150 Q310.5 126 313 108 Q315.5 126 314 150 Z" />
          <path class="blade" d="M358 150 Q359 128 367 114 Q365 132 365 150 Z" />
          <path class="blade" d="M410 150 Q410.5 126 413 108 Q415.5 126 414 150 Z" />
          <path
            class="blade"
            d="M459 150 Q458 130 454 114 Q460 130 461 150 Z M463 150 Q464 130 469 116 Q465 130 465 150 Z"
          />
          <path class="blade" d="M510 150 Q510.5 126 513 108 Q515.5 126 514 150 Z" />
          <path class="blade" d="M558 150 Q559 128 567 114 Q565 132 565 150 Z" />
          <path class="blade" d="M616 150 Q616.5 126 619 108 Q621.5 126 620 150 Z" />
          <path
            class="blade"
            d="M685 150 Q684 130 680 114 Q686 130 687 150 Z M689 150 Q690 130 695 116 Q691 130 691 150 Z"
          />
          <path class="blade" d="M760 150 Q760.5 126 763 108 Q765.5 126 764 150 Z" />
          <path class="blade" d="M838 150 Q839 128 847 114 Q845 132 845 150 Z" />
          <path class="blade" d="M926 150 Q926.5 126 929 108 Q931.5 126 930 150 Z" />
          <path
            class="blade"
            d="M1015 150 Q1014 130 1010 114 Q1016 130 1017 150 Z M1019 150 Q1020 130 1025 116 Q1021 130 1021 150 Z"
          />
          <path class="blade" d="M1108 150 Q1108.5 126 1111 108 Q1113.5 126 1112 150 Z" />
          <path class="blade" d="M1171 150 Q1172 128 1180 114 Q1178 132 1178 150 Z" />
          <!-- 随机增补前景草叶，填补间隙 -->
          <path class="blade" d="M44 150 Q45 128 53 114 Q51 132 51 150 Z" />
          <path class="blade" d="M93 150 Q93.5 126 96 108 Q98.5 126 97 150 Z" />
          <path
            class="blade"
            d="M137 150 Q136 130 132 114 Q138 130 139 150 Z M141 150 Q142 130 147 116 Q143 130 143 150 Z"
          />
          <path class="blade" d="M186 150 Q187 128 195 114 Q193 132 193 150 Z" />
          <path class="blade" d="M283 150 Q283.5 126 286 108 Q288.5 126 287 150 Z" />
          <path
            class="blade"
            d="M437 150 Q436 130 432 114 Q438 130 439 150 Z M441 150 Q442 130 447 116 Q443 130 443 150 Z"
          />
          <path class="blade" d="M646 150 Q647 128 655 114 Q653 132 653 150 Z" />
          <path class="blade" d="M878 150 Q878.5 126 881 108 Q883.5 126 882 150 Z" />
          <path
            class="blade"
            d="M1067 150 Q1066 130 1062 114 Q1068 130 1069 150 Z M1071 150 Q1072 130 1077 116 Q1073 130 1073 150 Z"
          />
        </g>
      </svg>
    </div>
    <!-- 左侧树灌丛：灌木球 + 小树混生，顶部点缀小花 -->
    <div class="shrub-layer" aria-hidden="true">
      <svg viewBox="0 0 380 300" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="shrub-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#9ccc65" />
            <stop offset="0.55" stop-color="#558b2f" />
            <stop offset="1" stop-color="#33691e" />
          </linearGradient>
        </defs>
        <!-- 左下角大灌木：饱满多凸起轮廓填满左下角 + 顶部高光 + 多子叶丛 + 点缀，整体轻摆 -->
        <g class="shrub-bush bush-left">
          <path
            d="M-30 300 Q-44 264 -4 252 Q-24 220 26 220 Q32 188 68 204 Q92 174 120 196 Q150 182 152 214 Q190 202 212 232 Q246 224 234 256 Q216 280 232 296 Q244 302 196 300 Q124 304 58 302 Q8 304 -30 300 Z"
            fill="url(#shrub-grad)"
          />
          <path
            d="M30 224 Q22 206 52 202 Q66 194 86 206 Q106 200 110 218 Q90 230 74 226 Q52 232 30 224 Z"
            fill="#aed581"
            opacity="0.55"
          />
          <path d="M8 272 Q-4 250 22 242 Q36 226 56 240 Q44 260 32 268 Q20 274 8 272 Z" fill="#7cb342" opacity="0.85" />
          <path
            d="M120 256 Q108 236 132 230 Q146 216 166 228 Q154 248 142 256 Q132 262 120 256 Z"
            fill="#7cb342"
            opacity="0.8"
          />
          <path
            d="M70 244 Q60 226 84 222 Q98 212 116 224 Q102 240 92 246 Q80 250 70 244 Z"
            fill="#9ccc65"
            opacity="0.7"
          />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#9ccc65" transform="translate(40,224) rotate(-18)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#c5e1a5" transform="translate(88,210) rotate(-8)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#558b2f" transform="translate(135,228) rotate(30)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#33691e" transform="translate(175,244) rotate(22)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#7cb342" transform="translate(64,250) rotate(-12)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#c5e1a5" transform="translate(110,236) rotate(-6)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#9ccc65" transform="translate(155,218) rotate(18)" />
        </g>
        <!-- 中灌丛：轮廓 + 高光 + 子叶丛 + 点缀，点缀位置与左灌丛区分 -->
        <g class="shrub-bush bush-mid">
          <path
            d="M120 298 Q104 274 132 262 Q118 236 148 234 Q152 208 182 222 Q200 198 222 218 Q248 206 250 234 Q276 242 258 268 Q270 296 236 294 Q180 302 120 298 Z"
            fill="url(#shrub-grad)"
          />
          <path
            d="M168 232 Q160 218 180 214 Q190 206 204 216 Q220 210 224 226 Q208 236 194 234 Q178 240 168 232 Z"
            fill="#aed581"
            opacity="0.55"
          />
          <path
            d="M150 282 Q138 262 160 252 Q172 236 192 248 Q182 268 170 278 Q160 286 150 282 Z"
            fill="#7cb342"
            opacity="0.85"
          />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#9ccc65" transform="translate(172,236) rotate(-18)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#33691e" transform="translate(212,250) rotate(22)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#c5e1a5" transform="translate(194,220) rotate(-8)" />
        </g>
        <!-- 右侧追加一团灌木(增加数量)，与中灌丛连片 -->
        <g class="shrub-bush bush-extra">
          <path
            d="M278 300 Q264 276 296 266 Q282 238 314 238 Q320 212 350 224 Q370 204 388 224 Q376 250 362 258 Q350 264 340 258 Q318 302 278 300 Z"
            fill="url(#shrub-grad)"
          />
          <path
            d="M318 244 Q310 228 330 224 Q340 216 354 226 Q346 240 338 244 Q328 248 318 244 Z"
            fill="#aed581"
            opacity="0.55"
          />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#9ccc65" transform="translate(322,236) rotate(-14)" />
          <path d="M0 0 Q-5 -7 0 -16 Q5 -7 0 0 Z" fill="#33691e" transform="translate(360,248) rotate(22)" />
        </g>
      </svg>
    </div>
    <!-- 远景小树：立于草原上方边缘(地平线)，缩小，层级在草原前 -->
    <div class="tree-layer" aria-hidden="true">
      <svg viewBox="200 80 200 240" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="tree2-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#81c784" />
            <stop offset="0.5" stop-color="#43a047" />
            <stop offset="1" stop-color="#2e7d32" />
          </linearGradient>
          <linearGradient id="trunk2-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#8d6e63" />
            <stop offset="1" stop-color="#4e342e" />
          </linearGradient>
        </defs>
        <!-- 树干：根部微膨大、主干非对称微弯，替代原直筒 -->
        <path
          d="M278 300 Q272 262 283 222 Q286 210 290 206 Q294 210 297 222 Q303 262 301 300 Q290 306 278 300 Z"
          fill="url(#trunk2-grad)"
        />
        <!-- 树冠：多团块叠加成蓬松簇状，整体绕树干顶轻摆 -->
        <g class="tree-crown">
          <path
            d="M230 208 Q206 182 234 162 Q214 130 252 126 Q262 100 292 108 Q318 92 334 122 Q360 126 348 156 Q370 176 346 194 Q356 212 328 206 Q302 218 276 208 Q252 216 230 208 Z"
            fill="url(#tree2-grad)"
          />
          <path
            d="M250 150 Q238 132 258 126 Q266 110 286 116 Q278 134 272 148 Q260 156 250 150 Z"
            fill="#66bb6a"
            opacity="0.85"
          />
          <path
            d="M296 120 Q288 104 308 100 Q318 88 332 100 Q322 118 314 130 Q304 134 296 120 Z"
            fill="#a5d6a7"
            opacity="0.6"
          />
          <path
            d="M330 170 Q318 154 338 150 Q348 140 358 152 Q350 168 342 178 Q334 180 330 170 Z"
            fill="#43a047"
            opacity="0.75"
          />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#9ccc65" transform="translate(262,132) rotate(-18)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#33691e" transform="translate(322,144) rotate(28)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#c5e1a5" transform="translate(294,108) rotate(-6)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#7cb342" transform="translate(344,166) rotate(36)" />
        </g>
      </svg>
    </div>
    <!-- 右侧树：镜像一棵，立于草原右上方边缘 -->
    <div class="tree-layer tree-right" aria-hidden="true">
      <svg viewBox="200 80 200 240" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="tree3-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#81c784" />
            <stop offset="0.5" stop-color="#43a047" />
            <stop offset="1" stop-color="#2e7d32" />
          </linearGradient>
          <linearGradient id="trunk3-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#8d6e63" />
            <stop offset="1" stop-color="#4e342e" />
          </linearGradient>
        </defs>
        <!-- 树干：与左树不同的弯曲方向与根部形态，去镜像 -->
        <path
          d="M282 300 Q290 260 281 220 Q287 210 291 206 Q295 210 296 222 Q290 262 298 300 Q290 305 282 300 Z"
          fill="url(#trunk3-grad)"
        />
        <!-- 树冠：团块配比与左树不同(整体偏右、略矮)，消除镜像感 -->
        <g class="tree-crown">
          <path
            d="M222 210 Q200 186 226 168 Q208 138 244 134 Q252 110 280 118 Q304 104 320 132 Q344 136 334 164 Q354 182 332 198 Q342 214 318 208 Q294 218 270 210 Q246 216 222 210 Z"
            fill="url(#tree3-grad)"
          />
          <path
            d="M244 152 Q234 134 252 130 Q260 116 278 120 Q270 136 264 148 Q254 154 244 152 Z"
            fill="#66bb6a"
            opacity="0.85"
          />
          <path
            d="M288 124 Q282 108 300 106 Q310 96 322 108 Q312 124 304 134 Q296 138 288 124 Z"
            fill="#a5d6a7"
            opacity="0.6"
          />
          <path
            d="M322 168 Q312 154 330 150 Q338 142 348 152 Q340 166 332 176 Q326 178 322 168 Z"
            fill="#43a047"
            opacity="0.75"
          />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#c5e1a5" transform="translate(256,126) rotate(-12)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#9ccc65" transform="translate(308,140) rotate(22)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#7cb342" transform="translate(284,110) rotate(-8)" />
          <path d="M0 0 Q-6 -8 0 -18 Q6 -8 0 0 Z" fill="#33691e" transform="translate(338,160) rotate(32)" />
        </g>
      </svg>
    </div>
    <!-- 花朵：层级低于灌木与前景草，藏于灌木/草丛之后探出，呈远近层次 -->
    <div class="flower-layer" aria-hidden="true">
      <svg viewBox="0 0 380 300" preserveAspectRatio="xMidYMax meet">
        <defs>
          <!-- 水滴花瓣(底端落在原点,便于绕花心旋转散开)：紫 / 粉两色复用 -->
          <g id="petal-purple">
            <path d="M0 0 Q3.2 -3 2.6 -7 Q0 -10 -2.6 -7 Q-3.2 -3 0 0 Z" fill="#ba68c8" />
          </g>
          <g id="petal-pink">
            <path d="M0 0 Q3.6 -3.5 3 -8 Q0 -11.5 -3 -8 Q-3.6 -3.5 0 0 Z" fill="#ff80ab" />
          </g>
          <!-- 花叶：水滴形小叶，每茎左右各一片 -->
          <g id="leaf-shape">
            <path d="M0 0 Q-3.5 -4 0 -11 Q3.5 -4 0 0 Z" fill="#66bb6a" />
          </g>
        </defs>
        <!-- 上层长茎花：花头较高、杆长，每茎左右两片侧叶，整朵随风摆 -->
        <g class="flower" transform="translate(92,182)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q-2 50 1 100" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(128,196)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q2 52 -1 92" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(48,206)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q-3 48 0 88" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(60,176)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q3 55 -1 112" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(168,170)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q-2 58 1 120" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(218,190)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q2 52 -2 102" />
            <use href="#leaf-shape" transform="translate(2,30) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,46) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <!-- 接地短花：贴草地、杆短，与右侧接地花呼应，整朵随风摆 -->
        <g class="flower" transform="translate(75,258)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q2 28 -1 52" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(150,252)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q-2 26 1 48" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(245,260)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q1 30 -1 54" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(325,254)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q-1 25 1 46" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
      </svg>
    </div>
    <!-- 右侧花组：点缀开阔草原右半屏，与左侧花丛呼应，复用上方 defs 花瓣 -->
    <div class="flower-layer flower-right" aria-hidden="true">
      <svg viewBox="0 0 380 300" preserveAspectRatio="xMidYMax meet">
        <g class="flower" transform="translate(110,254)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q2 28 -1 50" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(230,260)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q-1 25 1 46" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(308,254)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q1 27 -1 54" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
      </svg>
    </div>
    <!-- 灌木顶部短花杆小花：层级高于灌木(z5)，长在左下大灌木顶/前，花头小且杆短 -->
    <div class="flower-layer flower-top" aria-hidden="true">
      <svg viewBox="0 0 380 300" preserveAspectRatio="xMidYMax meet">
        <!-- 灌木顶部短花杆小花：花头小、杆短，整朵随风摆 -->
        <g class="flower" transform="translate(70,212) scale(0.8)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q1 14 0 26" />
            <use href="#leaf-shape" transform="translate(2,10) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,15) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="2.5" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(125,200) scale(0.75)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q-1 12 0 24" />
            <use href="#leaf-shape" transform="translate(2,10) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,15) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(175,216) scale(0.8)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q1 15 0 28" />
            <use href="#leaf-shape" transform="translate(2,10) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,15) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="2.5" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(105,206) scale(0.7)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q-1 12 0 22" />
            <use href="#leaf-shape" transform="translate(2,10) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,15) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <!-- 灌木前接地短花：贴草地、杆短，层级高于灌木(z5)，整朵随风摆 -->
        <g class="flower" transform="translate(85,258)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q2 28 -1 52" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(165,252)">
          <g class="sway b5">
            <path class="stem" d="M0 2 Q-2 26 1 48" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-pink" />
              <use href="#petal-pink" transform="rotate(72)" />
              <use href="#petal-pink" transform="rotate(144)" />
              <use href="#petal-pink" transform="rotate(216)" />
              <use href="#petal-pink" transform="rotate(288)" />
              <circle r="3.5" fill="#ffeb3b" />
            </g>
          </g>
        </g>
        <g class="flower" transform="translate(225,260)">
          <g class="sway b4">
            <path class="stem" d="M0 2 Q1 30 -1 54" />
            <use href="#leaf-shape" transform="translate(2,18) rotate(42)" />
            <use href="#leaf-shape" transform="translate(-2,28) rotate(-42)" opacity="0.8" />
            <g class="bloom">
              <use href="#petal-purple" />
              <use href="#petal-purple" transform="rotate(72)" />
              <use href="#petal-purple" transform="rotate(144)" />
              <use href="#petal-purple" transform="rotate(216)" />
              <use href="#petal-purple" transform="rotate(288)" />
              <circle r="3" fill="#fff59d" />
            </g>
          </g>
        </g>
      </svg>
    </div>
    <!-- 艺术渐变：画面从左(深)到右(淡)，增加层次与氛围 -->
    <div class="bg-overlay" aria-hidden="true"></div>
    <!-- 风吹花瓣/叶片：白天从底部飘起、斜向右上飞出(暗色隐藏)；前景(z6) -->
    <PetalWind />
    <!-- 萤火虫：暗色夜空慢飘闪烁(白天隐藏)；前景(z6) -->
    <Fireflies />
  </div>
</template>

<style scoped>
/* 暗色全局规则集中放非 scoped 块（见文件末尾），此处仅亮色与结构布局。
   scoped + :global 组合在 VitePress 产物里会丢失 html.dark 选择器，故暗色统一走非 scoped。 */
/* ===== 背景层：天空(蓝天+流动云) / 草地(风吹草) / 地平线辉光，清新自然 ===== */
/* 根容器：fixed 铺满视口、置于内容之下、不拦截交互 */
.nature-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 天空：清新蓝天渐变，铺满视口，底部渐浅过渡到草地 */
.sky-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, #e0f7fa 0%, #b3e5fc 46%, #d3effb 76%, #e6f7ec 100%);
}

/* 暗色规则见文件末尾非 scoped 块 */
/* 天空光源光晕：定位到右上角太阳/月亮处，向外柔和扩散，赋予天空明暗指向 */
.sky-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at 78% 22%,
    rgba(255, 248, 224, 0.55) 0%,
    rgba(255, 238, 198, 0.22) 18%,
    transparent 46%
  );
}

/* 远山：4 层深浅起伏，由远到近透明度递增，营造忽远忽近的空气透视 */
.hills-layer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 90px;
  height: 170px;
  z-index: 1;
  pointer-events: none;
}

.hills-svg {
  width: 100%;
  height: 100%;
}

.hill-1 {
  fill: #dbeafe;
  opacity: 0.5;
}

.hill-2 {
  fill: #b3e5fc;
  opacity: 0.6;
}

.hill-3 {
  fill: #90cdf4;
  opacity: 0.65;
}

.hill-4 {
  fill: #81d4fa;
  opacity: 0.7;
}

/* 草原：左低右高微斜的宽扁椭圆，底部出屏形成弧形草地边缘 */
.meadow {
  position: absolute;
  left: 50%;
  bottom: -130px;
  width: 168%;
  height: 420px;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
  transform: translateX(-50%) rotate(-6deg);
  background: radial-gradient(ellipse at 50% 26%, #b6d6a8 0%, #9ccc65 40%, #7cb342 75%, #558b2f 100%);
}

/* 小花：静态点缀，居于前景草丛，极淡阴影增立体 */
.flower {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
}

/* 花杆：细绿茎从花头连到草地，暗色转深绿 */
.flower .stem {
  stroke: #4caf50;
  stroke-width: 2.5;
  stroke-linecap: round;
}

/* 花随风吹：外层 .sway 绕花杆根部摇摆，杆+叶+花头整体随风(替换原仅花头摆) */
.sway {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flower-sway 4s ease-in-out infinite;
}

/* 花摇摆：整朵(杆+叶+头)绕根部摆，幅度适中 */
@keyframes flower-sway {
  0% {
    transform: rotate(-5deg);
  }

  25% {
    transform: rotate(3deg);
  }

  50% {
    transform: rotate(5deg);
  }

  75% {
    transform: rotate(-3deg);
  }

  100% {
    transform: rotate(-5deg);
  }
}

.b4 {
  animation-duration: 4.4s;
  animation-delay: -1.2s;
}

.b5 {
  animation-duration: 4s;
  animation-delay: -3s;
}

/* 云朵外层：横向漂移容器；云体内部明暗由 .cloud-shape 的渐变 fill 提供 */
.cloud {
  position: absolute;
  left: 0;
}

/* 云朵图形：等比铺满外层宽度，fill 用内部明暗渐变（顶亮底暗），呈现云体内部体积与冷暖 */
.cloud-shape {
  display: block;
  width: 100%;
  height: auto;
  fill: url(#cloud-grad);
  /* 轻微底部投影 + 柔模糊：让云漂浮于天空（内部明暗由渐变 fill 提供）*/
  filter: drop-shadow(0 4px 6px rgba(120, 150, 195, 0.18)) blur(0.5px);
  /* 透明呼吸：轻微明暗起伏，各朵经下方选择器错峰；横向漂移由外层 .cloud 负责 */
  animation: cloud-breathe 9s ease-in-out infinite;
}

/* 各朵云：位置/体积/整体透明度/漂移时长与延迟各异，形成视差层次；漂移统一放慢保持匀速 */
.cloud--1 {
  top: 9%;
  width: 150px;
  animation: cloud-drift 480s linear infinite;
}

.cloud--2 {
  top: 20%;
  width: 110px;
  opacity: 0.72;
  animation: cloud-drift 600s linear infinite;
  animation-delay: -180s;
}

.cloud--3 {
  top: 33%;
  width: 200px;
  opacity: 0.85;
  animation: cloud-drift 720s linear infinite;
  animation-delay: -376s;
}

.cloud--4 {
  top: 14%;
  width: 90px;
  opacity: 0.62;
  animation: cloud-drift 520s linear infinite;
  animation-delay: -100s;
}

.cloud--5 {
  top: 40%;
  width: 130px;
  opacity: 0.7;
  animation: cloud-drift 640s linear infinite;
  animation-delay: -470s;
}

/* 呼吸时长与延迟按朵错峰，避免机械同步 */
.cloud--2 .cloud-shape {
  animation-duration: 11s;
  animation-delay: -3s;
}

.cloud--3 .cloud-shape {
  animation-duration: 13s;
  animation-delay: -5s;
}

.cloud--4 .cloud-shape {
  animation-duration: 8s;
  animation-delay: -2s;
}

.cloud--5 .cloud-shape {
  animation-duration: 10s;
  animation-delay: -6s;
}

/* 云横向漂移：左屏外 → 右屏外，首尾均在屏外实现无缝循环 */
@keyframes cloud-drift {
  from {
    transform: translateX(-240px);
  }

  to {
    transform: translateX(calc(100vw + 240px));
  }
}

/* 透明呼吸：轻微明暗起伏，与浮动错峰增加生气 */
@keyframes cloud-breathe {
  0%,
  100% {
    opacity: 0.82;
  }

  50% {
    opacity: 1;
  }
}

/* 云朵定义画布：仅承载 symbol 复用，不占布局、不可见 */
.cloud-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

/* 草地层：贴底，三层前景草叶（草原底色由 .meadow 提供） */
.grass-layer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 150px;
  z-index: 4;
  pointer-events: none;
}

.grass-svg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 草叶：绕根部摇摆(SVG 需 transform-box:fill-box + origin:bottom)，默认时长被下方 :nth-child 覆盖以错峰 */
.blade {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: grass-sway 3.4s ease-in-out infinite;
}

/* 三层草叶按位置循环分配不同 duration/delay，错峰呈现自然风拂波动 */
.grass-back .blade:nth-child(3n + 1) {
  animation-duration: 4.4s;
  animation-delay: -0.5s;
}

.grass-back .blade:nth-child(3n + 2) {
  animation-duration: 4.6s;
  animation-delay: -1.8s;
}

.grass-back .blade:nth-child(3n + 3) {
  animation-duration: 4.2s;
  animation-delay: -3s;
}

.grass-mid .blade:nth-child(3n + 1) {
  animation-duration: 3.6s;
  animation-delay: -0.4s;
}

.grass-mid .blade:nth-child(3n + 2) {
  animation-duration: 3.8s;
  animation-delay: -1.6s;
}

.grass-mid .blade:nth-child(3n + 3) {
  animation-duration: 3.5s;
  animation-delay: -2.8s;
}

.grass-front .blade:nth-child(3n + 1) {
  animation-duration: 3s;
  animation-delay: -0.5s;
}

.grass-front .blade:nth-child(3n + 2) {
  animation-duration: 3.2s;
  animation-delay: -1.7s;
}

.grass-front .blade:nth-child(3n + 3) {
  animation-duration: 2.9s;
  animation-delay: -2.6s;
}

/* 远景草：浅草绿纯色 + 轻微模糊降透明，营造景深 */
.grass-back .blade {
  fill: #a5d6a7;
}

.grass-back {
  opacity: 0.8;
  filter: blur(1.4px);
}

/* 中景草：渐变(根深→尖浅)增立体 */
.grass-mid .blade {
  fill: url(#blade-mid-grad);
}

/* 前景草：渐变(深草绿→嫩黄绿) + 淡白高光描边（阳光感） */
.grass-front .blade {
  fill: url(#blade-front-grad);
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 0.6;
}

.grass-front,
.grass-mid {
  filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.35));
}

/* 风吹摇摆：4 段模拟风拂过，不同草叶 dur/delay 错峰呈现自然波动 */
@keyframes grass-sway {
  0% {
    transform: rotate(-4deg);
  }

  25% {
    transform: rotate(2deg);
  }

  50% {
    transform: rotate(4deg);
  }

  75% {
    transform: rotate(-2deg);
  }

  100% {
    transform: rotate(-4deg);
  }
}

/* 花朵：层级低于灌木与前景草，藏于灌木/草丛之后探出，呈远近层次 */
.flower-layer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 560px;
  height: 400px;
  z-index: 2;
  pointer-events: none;
}

.flower-layer svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 右侧花组：定位到视口右侧，复用左侧 defs 花瓣 */
.flower-right {
  left: auto;
  right: 0;
}

/* 灌木顶部小花：层级高于灌木(z5)，浮于灌木与前景草之前，短花杆小朵 */
.flower-top {
  z-index: 5;
}

/* 左侧树灌丛：灌木球 + 小树混生，底部前景；暗色整体压暗 */
.shrub-layer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 560px;
  height: 400px;
  z-index: 3;
  pointer-events: none;
}

.shrub-layer svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 灌木团：随风轻摆(绕接地≈自身包围盒底部中心)，三团错峰；与树/草/花统一风吹 */
.shrub-bush {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: shrub-sway 8s ease-in-out infinite;
}

.bush-mid {
  animation-duration: 7.6s;
  animation-delay: -4.4s;
}

.bush-extra {
  animation-duration: 8.4s;
  animation-delay: -3s;
}

/* 灌木摇摆：摆幅比树更轻微(±1°) */
@keyframes shrub-sway {
  0%,
  100% {
    transform: rotate(-1deg);
  }

  50% {
    transform: rotate(1deg);
  }
}

/* 远景小树：立于草原上方边缘(地平线)，缩小，层级在草原(z1)前 */
.tree-layer {
  position: absolute;
  left: 3%;
  bottom: 130px;
  width: 175px;
  height: 215px;
  z-index: 2;
  pointer-events: none;
}

.tree-layer svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 右侧树：覆盖定位到右侧（其余继承 .tree-layer） */
.tree-right {
  left: auto;
  right: 1%;
}

/* 树冠：随风轻摆(绕树干顶≈自身包围盒底部中心)，左右树错峰；草/花已在摆，统一风吹 */
.tree-crown {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: tree-sway 7s ease-in-out infinite;
}

.tree-right .tree-crown {
  animation-duration: 7.6s;
  animation-delay: -2.4s;
}

/* 树冠摇摆：摆幅小(±1.2°)周期慢，与草/花错峰，避免机械 */
@keyframes tree-sway {
  0%,
  100% {
    transform: rotate(-1.2deg);
  }

  50% {
    transform: rotate(1.2deg);
  }
}

/* 艺术渐变叠加：从左下角向外扩散(左下深→右上淡)，仅覆盖下方草地/灌丛，不染天空 */
.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  background: radial-gradient(
    ellipse 95% 62% at 0% 100%,
    rgba(8, 24, 16, 0.5) 0%,
    rgba(8, 24, 16, 0.2) 38%,
    transparent 72%
  );
}

/* 尊重「减少动效」偏好：关闭云漂移/浮动/呼吸、草摇摆 */
@media (prefers-reduced-motion: reduce) {
  .cloud,
  .cloud-shape,
  .blade,
  .sway,
  .tree-crown,
  .shrub-bush {
    animation: none !important;
  }
}

/* 标签页隐藏时暂停所有动画（穿透子组件），节省 CPU/GPU */
.nature-background[data-paused='true'] :deep(*) {
  animation-play-state: paused !important;
}
</style>

<!-- ============================================================
     暗色（黑夜）场景规则：放非 scoped 块，确保 html.dark 选择器稳定编译。
     scoped + :global 组合在 VitePress 产物里会丢失 html.dark 选择器，
     故所有昼夜切换规则统一在此全局块定义。
     ============================================================ -->
<style>
/* 天空：柔和暮夜深蓝天空 */
html.dark .sky-layer {
  background: linear-gradient(180deg, #0b1437 0%, #142a5c 45%, #1b335f 78%, #1a2342 100%);
}

/* 天空光源光晕：暗色月光柔和扩散 */
html.dark .sky-glow {
  background: radial-gradient(circle at 78% 22%, rgba(182, 202, 255, 0.2) 0%, rgba(148, 174, 240, 0.1) 22%, transparent 52%);
}

/* 远山：4 层深浅起伏，暗色转深蓝剪影 */
html.dark .hill-1 {
  fill: #243b5e;
  opacity: 0.6;
}

html.dark .hill-2 {
  fill: #1e3358;
  opacity: 0.65;
}

html.dark .hill-3 {
  fill: #18304f;
  opacity: 0.7;
}

html.dark .hill-4 {
  fill: #122842;
  opacity: 0.75;
}

/* 草原：暗色转暮夜翠 */
html.dark .meadow {
  background: radial-gradient(ellipse at 50% 28%, #2e5a3f 0%, #1f3a28 40%, #16321f 75%, #0f2618 100%);
}

/* 花杆：暗色转深绿 */
html.dark .flower .stem {
  stroke: #2e5a3f;
}

/* 云朵：暗色夜空剪影 */
html.dark .cloud-shape {
  fill: url(#cloud-grad-dark);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 12, 0.4)) blur(0.5px);
}

/* 草叶：暗色转冷翠，前/中景沿用渐变(冷翠站点) */
html.dark .grass-back .blade {
  fill: #2e5a3f;
}

html.dark .grass-mid .blade {
  fill: url(#blade-mid-grad-dark);
}

html.dark .grass-front .blade {
  fill: url(#blade-front-grad-dark);
  stroke: rgba(120, 200, 255, 0.25);
}

html.dark .grass-front,
html.dark .grass-mid {
  filter: drop-shadow(0 0 3px rgba(96, 200, 255, 0.4));
}

/* 灌木/树：暗色整体压暗 */
html.dark .shrub-layer svg {
  filter: brightness(0.55) saturate(0.9);
}

html.dark .tree-layer svg {
  filter: brightness(0.6) saturate(0.9);
}

/* 艺术渐变叠加：暗色加深 */
html.dark .bg-overlay {
  background: radial-gradient(ellipse 95% 62% at 0% 100%, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.28) 38%, transparent 72%);
}
</style>
