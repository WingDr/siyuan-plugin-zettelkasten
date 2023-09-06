<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      // sql as query, 
      createDocWithMd, removeDoc,
      getBlockByID
  } from "@/api";
  import { Protyle } from "siyuan";
  import { STORAGE_NAME } from "@/utils/constants";
  import PluginZettelkasten from "@/index";

  export let app;
  export let plugin: PluginZettelkasten;

  let divProtyle: HTMLDivElement;
  let protyle: Protyle;
  let blockID: string = '';
  let save = false;
  

  onMount(async () => {
      protyle = await initProtyle();
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
    console.log(blockID)
      if (!save) {
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