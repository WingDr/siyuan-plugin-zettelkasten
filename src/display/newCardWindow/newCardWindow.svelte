<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Protyle } from "siyuan";
  import PluginZettelkasten from "@/index";
  import { sleep } from "@/utils/util";

  export let plugin: PluginZettelkasten;
  export let blockID: string;
  let divProtyle: HTMLDivElement;
  let protyle: Protyle;
  

  onMount(async () => {
      protyle = await initProtyle();
      if (!protyle) return;
      // 聚焦contenteditable，参考https://blog.csdn.net/weixin_38099055/article/details/108483748
      let focusNode = document.querySelector('.protyle div[data-node-id] div[contenteditable]');
      while (!focusNode) { 
            // 等待protyle渲染出第一段，不然光标聚焦位置会错
            await sleep(200);
            focusNode = document.querySelector('.protyle div[data-node-id] div[contenteditable]'); 
        }
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