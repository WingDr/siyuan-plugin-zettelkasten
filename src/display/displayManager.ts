import { Dialog, IModel, openTab } from "siyuan";
import PluginZettelkasten from "@/index";
import { ILogger, createLogger } from "@/utils/simple-logger";

import newCardDialog from "@/display/newCardDialog/newCardDialog.svelte"
import cardView from "@/display/cardView/cardView.svelte"
import { isDev } from "@/utils/constants";


export class DisplayManager {

  private logger: ILogger;
  private cardViewTab: () => IModel;

  constructor(private plugin: PluginZettelkasten) {
    this.logger = createLogger("display manager");
    this.initailizeCardViewTab();

  }

  public openNewCardDialog() {
    let dialog = new Dialog({
      title: "新建卡片",
      content: `<div id="newCardDialog" class="b3-dialog__content protyle-container"></div>`,
      width: this.plugin.isMobile ? "92vw" : "720px",
      destroyCallback() {
          return create.$destroy();
      },
    });
    const create = new newCardDialog({
      target: dialog.element.querySelector("#newCardDialog"),
      props: {
          app: this.plugin.app,
      }
    });
  }

  public openCardViewTab() {
    const tabOption = {
      icon: "iconCardBox",
      title: "卡片视图",
      data: {
          text: "This is my custom tab",
      },
      fn: this.cardViewTab
    };
    const tab = openTab({
      app: this.plugin.app,
      custom: tabOption,
    });
    if (isDev) this.logger.info("Open tab, results=>", {tabOption, tab})
  }

  private initailizeCardViewTab() {
    const TAB_TYPE = "card_view_tab"
    let tabDiv = document.createElement("div");
    tabDiv.className = "protyle-container"
    const cardViewTab = new cardView({
        target: tabDiv,
        props: {
            app: this.plugin.app,
        }
    });
    this.cardViewTab = this.plugin.addTab({
        type: TAB_TYPE,
        init() {
            this.element.appendChild(tabDiv);
            console.log(this.element);
        },
        beforeDestroy() {
            console.log("before destroy tab:", TAB_TYPE);
        },
        destroy() {
            console.log("destroy tab:", TAB_TYPE);
            cardViewTab.$destroy();
        }
    });
  }

}