import{_ as s,c as a,o as p,ae as e}from"./chunks/framework.Dh1jimFm.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"blog/create-component.md","filePath":"blog/create-component.md"}'),l={name:"blog/create-component.md"};function t(i,n,o,c,r,u){return p(),a("div",null,n[0]||(n[0]=[e(`<p><strong>Vue3函数式调用组件 createComponent</strong></p><p>== 调用结束要关闭 组件==</p><p>以调用 重写插槽为例</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const openMonacoCode=async (row: TableColumnInfo)=&gt;{</span></span>
<span class="line"><span>   //函数式组件 instance 为 ref , on 为 emit , unmount 为 destroy</span></span>
<span class="line"><span>   const { instance, on, unmount } = await  createComponent( MonacoCode, { modelValue: row.attrs,visible: true } )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   on(&#39;Change&#39;, (code:string) =&gt; {</span></span>
<span class="line"><span>    console.log(code);</span></span>
<span class="line"><span>     row.attrs = code;</span></span>
<span class="line"><span>   })</span></span>
<span class="line"><span>   on(&#39;update:visible&#39;, () =&gt; {</span></span>
<span class="line"><span>          unmount()</span></span>
<span class="line"><span>   })</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>子组件内部 (monaco-code.vue)</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;script setup lang=&quot;tsx&quot;&gt;</span></span>
<span class="line"><span>import type * as monaco from &#39;monaco-editor&#39;;</span></span>
<span class="line"><span>import { ref } from &#39;vue&#39;;</span></span>
<span class="line"><span>import { $t } from &#39;@/locales&#39;;</span></span>
<span class="line"><span>import customRender from &#39;@/utils/customRender&#39;;</span></span>
<span class="line"><span>const language = ref(&#39;javascript&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 根据提示，将 defineModelValue 替换为 defineModel</span></span>
<span class="line"><span>const value = defineModel&lt;string&gt;({</span></span>
<span class="line"><span>  default: &#39;&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span>const visible =defineModel&lt;boolean&gt;(&#39;visible&#39;, {</span></span>
<span class="line"><span>  default: false</span></span>
<span class="line"><span>})</span></span>
<span class="line"><span>interface Emits {</span></span>
<span class="line"><span>  (e: &#39;Change&#39;, value: string): void;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>const emit = defineEmits&lt;Emits&gt;();</span></span>
<span class="line"><span>const columns = ref&lt;Array&lt;any&gt;&gt;([</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    type: &#39;selection&#39;,</span></span>
<span class="line"><span>    align: &#39;center&#39;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    key: &#39;name&#39;,</span></span>
<span class="line"><span>    title: &#39;name&#39;,</span></span>
<span class="line"><span>    align: &#39;center&#39;</span></span>
<span class="line"><span>    // render: row =&gt; {</span></span>
<span class="line"><span>    //   return h(&#39;p&#39;, Enum.MenuType[row.id]);</span></span>
<span class="line"><span>    // }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const editorMounted = (editor: monaco.editor.IStandaloneCodeEditor) =&gt; {</span></span>
<span class="line"><span>  editor.onDidChangeModelContent(() =&gt; {</span></span>
<span class="line"><span>    // const value = editor.getValue();</span></span>
<span class="line"><span>    // columns.value[2] = customRender(value || &#39;&#39;, h, naive)[0];</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>const title = ref(&#39;插槽编辑&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const handleSubmit = () =&gt; {</span></span>
<span class="line"><span>  emit(&#39;Change&#39;, value.value);</span></span>
<span class="line"><span>  visible.value = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>const handleClose = () =&gt; {</span></span>
<span class="line"><span>  visible.value = false;</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>&lt;/script&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;template&gt;</span></span>
<span class="line"><span>  &lt;ElDialog v-model=&quot;visible&quot; :title=&quot;title&quot; :append-to-body=&quot;true&quot; class=&quot;w-1400px&quot; &gt;</span></span>
<span class="line"><span>    &lt;ElRow :gutter=&quot;24&quot;&gt;</span></span>
<span class="line"><span>      &lt;ElCol :span=&quot;24&quot;&gt;</span></span>
<span class="line"><span>        &lt;MonacoEditor</span></span>
<span class="line"><span>          v-bind=&quot;$attrs&quot;</span></span>
<span class="line"><span>          v-model:value=&quot;value&quot;</span></span>
<span class="line"><span>          :language=&quot;language&quot;</span></span>
<span class="line"><span>          width=&quot;100%&quot;</span></span>
<span class="line"><span>          height=&quot;650px&quot;</span></span>
<span class="line"><span>          @editor-mounted=&quot;editorMounted&quot;</span></span>
<span class="line"><span>        &gt;&lt;/MonacoEditor&gt;</span></span>
<span class="line"><span>      &lt;/ElCol&gt;</span></span>
<span class="line"><span>    &lt;/ElRow&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;template #footer&gt;</span></span>
<span class="line"><span>      &lt;ElSpace :size=&quot;16&quot; class=&quot;float-right&quot;&gt;</span></span>
<span class="line"><span>        &lt;ElButton @click=&quot;handleClose&quot;&gt;{{ $t(&#39;common.cancel&#39;) }}&lt;/ElButton&gt;</span></span>
<span class="line"><span>        &lt;ElButton type=&quot;primary&quot; @click=&quot;handleSubmit&quot;&gt;{{ $t(&#39;common.confirm&#39;) }}&lt;/ElButton&gt;</span></span>
<span class="line"><span>      &lt;/ElSpace&gt;</span></span>
<span class="line"><span>    &lt;/template&gt;</span></span>
<span class="line"><span>  &lt;/ElDialog&gt;</span></span>
<span class="line"><span>&lt;/template&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;style lang=&quot;less&quot; scoped&gt;&lt;/style&gt;</span></span></code></pre></div><p><strong>实现函数式组件 createComponent</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Component, createApp, DefineComponent, EmitsOptions } from &quot;vue&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type Data = Record&lt;string, unknown&gt;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 推断组件的事件参数类型</span></span>
<span class="line"><span> * @template T - 组件类型</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>type EventParams&lt;T&gt; = T extends DefineComponent&lt;any, any, any, any, any, any, any, infer Emits extends EmitsOptions&gt;</span></span>
<span class="line"><span>  ? Emits extends Record&lt;string, (...args: infer Args) =&gt; any&gt;</span></span>
<span class="line"><span>    ? { [K in keyof Emits]: Parameters&lt;Emits[K]&gt; }</span></span>
<span class="line"><span>    : Emits extends string[]</span></span>
<span class="line"><span>      ? { [K in Emits[number]]: any[] }</span></span>
<span class="line"><span>      : { [key: string]: any[] }</span></span>
<span class="line"><span>  : { [key: string]: any[] };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 创建一个 Vue 组件实例</span></span>
<span class="line"><span> * @template T - 组件类型</span></span>
<span class="line"><span> * @param {T} rootComponent - 要创建的根组件</span></span>
<span class="line"><span> * @param {Data | null} [rootProps] - 传递给组件的 props</span></span>
<span class="line"><span> * @returns {Promise&lt;{</span></span>
<span class="line"><span> *   instance: T;</span></span>
<span class="line"><span> *   on: &lt;K extends keyof EventParams&lt;T&gt;&gt;(</span></span>
<span class="line"><span> *     event: K,</span></span>
<span class="line"><span> *     handler: (...args: EventParams&lt;T&gt;[K]) =&gt; void</span></span>
<span class="line"><span> *   ) =&gt; void;</span></span>
<span class="line"><span> *   unmount: () =&gt; void;</span></span>
<span class="line"><span> * }&gt;} - 返回包含组件实例、事件监听和卸载方法的对象</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function createComponent&lt;T extends Component&gt;(</span></span>
<span class="line"><span>  rootComponent: T,</span></span>
<span class="line"><span>  rootProps?: Data | null</span></span>
<span class="line"><span>): Promise&lt;{</span></span>
<span class="line"><span>  instance: T;</span></span>
<span class="line"><span>  on: &lt;K extends keyof EventParams&lt;T&gt;&gt;(</span></span>
<span class="line"><span>    event: K,</span></span>
<span class="line"><span>    handler: (...args: EventParams&lt;T&gt;[K]) =&gt; void</span></span>
<span class="line"><span>  ) =&gt; void;</span></span>
<span class="line"><span>  unmount: () =&gt; void;</span></span>
<span class="line"><span>}&gt; {</span></span>
<span class="line"><span>  const mountNode = document.createElement(&#39;div&#39;);</span></span>
<span class="line"><span>  const app = createApp(rootComponent, rootProps);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 事件监听器存储</span></span>
<span class="line"><span>  const listeners = new Map&lt;string, ((...args: any[]) =&gt; void)[]&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 挂载实例</span></span>
<span class="line"><span>  const instance = app.mount(mountNode) as any;</span></span>
<span class="line"><span>  document.body.appendChild(mountNode);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 劫持 emit 方法</span></span>
<span class="line"><span>  const originalEmit = instance.$.emit;</span></span>
<span class="line"><span>  instance.$.emit = (event: string, ...args: any[]) =&gt; {</span></span>
<span class="line"><span>    originalEmit(event, ...args);</span></span>
<span class="line"><span>    listeners.get(event)?.forEach(fn =&gt; fn(...args));</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return {</span></span>
<span class="line"><span>    instance: instance as T,</span></span>
<span class="line"><span>    on: (event, handler) =&gt; {</span></span>
<span class="line"><span>      const e = event as string;</span></span>
<span class="line"><span>      const h = handler as (...args: any[]) =&gt; void;</span></span>
<span class="line"><span>      const handlers = listeners.get(e) || [];</span></span>
<span class="line"><span>      listeners.set(e, [...handlers, h]);</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    unmount: () =&gt; {</span></span>
<span class="line"><span>      app.unmount();</span></span>
<span class="line"><span>      document.body.removeChild(mountNode);</span></span>
<span class="line"><span>      console.log(&quot;unmount&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export default createComponent;</span></span></code></pre></div>`,8)]))}const m=s(l,[["render",t]]);export{d as __pageData,m as default};
