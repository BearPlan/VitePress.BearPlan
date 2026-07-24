# 前端 Table 下载 Excel

业务列表页的表格本质上就是一个 Table 组件，导出 Excel 时无需调用后端接口，可直接基于已渲染的 DOM 生成 `.xls` 文件。

## 调用方式

Vue 3.5 中通过 `useTemplateRef` 获取组件实例，再用 `$el` 拿到底层 `HTMLElement` 传给下载函数。

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';

// 获取表格组件实例，$el 即底层 HTMLElement
const tableRef = useTemplateRef('tableRef');
</script>

<template>
  <ElButton ghost @click="downloadExcel(tableRef?.$el, $t(route.meta.i18nKey || route.meta.title || ''))">
    导出
  </ElButton>
</template>
```

## 实现代码

`downloadExcel` 接收 `HTMLElement` 或元素 ID，克隆 DOM 后剔除不需要的列，再拼成 Excel 可识别的 HTML 字符串导出。

```ts
import dayjs from 'dayjs';

// 支持传入 HTMLElement 或元素 ID
export default function downloadExcel(el: HTMLElement | string, name: string) {
  const targetEl = typeof el === 'string'
    ? document.getElementById(el)
    : el;

  if (!targetEl) {
    console.error('无效的表格元素');
    return;
  }

  // 深拷贝避免污染原 DOM
  const cloneNode = targetEl.cloneNode(true) as HTMLElement;
  removeElementsByClass(cloneNode, 'onExcel');

  // Excel HTML 模板
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${name}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
</head>
<body>${cloneNode.innerHTML}</body>
</html>`;

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=UTF-8'
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `${name}_${dayjs().format('YYYYMMDDHHmmss')}.xls`;
  document.body.appendChild(link);
  link.click();

  // 确保资源释放
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// 递归清理指定 class 的元素（如操作列、选择列）
function removeElementsByClass(root: HTMLElement, className: string) {
  const elements = root.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].remove();
  }

  Array.from(root.children).forEach(child => {
    removeElementsByClass(child as HTMLElement, className);
  });
}
```

## 关键点说明

- **克隆 DOM**：在副本上清理，不影响页面原表格。
- **`onExcel` 标记**：不需要导出的列（如操作按钮、复选框）加 `class="onExcel"`，导出时自动剔除。
- **文件名带时间戳**：用 `dayjs` 格式化，避免重名且便于排序。
- **资源释放**：`URL.revokeObjectURL` 延时调用，防止浏览器下载未完成就回收。
