<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { 
      sql
  } from "@/api";
  import { STORAGE_NAME, isDev } from "@/utils/constants";
  import PluginZettelkasten from "@/index";
  import { ILogger, createLogger } from "@/utils/simple-logger";
  import { Protyle } from "siyuan";
  import "dragula/dist/dragula.css"
  import { sleep } from "@/utils/util";
  import { EasyGrid } from "@/display/cardView/buildGrid"

  export let app;
  export let plugin: PluginZettelkasten;

  let logger: ILogger;
  let blocks: Block[] = [];
  let showOrganize: boolean = true;
  let showKeeper: boolean = false;

  let protyles: Protyle[] = [];
  let grid: EasyGrid;

  onMount(async () => {
    logger = createLogger("card view");
    await getAllBlocks();
    await produceProtyle();
    buildGrid();
    await totalRefreshLayout();
  });

  onDestroy(async () => {
    window.removeEventListener("resize", grid.layout)
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

    })
  }

  let buildGrid = () => {
    grid = new EasyGrid({
      containerSelector: ".card-grid",
      orgainizerSelector: ".organize-card-grid",
      storagerSelector: ".storage-grid-container",
      itemSelector: ".grid-item",
      columnClass: "grid-column",
      minWidth: 300,
      maxWidth: 500
    })
    window.addEventListener("resize", totalRefreshLayout.bind(grid));
  }

  let totalRefreshLayout = async () => {
    await sleep(200);
    if (isDev) logger.info("完全刷新排布")
    grid.refreshItems();
    grid.layout()
  }

  let getTimeFromID = (id: string) => {
    const year = id.slice(0, 4);
    const month = id.slice(4, 6);
    const day = id.slice(6, 8);
    const hour = id.slice(8, 10);
    const minute = id.slice(10, 12);
    const second = id.slice(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
</script>

<style lang="scss">
  .layout-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .left-panel {
    width: 50%;
    height: 100%;
    z-index: 0;

    .organize-grid-container {
      height: 100%;
      overflow-y: scroll;
      overflow-x: hidden;

      .organize-card-grid {
        height: 100%;

        .grid-item {
          position: relative;
          z-index: 1;
          border: solid 0.1em gray;
          overflow: hidden;

          .grid-item-title {
            left: 5px;
            z-index: 4;
          }
        }
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
        z-index: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        .grid-item {
          position: relative;
          margin: 10px auto;
          z-index: 1;
          border: solid 0.2em gray;
          border-radius: 10px;

          .grid-item-title {
            position: absolute;
            left: 5px;
            z-index: 4;
          }

          .protyle-container {
            border-radius: 10px;
            overflow: hidden;
          }
        }
      }
    }
  }

  
</style>

<div class="layout-container">
  <div class="left-panel" class:fn__none={!showOrganize}>
    <div class="left-panel-toolbar"></div>
    <div class="organize-grid-container">
      <div class="organize-card-grid"></div>
    </div>
  </div>
  <div class="right-panel">
    <div class="upper-show-place" class:fn__none={!showKeeper}>
      <div class="storage-grid-container">
        <div class="storage-card-grid"></div>
      </div>
    </div>
    <div class="lower-show-place">
      <div class="lower-show-place__toolbar">
        <button class="lower-show-place__toolbar-refresh b3-button b3-button--outline" on:click={totalRefreshLayout}>刷新</button>
      </div>
      <div class="grid-container">
        <div class="card-grid" id="card-grid">
          {#each blocks as block, index}
          <div class="grid-item" data-node-id={block.id}>
            <div class="grid-item-title">{getTimeFromID(block.id)}</div>
            <div class="protyle-container" data-node-id={block.id} data-block-index={index}>
              <div style="overflow-y: hidden;"></div>
            </div>
          </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

