import { Dialog, ITabModel, openTab, openWindow } from "siyuan";
import PluginZettelkasten from "@/index";
import { ILogger, createLogger } from "@/utils/simple-logger";

import newCardDialog from "@/display/newCardDialog/newCardDialog.svelte";
import CardView from "@/display/cardView/cardView.svelte";
import CardDock from "@/display/cardDock/cardDock.svelte";
import NewCardWindow from "@/display/newCardWindow/newCardWindow.svelte";
import { isDev, STORAGE_NAME } from "@/utils/constants";
import { createDocWithMd, getBlockByID, renameDoc, removeDoc } from "@/api";
import { sleep } from "@/utils/util";


export class DisplayManager {

  private logger: ILogger;
  private TAB_TYPE = "card_view_tab";
  private NEW_CARD_WINDOW_TYPE = "new_card_window";
  private DOCK_TYPE = "card_dock";
  private cardViewTabComponent: CardView;
  private cardView;
  private cardDockComponent: CardDock;
  private newCardWindowComponent: NewCardWindow;
  private newCardWindow: () => ITabModel;

  constructor(private plugin: PluginZettelkasten) {
    this.logger = createLogger("display manager");
    this.addCardDock();
    const _this = this;
    this.cardView = this.plugin.addTab({
      type: this.TAB_TYPE,
      init() {
          _this.mountCardView(this.element);
      },
      destroy() {
          _this.cardViewTabComponent?.$destroy();
      }
    }); 
    this.newCardWindow = this.plugin.addTab({
      type: this.NEW_CARD_WINDOW_TYPE,
      init() {
          _this.newCardWindowComponent = new NewCardWindow({
              target: this.element,
              props: {
                  app: _this.plugin.app,
                  plugin: _this.plugin
              }
          });
      },
      async destroy() {
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
      tab,
      doc: {id: null}
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