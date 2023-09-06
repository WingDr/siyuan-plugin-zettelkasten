<script lang="ts">
  import PluginZettelkasten from "@/index";


  export let app;
  export let plugin:PluginZettelkasten;

  let inputCardContent  = ""




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
}

</style>

<div class="card-dock">
  <div class="card-dock__quick-input">
    <textarea
        class="b3-text-field fn__block card-dock__quick-input-textarea"
        style="resize: none;"
        rows="8"
        placeholder="input markdown to quick create a card"
        bind:value={inputCardContent}
    />
  </div>
  <div class="card-dock__item-container">

  </div>
</div>