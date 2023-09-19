<script lang="ts">
  import PluginZettelkasten from "@/index";
  import Card from "./card.svelte"
  import { onMount } from "svelte";
  import { sql } from "@/utils/api";
  import { STORAGE_NAME } from "@/utils/constants";


  export let app;
  export let plugin:PluginZettelkasten;

  let inputCardContent  = ""
  let showMarkdownQuickadd = false;
  let searchBlocks:Block[] = [];

  onMount(async () => {
    await plugin.loadData(STORAGE_NAME)
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
    console.log(searchBlocks)
    return;
  })


</script>

<style lang="scss">

.card-dock {
  &__quick-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0px;
  }

  &__quick-input-textarea {
    padding: 20px;
    width: 90%;
  }

  &__item-container {
    margin: 0px 5px;
  }
}

</style>

<div class="card-dock">
  <div class="card-dock__search"></div>
  <div class="card-dock__toolbar"></div>
  <div class="card-dock__quick-input" class:fn__none={showMarkdownQuickadd}>
    <textarea
        class="b3-text-field fn__block card-dock__quick-input-textarea"
        style="resize: none;"
        rows="8"
        placeholder="input markdown to quick create a card"
        bind:value={inputCardContent}
    />
  </div>
  <div class="card-dock__item-container">
    {#each searchBlocks as block}
      <Card {app} {block}></Card>
    {/each}
  </div>
</div>