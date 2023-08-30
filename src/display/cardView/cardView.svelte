<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      sql
  } from "@/api";
  import { STORAGE_NAME, isDev } from "@/utils/constants";
  import PluginZettelkasten from "@/index";
  import { ILogger, createLogger } from "@/utils/simple-logger";
  import { Protyle } from "siyuan";
  import Packery from "packery"
  import Draggabilly from "draggabilly"

  export let app;
  export let plugin: PluginZettelkasten;

  let logger: ILogger;
  let blocks: Block[] = [];

  let protyles: Protyle[] = [];
  let gridBlockItems: {[id: string]: HTMLDivElement} = {};
  let charactorObservers: {[id: string]: MutationObserver} = {};
  let childListObservers: {[id: string]: MutationObserver} = {};
  let grid: Packery;

  onMount(async () => {
    logger = createLogger("card view");
    await getAllBlocks();
    await produceProtyle();
    buildGrid();
    
  });

  onDestroy(async () => {
    Object.keys(charactorObservers).forEach(id => {
      charactorObservers[id].disconnect();
      childListObservers[id].disconnect();
      delete charactorObservers[id]
      delete childListObservers[id]
    })
  });

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
      const target = cardGrid.querySelector(`.protyle-container[data-node-id="${block.id}"]`).children[0] as HTMLDivElement;
      protyles.push(new Protyle(app, target, {
        blockId: block.id,
        render: {
          background: false,
          breadcrumb: false,
          breadcrumbDocName: false,
          scroll: false
        }
      }))
      gridBlockItems[block.id] = target.parentElement.parentElement as HTMLDivElement;
      let observer = new MutationObserver(handleObserve);
      observer.observe(target, {characterData: true, subtree: true});
      (observer as any).gridBlockItem = gridBlockItems[block.id];
      charactorObservers[block.id] = observer;
      observer = new MutationObserver(handleObserve);
      observer.observe(target.querySelector('.protyle-wysiwyg'), {childList: true});
      (observer as any).gridBlockItem = gridBlockItems[block.id];
      childListObservers[block.id] = observer;

    })
  }

  let buildGrid = () => {
    grid = new Packery('.card-grid', {
      itemSelector: '.grid-item',
      gutter: 20,
      columnwidth: ".grid-item",
      resize: true,
      transitionDuration: 0
    })
    grid.getItemElements().forEach( function( itemElem ) {
      var draggie = new Draggabilly( itemElem, {
        handle: ".grid-item-title"
      } );
      grid.bindDraggabillyEvents( draggie );
    });
    grid.on("dragItemPositioned", grid.layout);
  }

  let refreshItemWidth = () => {

  }

  let handleObserve:MutationCallback = () => {
    // refreshBlockTools(gridBlockItem);
    refreshLayout();
  }

  let refreshLayout = () => {
    grid.shiftLayout()
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
  }

  .grid-item {
    display: block;
    width: 30%;
    min-width: 300px;
    max-width: 500px;
    position: absolute;
    z-index: 1;
    background-color: var(--b3-theme-primary);
    border: solid 0.2em black;
    border-radius: 5px;
  }

  .protyle-container {
    border-radius: 4px;
  }
</style>

<div class="layout-container">
  <div class="toobar">
    <button on:click={refreshLayout}></button>
  </div>
  <div class="card-grid">
    {#each blocks as block, index}
    <div class="grid-item" data-node-id={block.id}>
      <div class="grid-item-title">{block.content}</div>
      <div class="protyle-container" data-node-id={block.id} data-block-index={index}>
        <div style="overflow-y: hidden;"></div>
      </div>
    </div>
    {/each}
  </div>
</div>

