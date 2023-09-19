<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
  getBlockByID,
      sql
  } from "@/utils/api";
  import { STORAGE_NAME, isDev } from "@/utils/constants";
  import PluginZettelkasten from "@/index";
  import { ILogger, createLogger } from "@/utils/simple-logger";
  import "dragula/dist/dragula.css"
  import { sleep } from "@/utils/util";
  import { EasyGrid } from "@/display/cardView/buildGrid"

  import Card from "./card.svelte"

  export let app;
  export let plugin: PluginZettelkasten;

  let logger: ILogger;
  let searchBlocks: Block[] = [];
  let orgainizeBlocks: Block[] = [];
  let storageBlocks: Block[] = [];
  let showOrganize: boolean = true;
  let showKeeper: boolean = false;

  let isClone = false;

  let containerSelector = ".card-grid";
  let orgainizerSelector = ".organize-card-grid";
  let storagerSelector = ".storage-grid-container";

  let grid: EasyGrid;

  onMount(async () => {
    logger = createLogger("card view");
    await getAllBlocks();
    // await produceProtyle();
    buildGrid();
    await totalRefreshLayout();
  });

  onDestroy(async () => {
    window.removeEventListener("resize", grid.layout)
  });

  let getAllBlocks = async () => {
    const notebook = plugin.data[STORAGE_NAME].cardStorageNotebook;
    const cardsDir = plugin.data[STORAGE_NAME].cardStoragePath;
    searchBlocks = [];
    let offset = 0;
    let limit = 64;
    let searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd' limit ${offset}, ${limit}`);
    while (searchedBlocks.length == limit) {
      searchBlocks = [...searchBlocks, ...searchedBlocks];
      offset += limit;
      searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd' limit ${offset}, ${limit}`)
    }
    searchBlocks = [...searchBlocks, ...searchedBlocks];
    return;
  }

  let buildGrid = () => {
    grid = new EasyGrid({
      containerSelector,
      orgainizerSelector,
      storagerSelector,
      itemSelector: ".grid-item",
      columnClass: "grid-column",
      minWidth: 300,
      maxWidth: 500,
      dropCallback: synchronizeBlock,
      cloneCallback: async (_clone: HTMLElement, _original: HTMLElement, type: "mirror" | "copy") => {
        if (type == "copy") isClone = true;
      }
    })
    window.addEventListener("resize", totalRefreshLayout.bind(grid));
  }

  let synchronizeBlock = async (el:HTMLElement, _target:HTMLElement, _source:HTMLElement, _sibling:HTMLElement) => {
    if (isClone) {
      const id  = el.getAttribute("data-node-id");
      const block = await getBlockByID(id);
      new Card({
        target: el.parentElement,
        anchor: el,
        props: {
          app,
          block,
          index: el.parentElement.children.length
        }
      })
      el.remove();
    }
    isClone = false;
    grid.refreshItemIndex();
  }

  let totalRefreshLayout = async () => {
    await sleep(200);
    if (isDev) logger.info("完全刷新排布")
    grid.refreshItems();
    grid.refreshItemIndex();
    grid.layout()
  }
</script>

<style lang="scss">
  .tab-toolbar {
    height: 30px;
    background-color: var(--b3-theme-background);
    border-bottom: solid 1px gray;
  }

  .layout-container {
    width: 100%;
    height: calc(100% - 32px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .left-panel {
    width: 50%;
    height: 100%;
    background-color: var(--b3-theme-background);

    .organize-grid-container {
      height: 100%;
      overflow-y: scroll;
      overflow-x: hidden;

      .organize-card-grid {
        height: 100%;
      }
    }
  }

  .right-panel {
    width: 50%;
    height: 100%;
  }

  .upper-show-place {
    width: 100%;
    height: 50%;
  }

  .lower-show-place {
    height: 100%;
    overflow-x: hidden;
    overflow-y: hidden;

    &__toolbar {
      width: 100%;
      height: 30px;
      align-items: center;
      display: flex;
      flex-direction: row-reverse;
    }

    &__toolbar-refresh {
      margin: 0px 10px;
    }

    .grid-container {
      height: calc(100% - 30px);
      overflow-y: scroll;
      overflow-x: hidden;

      .card-grid{
        width: 100%;
        height: 100%;
        margin: 5px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
    }
  }

  
</style>

<div class="tab-toolbar">
  <div></div>
</div>
<div class="layout-container">
  <div class="left-panel" class:fn__none={!showOrganize}>
    <div class="left-panel-toolbar"></div>
    <div class="organize-grid-container">
      <div class="organize-card-grid">
        {#each orgainizeBlocks as block, index (block)}
          <Card {app} {block} {index}></Card>
        {/each}
      </div>
    </div>
  </div>
  <div class="layout__resize--lr layout__resize" style="z-index: unset;" class:fn__none={!showOrganize}></div>
  <div class="right-panel">
    <div class="upper-show-place" class:fn__none={!showKeeper}>
      <div class="storage-grid-container">
        <div class="storage-card-grid">
          {#each storageBlocks as block, index (block.id)}
            <Card {app} {block} {index}></Card>
          {/each}
        </div>
      </div>
    </div>
    <div class="layout__resize" class:fn__none={!showKeeper}></div>
    <div class="lower-show-place">
      <div class="lower-show-place__toolbar">
        <button class="lower-show-place__toolbar-refresh b3-button b3-button--outline" on:click={totalRefreshLayout}>刷新</button>
      </div>
      <div class="grid-container">
        <div class="card-grid" id="card-grid">
          {#each searchBlocks as block, index (block)}
            <Card {app} {block} {index}></Card>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

