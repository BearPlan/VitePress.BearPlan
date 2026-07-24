# Vue3 函数式调用组件

业务中常遇到这类需求：点击某个按钮后弹出一个组件（如代码编辑器、确认框），用完即销毁，不需要在模板里常驻声明。Vue 默认的 `<Component v-if>` 写法需要把组件写进模板、手动维护可见状态，比较繁琐。

`createComponent` 封装了「动态挂载组件 + 事件监听 + 卸载销毁」的完整流程，让组件可以像调用函数一样使用。

## 基本用法

以调用代码编辑器组件 `MonacoCode` 为例：传入组件和初始 props，拿到 `on` 监听事件、`unmount` 销毁实例。

::: warning 记得销毁
组件用完后必须调用 `unmount()`，否则 DOM 节点和事件监听会残留，造成内存泄漏。
:::

```ts
const openMonacoCode = async (row: TableColumnInfo) => {
  // 函数式组件：instance 为 ref，on 为 emit，unmount 为 destroy
  const { instance, on, unmount } = await createComponent(MonacoCode, {
    modelValue: row.attrs,
    visible: true
  });

  on('Change', (code: string) => {
    console.log(code);
    row.attrs = code;
  });

  on('update:visible', () => {
    unmount();
  });
};
```

## 子组件实现

被调用的组件正常编写即可，通过 `defineModel` 双向绑定，`defineEmits` 对外抛事件。`visible` 由父组件控制，关闭时 emit `update:visible` 触发卸载。

```vue
<script setup lang="tsx">
import type * as monaco from 'monaco-editor';
import { ref } from 'vue';
import { $t } from '@/locales';
import customRender from '@/utils/customRender';

const language = ref('javascript');

// modelValue 用 defineModel 双向绑定
const value = defineModel<string>({
  default: ''
});
const visible = defineModel<boolean>('visible', {
  default: false
});

interface Emits {
  (e: 'Change', value: string): void;
}
const emit = defineEmits<Emits>();

const title = ref('插槽编辑');

const handleSubmit = () => {
  emit('Change', value.value);
  visible.value = false;
};

const handleClose = () => {
  visible.value = false;
};
</script>

<template>
  <ElDialog v-model="visible" :title="title" :append-to-body="true" class="w-1400px">
    <ElRow :gutter="24">
      <ElCol :span="24">
        <MonacoEditor
          v-bind="$attrs"
          v-model:value="value"
          :language="language"
          width="100%"
          height="650px"
          @editor-mounted="editorMounted"
        />
      </ElCol>
    </ElRow>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="handleClose">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style lang="less" scoped></style>
```

## createComponent 实现

核心思路：用 `createApp` 创建独立应用实例挂载到动态创建的 DOM 节点，劫持组件实例的 `emit` 方法实现事件转发，最后提供 `unmount` 清理 DOM。

```ts
import { Component, createApp, DefineComponent, EmitsOptions } from 'vue';

type Data = Record<string, unknown>;

/**
 * 推断组件的事件参数类型
 * @template T - 组件类型
 */
type EventParams<T> = T extends DefineComponent<any, any, any, any, any, any, any, infer Emits extends EmitsOptions>
  ? Emits extends Record<string, (...args: infer Args) => any>
    ? { [K in keyof Emits]: Parameters<Emits[K]> }
    : Emits extends string[]
      ? { [K in Emits[number]]: any[] }
      : { [key: string]: any[] }
  : { [key: string]: any[] };

/**
 * 创建一个 Vue 组件实例
 * @template T - 组件类型
 * @param rootComponent - 要创建的根组件
 * @param rootProps - 传递给组件的 props
 * @returns 包含组件实例、事件监听和卸载方法的对象
 */
export async function createComponent<T extends Component>(
  rootComponent: T,
  rootProps?: Data | null
): Promise<{
  instance: T;
  on: <K extends keyof EventParams<T>>(
    event: K,
    handler: (...args: EventParams<T>[K]) => void
  ) => void;
  unmount: () => void;
}> {
  const mountNode = document.createElement('div');
  const app = createApp(rootComponent, rootProps);

  // 事件监听器存储
  const listeners = new Map<string, ((...args: any[]) => void)[]>();

  // 挂载实例
  const instance = app.mount(mountNode) as any;
  document.body.appendChild(mountNode);

  // 劫持 emit 方法，转发到外部监听
  const originalEmit = instance.$.emit;
  instance.$.emit = (event: string, ...args: any[]) => {
    originalEmit(event, ...args);
    listeners.get(event)?.forEach(fn => fn(...args));
  };

  return {
    instance: instance as T,
    on: (event, handler) => {
      const e = event as string;
      const h = handler as (...args: any[]) => void;
      const handlers = listeners.get(e) || [];
      listeners.set(e, [...handlers, h]);
    },
    unmount: () => {
      app.unmount();
      document.body.removeChild(mountNode);
    }
  };
}
```

## 关键点说明

- **`createApp` 独立挂载**：每次调用都创建独立的 Vue 应用实例和 DOM 节点，多个函数式组件互不干扰。
- **劫持 `emit` 转发事件**：重写 `instance.$.emit`，在原 emit 之后把事件转发给外部通过 `on` 注册的监听器，实现「子组件 emit → 外部 on 回调」。
- **`Map` 存监听器**：支持同一事件多个监听器，`unmount` 时随应用实例一起回收。
- **`unmount` 必须调用**：卸载应用实例并移除 DOM 节点，防止内存泄漏。
