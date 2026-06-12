import{_ as n,c as a,o as p,ae as l}from"./chunks/framework.Dh1jimFm.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"blog/excel-download.md","filePath":"blog/excel-download.md"}'),e={name:"blog/excel-download.md"};function t(c,s,o,i,r,m){return p(),a("div",null,s[0]||(s[0]=[l(`<p><strong>前端Table下载excle</strong></p><p>前端表格 查看源码就是一个 Table</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>   // vue3.5  获取到组件  tableRef?.$el 拿到 HTMLElement</span></span>
<span class="line"><span>  const tableRef =useTemplateRef(&quot;tableRef&quot;);</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>  &lt;!--Html 部分  --&gt;</span></span>
<span class="line"><span>  &lt;ElButton ghost @click=&quot;downloadExcel(tableRef?.$el,$t(route.meta.i18nKey || route.meta.title || &#39;&#39;))&quot;&gt;</span></span></code></pre></div><br><p><strong>实现代码 downloadExcel</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import dayjs from &quot;dayjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 支持传入HTMLElement或元素ID</span></span>
<span class="line"><span>export default function downloadExcel(el: HTMLElement | string, name: string) {</span></span>
<span class="line"><span>  const targetEl = typeof el === &#39;string&#39; </span></span>
<span class="line"><span>    ? document.getElementById(el)</span></span>
<span class="line"><span>    : el;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (!targetEl) {</span></span>
<span class="line"><span>    console.error(&quot;无效的表格元素&quot;);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 深拷贝避免污染原DOM</span></span>
<span class="line"><span>  const cloneNode = targetEl.cloneNode(true) as HTMLElement;</span></span>
<span class="line"><span>  removeElementsByClass(cloneNode, &quot;onExcel&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 修正的Excel HTML模板</span></span>
<span class="line"><span>  const html = \`&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span>&lt;html xmlns:o=&quot;urn:schemas-microsoft-com:office:office&quot; </span></span>
<span class="line"><span>      xmlns:x=&quot;urn:schemas-microsoft-com:office:excel&quot;&gt;</span></span>
<span class="line"><span>&lt;head&gt;</span></span>
<span class="line"><span>  &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span>  &lt;!--[if gte mso 9]&gt;</span></span>
<span class="line"><span>  &lt;xml&gt;</span></span>
<span class="line"><span>    &lt;x:ExcelWorkbook&gt;</span></span>
<span class="line"><span>      &lt;x:ExcelWorksheets&gt;</span></span>
<span class="line"><span>        &lt;x:ExcelWorksheet&gt;</span></span>
<span class="line"><span>          &lt;x:Name&gt;\${name}&lt;/x:Name&gt;</span></span>
<span class="line"><span>          &lt;x:WorksheetOptions&gt;</span></span>
<span class="line"><span>            &lt;x:DisplayGridlines/&gt;</span></span>
<span class="line"><span>          &lt;/x:WorksheetOptions&gt;</span></span>
<span class="line"><span>        &lt;/x:ExcelWorksheet&gt;</span></span>
<span class="line"><span>      &lt;/x:ExcelWorksheets&gt;</span></span>
<span class="line"><span>    &lt;/x:ExcelWorkbook&gt;</span></span>
<span class="line"><span>  &lt;/xml&gt;</span></span>
<span class="line"><span>  &lt;![endif]--&gt;</span></span>
<span class="line"><span>&lt;/head&gt;</span></span>
<span class="line"><span>&lt;body&gt;\${cloneNode.innerHTML}&lt;/body&gt;</span></span>
<span class="line"><span>&lt;/html&gt;\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const blob = new Blob([html], {</span></span>
<span class="line"><span>    type: &quot;application/vnd.ms-excel;charset=UTF-8&quot; // 修正MIME类型</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const link = document.createElement(&quot;a&quot;);</span></span>
<span class="line"><span>  const url = URL.createObjectURL(blob);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  link.href = url;</span></span>
<span class="line"><span>  link.download = \`\${name}_\${dayjs().format(&quot;YYYYMMDDHHmmss&quot;)}.xls\`;</span></span>
<span class="line"><span>  document.body.appendChild(link);</span></span>
<span class="line"><span>  link.click();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 确保资源释放</span></span>
<span class="line"><span>  setTimeout(() =&gt; {</span></span>
<span class="line"><span>    document.body.removeChild(link);</span></span>
<span class="line"><span>    URL.revokeObjectURL(url);</span></span>
<span class="line"><span>  }, 100);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 优化后的DOM清理方法</span></span>
<span class="line"><span>function removeElementsByClass(root: HTMLElement, className: string) {</span></span>
<span class="line"><span>  const elements = root.getElementsByClassName(className);</span></span>
<span class="line"><span>  while (elements.length &gt; 0) {</span></span>
<span class="line"><span>    elements[0].remove();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  Array.from(root.children).forEach(child =&gt; {</span></span>
<span class="line"><span>    removeElementsByClass(child as HTMLElement, className);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div>`,6)]))}const u=n(e,[["render",t]]);export{g as __pageData,u as default};
