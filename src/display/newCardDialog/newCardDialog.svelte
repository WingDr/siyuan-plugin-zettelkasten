<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { 
        // sql as query, 
        createDocWithMd, removeDoc,
        getBlockByID,
        renameDoc
    } from "@/api";
    import { Protyle } from "siyuan";
    import { STORAGE_NAME } from "@/utils/constants";
    import PluginZettelkasten from "@/index";

    export let app;
    export let plugin: PluginZettelkasten;

    let dispather = createEventDispatcher();

    let divProtyle: HTMLDivElement;
    let protyle: Protyle;
    let blockID: string = '';
    let notebook: string;
    let save = false;

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
    });

    onDestroy(async () => {
        if (!save) {
            const block = await getBlockByID(blockID);
            await removeDoc(notebook, block.path);
        }
        protyle.destroy();
    });

    async function initProtyle() {
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

    let cancel = async () => {
        dispather("close");
    }

    let confirm = async () => {
        const block = await getBlockByID(blockID);
        await renameDoc(block.box, block.path, blockID);
        save = true;
        dispather("close");
    }
</script>

<!-- <div>API demo:</div>
<div class="fn__hr" />
<div class="plugin-sample__time">
    System current time: <span id="time">{time}</span>
</div>
<div class="fn__hr" />
<div class="fn__hr" />
<div>Protyle demo: id = {blockID}</div>
<div class="fn__hr" /> -->
<div id="protyle" style="height: 360px;" bind:this={divProtyle}/>
<div class="b3-dialog__action" id="zettelkasten-new-card-dialog__form-action" style="max-height: 40px; padding: 0px; padding-top: 5px">
    <button class="b3-button b3-button--cancel" on:click={cancel}>取消</button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--text" on:click={confirm}>保存</button>
</div>
