<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Protyle } from "siyuan";
    import PluginZettelkasten from "@/index";
  import {Card} from "@/cards/card";

    export let app;
    export let plugin: PluginZettelkasten;

    // let dispather = createEventDispatcher();

    let divProtyle: HTMLDivElement;
    let protyle: Protyle;
    let blockID: string = '';
    let card: Card;

    onMount(async () => {
        protyle = await initProtyle();
        // 聚焦contenteditable，参考https://blog.csdn.net/weixin_38099055/article/details/108483748
        const focusNode = document.querySelector('div.b3-dialog--open .protyle div[contenteditable]');
        const range = document.createRange();
        range.selectNodeContents(focusNode);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        await card.rename();
    });

    onDestroy(async () => {
        card.closeEdit();
        protyle.destroy();
    });

    async function initProtyle() {
        card = new Card(plugin);
        blockID = await card.new();
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
