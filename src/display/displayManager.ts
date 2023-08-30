import { Dialog, IModel, openTab } from "siyuan";
import PluginZettelkasten from "@/index";
import { ILogger, createLogger } from "@/utils/simple-logger";

import newCardDialog from "@/display/newCardDialog/newCardDialog.svelte"
import CardView from "@/display/cardView/cardView.svelte"
import { isDev } from "@/utils/constants";


export class DisplayManager {

  private logger: ILogger;
  private TAB_TYPE = "card_view_tab";
  private cardViewTabComponent: CardView;
  private cardView;

  constructor(private plugin: PluginZettelkasten) {
    this.logger = createLogger("display manager");
  }

  public openNewCardDialog() {
    const dialog = new Dialog({
      title: "新建卡片",
      content: `<div id="newCardDialog" class="b3-dialog__content protyle-container" style="padding-bottom:5px"></div>`,
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
    create.$on("close", () => {
      dialog.destroy()
    })
  }

  public openCardViewTab() {
    const _this = this;
    if (!this.cardView) {
      this.cardView = this.plugin.addTab({
        type: this.TAB_TYPE,
        init() {
            _this.mountCardView(this.element);
        },
        destroy() {
            _this.cardViewTabComponent?.$destroy();
        }
      }); 
    }
    const tabOption = {
      icon: "iconCardBox",
      title: "卡片视图",
      data: {
          text: "This is my custom tab",
      },
      id: this.plugin.name + this.TAB_TYPE
    };
    const tab = openTab({
      app: this.plugin.app,
      custom: tabOption,
    });
    if (isDev) this.logger.info("Open tab, results=>", {tabOption, tab})
  }

  private mountCardView(element: HTMLElement) {
    this.cardViewTabComponent = new CardView({
        target: element,
        props: {
            app: this.plugin.app,
            plugin: this.plugin
        }
    });
  }

}