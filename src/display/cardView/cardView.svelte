<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      version, 
      // sql as query, 
      lsNotebooks, 
      createDocWithMd, removeDoc,
      getBlockByID
  } from "@/api";
  import { showMessage, fetchPost, Protyle } from "siyuan";
  import { hiddenNotebook } from "@/utils/constants";

  export let app;

  let time: string = "";
  let ver: string;

  let divProtyle: HTMLDivElement;
  let protyle: Protyle;
  let blockID: string = '';
  let notebook: string;

  onMount(async () => {
      ver = await version();
      fetchPost("/api/system/currentTime", {}, (response) => {
          time = new Date(response.data).toString();
      });
      protyle = await initProtyle();
  });

  onDestroy(async () => {
      const block = await getBlockByID(blockID)
      console.log(protyle.protyle)
      await removeDoc(notebook, block.path)
      showMessage("Hello panel closed");
      protyle.destroy();
  });

  async function initProtyle() {
      const notebooksRequest = await lsNotebooks();
      let notebooks = notebooksRequest.notebooks;
      // 没有必要把所有笔记本都列出来
      notebooks = notebooks.filter(
          (notebook) => !notebook.closed && !hiddenNotebook.has(notebook.name)
      );
      notebook = notebooks[0].id;
      blockID = await createDocWithMd(notebook, `/Assets/Cards/temp`, "")
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


<div id="protyle" style="height: 360px;" bind:this={divProtyle}/>

