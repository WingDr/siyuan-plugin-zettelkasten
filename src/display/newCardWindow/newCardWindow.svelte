<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      // sql as query, 
      createDocWithMd, removeDoc,
      getBlockByID,

      renameDoc

  } from "@/api";
  import { Protyle } from "siyuan";
  import { STORAGE_NAME } from "@/utils/constants";
  import PluginZettelkasten from "@/index";
  import { sleep } from "@/utils/util";

  export let app;
  export let plugin: PluginZettelkasten;

  let divProtyle: HTMLDivElement;
  let protyle: Protyle;
  let blockID: string = '';
  let save = false;
  

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
      if (!save && blockID) {
          const block = await getBlockByID(blockID);
          await removeDoc(block.box, block.path);
      }
      protyle?.destroy();
  });

  async function initProtyle() {
      await plugin.loadData(STORAGE_NAME)
      const notebook = plugin.data[STORAGE_NAME].cardStorageNotebook;
      const cardsDir = plugin.data[STORAGE_NAME].cardStoragePath;
      blockID = await createDocWithMd(notebook, `${cardsDir}/temp`, "")
      // 没打开新窗口的时候不会挂载，直接返回就好了
      if (!divProtyle) return;
      let block = await getBlockByID(blockID);
      while (!block) {
        block = await getBlockByID(blockID);
        await sleep(200);
      }
      await renameDoc(block.box, block.path, blockID)
      return new Protyle(app, divProtyle, {
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