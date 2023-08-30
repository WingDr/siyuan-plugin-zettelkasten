<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      sql
  } from "@/api";
  import { STORAGE_NAME, isDev } from "@/utils/constants";
  import PluginZettelkasten from "@/index";
  import { ILogger, createLogger } from "@/utils/simple-logger";
  import { Protyle } from "siyuan";
  import Muuri from "muuri";
  import { sleep } from "@/utils/util";

  export let app;
  export let plugin: PluginZettelkasten;

  let logger: ILogger;
  let blocks: Block[] = [];

  let protyles: Protyle[] = [];
  let charactorObservers: {[id: string]: MutationObserver} = {};
  let childListObservers: {[id: string]: MutationObserver} = {};
  let grid: Muuri;

  onMount(async () => {
    logger = createLogger("card view");
    // plugin.eventBus.on("ws-main", refreshLayout.bind(grid))
    await waitForDatabase();
    await getAllBlocks();
    await produceProtyle();
    
    grid = new Muuri('.card-grid', {
      items: '.grid-item',
      dragEnabled: true,
      dragHandle: '.grid-item-title',
      dragStartPredicate: {
        distance: 10
      }
    });
  });

  onDestroy(async () => {
    // Object.keys(charactorObservers).forEach(id => {
    //   charactorObservers[id].disconnect();
    //   childListObservers[id].disconnect();
    // })
  });

  let waitForDatabase = async () => {
    const notebook = plugin.data[STORAGE_NAME].cardStorageNotebook;
    const cardsDir = plugin.data[STORAGE_NAME].cardStoragePath;
    let searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd'`);
    // 还没加载好，要等待
    while (!searchedBlocks || !searchedBlocks.length) {
      await sleep(300);
      searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd'`);  
    }
    return;
  }

  let getAllBlocks = async () => {
    const notebook = plugin.data[STORAGE_NAME].cardStorageNotebook;
    const cardsDir = plugin.data[STORAGE_NAME].cardStoragePath;
    blocks = [];
    let offset = 0;
    let limit = 64;
    let searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd' limit ${offset}, ${limit}`);
    while (searchedBlocks.length == limit) {
      blocks = [...blocks, ...searchedBlocks];
      offset += limit;
      searchedBlocks = await sql(`select * from blocks where box like '${notebook}' and hpath like '${cardsDir}/%' and type like 'd' limit ${offset}, ${limit}`)
    }
    console.log(searchedBlocks);
    blocks = [...blocks, ...searchedBlocks];
    return;
  }

  let produceProtyle = async () => {
    if (isDev) logger.info("查询到已有的块, blocks=>", blocks);
    const cardGrid = document.querySelector(".card-grid");
    blocks.forEach(block => {
      // const div = document.createElement("div");
      // cardGrid.insertAdjacentElement("beforeend", div);
      const target = cardGrid.querySelector(`div[data-node-id="${block.id}"]`).children[0] as HTMLDivElement;
      protyles.push(new Protyle(app, target, {
        blockId: block.id,
        render: {
          background: false,
          breadcrumb: false,
          breadcrumbDocName: false,
          scroll: false
        }
      }))
      // let observer = new MutationObserver(refreshLayout);
      // observer.observe(target, {characterData: true, subtree: true});
      // charactorObservers[block.id] = observer;
      // observer = new MutationObserver(refreshLayout);
      // observer.observe(target.querySelector('.protyle-wysiwyg'), {childList: true})
      // childListObservers[block.id] = observer;

    })
  }

  let refreshLayout = () => {
    grid.refreshItems()
    grid.layout(true)
  }
</script>

<style>
  .layout-container {
    width: 100%;
    height: 100%;
  }

  .card-grid{
    position: relative;
    width: 100%;
    height: 100%;
    margin: 5px;
    z-index: 0;
    transform-style: preserve-3d;
  }

  .grid-item {
    display: block;
    width: 30%;
    min-width: 300px;
    max-width: 500px;
    margin: 5px;
    position: absolute;
    z-index: 1;
    background-color: aqua;
    border: solid 0.2em black;
  }

  .protyle-container {
    border: solid 2px grey;
    border-radius: 4px;
    margin: 5px;
  }
</style>

<div class="layout-container">
  <div class="toobar">
    <button on:click={refreshLayout}></button>
  </div>
  <div class="card-grid">
    {#each blocks as block, index}
    <div class="grid-item">
      <div class="grid-item-title">{block.content}</div>
      <div class="protyle-container" data-node-id={block.id} data-block-index={index}>
        <div style="overflow-y: hidden;"></div>
      </div>
    </div>
    {/each}
  </div>
</div>

