import { Dialog } from "siyuan";

import { createLogger, type ILogger } from "../../utils/simple-logger";
import type SiYuanPluginCitation from "../../index";
import ExampleComponent from "./settingTabComponent.svelte";
import { isDev } from "../../utils/constants";

export class SettingTab {
  private logger: ILogger;

  constructor(private plugin: SiYuanPluginCitation) {
    this.logger = createLogger("setting tab");
  }

  public openSetting() {
    const id = `dialog-setting-${Date.now()}`;
    const settingTab = new Dialog({
      content: `<div id="${id}" class="b3-dialog__body"/>`,
      width: this.plugin.isMobile ? "92vw" : "850px",
      height: "70vh",
      destroyCallback: () => { component?.$destroy(); }
    });

    const component = new ExampleComponent({
      target: settingTab.element.querySelector(`#${id}`),
      props: {
        plugin: this.plugin,
        logger: this.logger
      }
    });

    component.$on("confirm", ()=> {
      settingTab.destroy();
    });

  }
}