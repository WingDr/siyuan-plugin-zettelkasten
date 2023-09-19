import { Dialog, openTab, openWindow } from "siyuan";
import PluginZettelkasten from "@/index";
import { ILogger, createLogger } from "@/utils/simple-logger";

import newCardDialog from "@/display/newCardDialog/newCardDialog.svelte";
import CardView from "@/display/cardView/cardView.svelte";
import CardDock from "@/display/cardDock/cardDock.svelte";
import NewCardWindow from "@/display/newCardWindow/newCardWindow.svelte";
import { isDev } from "@/utils/constants";
import { Card } from "@/cards/card";


export class DisplayManager {

  private logger: ILogger;
  private TAB_TYPE = "card_view_tab";
  private NEW_CARD_WINDOW_TYPE = "new_card_window";
  private DOCK_TYPE = "card_dock";
  private cardViewTabComponent: CardView;
  private cardDockComponent: CardDock;
  private newCardWindowComponent: NewCardWindow;

  constructor(private plugin: PluginZettelkasten) {
    this.logger = createLogger("display manager");
    // this.addCardDock();
    const _this = this;
    // 卡片视图tab
    this.plugin.addTab({
      type: this.TAB_TYPE,
      init() {
          _this.mountCardView(this.element);
      },
      destroy() {
          _this.cardViewTabComponent?.$destroy();
      }
    }); 
    // 新建卡片的全局窗口
    this.plugin.addTab({
      type: this.NEW_CARD_WINDOW_TYPE,
      async init() {
        if (!_this.plugin.isWindow) return
        // 新建卡片文件
        const card = new Card(_this.plugin);
        const blockID = await card.new();
        _this.newCardWindowComponent = new NewCardWindow({
            target: this.element,
            props: {
                plugin: _this.plugin,
                blockID
            }
        });
        await card.rename();
        _this.plugin.onunload = async () => {
          await card.closeEdit();
        }
      },
      async beforeDestroy() {
          _this.newCardWindowComponent?.$destroy();
      }
    });
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
          plugin: this.plugin
      }
    });
    create.$on("close", () => {
      dialog.destroy()
    })
  }

  public async openNewCardWindow() {
    if (this.plugin.isWindow) return;
    const tabOption = {
      icon: "iconCardBox",
      title: "新建卡片",
      data: {},
      id: this.plugin.name + this.NEW_CARD_WINDOW_TYPE
    };
    const tab = openTab({
      app: this.plugin.app,
      custom: tabOption,
      removeCurrentTab: false
    })
    if (isDev) this.logger.info("Open tab, results=>", {tabOption, tab})

    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    openWindow({
      height: screenHeight * 0.3,
      width: screenWidth * 0.3,
      tab
    })
  }

  public addCardDock() {
    const _this = this;
    this.plugin.addDock({
      config: {
        position: "RightTop",
        size: {width: 300, height: 0},
        icon: "iconSaving",
        title: "卡片笔记"
      },
      data: {
        app: this.plugin.app,
        plugin: this.plugin
      },
      type: this.DOCK_TYPE,
      init() {
          _this.cardDockComponent = new CardDock({
            target: this.element,
            props: {
              app: this.data.app,
              plugin: this.data.plugin
            }
          });
      },
      destroy() {
          _this.cardDockComponent?.$destroy();
      },
    })
  }

  public openCardViewTab() {
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
      removeCurrentTab: false
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