<script lang="ts">
  import { Protyle } from "siyuan";
  import {onDestroy, onMount} from "svelte";

  export let app;
  export let block:Block;

  let menuOpen = false;
  let protyle: Protyle;
  let protyleTarget;

  onMount(async () => {
    protyle = new Protyle(app, protyleTarget, {
        blockId: block.id,
        render: {
          background: false,
          breadcrumb: false,
          breadcrumbDocName: false,
          scroll: false
        }
      })
  })

  onDestroy(() => {
    protyle.destroy();
  })

  let getTimeFromID = (id: string) => {
    const year = id.slice(0, 4);
    const month = id.slice(4, 6);
    const day = id.slice(6, 8);
    const hour = id.slice(8, 10);
    const minute = id.slice(10, 12);
    const second = id.slice(12, 14);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  let openMenu = () => {menuOpen = true;}
  let closeMenu = () => {menuOpen = false;}
</script>

<style lang="scss">
  .grid-item {
    position: relative;
    border: solid 0.1em gray;
    overflow: hidden;

    .grid-item__move-handler {
        opacity: 0;
    }

    .grid-item__move-handler:hover {
        opacity: 1;
    }

    .grid-item-title {
      left: 10px;
      z-index: 1;
      cursor: move;
    }

    .grid-item-menu {
      position: absolute;
      right: 10px;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: end;

      .grid-item__submenu {
        display: flex;
        flex-direction: column;
        padding: 0px !important;
      }

      .grid-item__submenu-item:hover {
        background-color: var(--b3-list-background);
      }
    }
  }
</style>

<div class="grid-item" data-node-id={block.id}>
  <div class="grid-item__move-handler">
    move
  </div>
  <div class="grid-item-title">{getTimeFromID(block.id)}</div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="grid-item-menu" on:mouseenter={openMenu} on:mouseleave={closeMenu}>
    <button class="block__icon block__icon--show fn__flex-end">
      <svg><use xlink:href="#iconMore"></use></svg>
    </button>
    <div class="b3-menu">
      <div class="b3-menu__items grid-item__submenu" class:fn__none={!menuOpen}>
        <button class="b3-menu__item grid-item__submenu-item"><span class="b3-menu__label">菜单1</span></button>
        <button class="b3-menu__item grid-item__submenu-item"><span class="b3-menu__label">菜单2</span></button>
        <button class="b3-menu__item grid-item__submenu-item"><span class="b3-menu__label">菜单3</span></button>
      </div>
    </div>
  </div>
  <div class="protyle-container" data-node-id={block.id}>
    <div style="overflow-y: hidden;" bind:this={protyleTarget}></div>
  </div>
</div>