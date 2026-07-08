<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';
import { useData } from 'vitepress';
import BackgroundScene from './components/BackgroundScene.vue';

const { Layout } = DefaultTheme;
const { page } = useData();

// 仅首页(index.md)挂载自然动态背景，其余页面不受影响
const isHome = computed(() => page.value.relativePath === 'index.md');
</script>

<template>
  <Layout>
    <template #layout-top>
      <BackgroundScene v-if="isHome" />
    </template>
  </Layout>
</template>
