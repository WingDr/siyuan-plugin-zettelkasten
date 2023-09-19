<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Protyle } from "siyuan";
  import PluginZettelkasten from "@/index";

  export let plugin: PluginZettelkasten;
  export let blockID: string;
  let divProtyle: HTMLDivElement;
  let protyle: Protyle;
  

  onMount(async () => {
      protyle = await initProtyle();
      if (!protyle) return;
      // 聚焦contenteditable，参考https://blog.csdn.net/weixin_38099055/article/details/108483748
      const focusNode = document.querySelector('.protyle div[contenteditable]');
      const range = document.createRange();
      range.selectNodeContents(focusNode);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  });

  onDestroy(async () => {
      protyle?.destroy();
  });

  async function initProtyle() {
      // 没打开新窗口的时候不会挂载，直接返回就好了
      if (!divProtyle) return;
      return new Protyle(plugin.app, divProtyle, {
          blockId: blockID,
          render: {
              background: false,
              breadcrumb: false,
              breadcrumbDocName: false,
              scroll: true
          }
      });
      
  }
</script>

 <div id="protyle" style="height: 100%;" bind:this={divProtyle}/>