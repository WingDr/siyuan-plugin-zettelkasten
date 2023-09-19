<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { confirm } from "siyuan";

  import SiYuanPluginCitation from "../../index";
  import {
    STORAGE_NAME,
    hiddenNotebook,
    databaseType,
    defaultTitleTemplate,
    defaultNoteTemplate,
    defaultLinkTemplate,
    defaultCardStoragePath,
    isDev,
    dataDir,
    defaultDBPassword,
    dbSearchDialogTypes
  } from "../../utils/constants";
  import { type ILogger } from "../../utils/simple-logger";

  import { ItemType, type IOptions } from "./item/item";

  import Panels from "./panel/Panels.svelte";
  import Panel from "./panel/Panel.svelte";
  import Tabs from "./tab/Tabs.svelte";
  import Item from "./item/Item.svelte";
  import Input from "./item/Input.svelte";
  import type { IPanel, ITab } from "./tab";
  import { lsNotebooks } from "@/utils/api";

  export let plugin: SiYuanPluginCitation;
  export let logger: ILogger;

  // 显示数据
  const eMail = "siyuan_citation@126.com";
  const issuesURL = "https://github.com/WingDr/siyuan-plugin-zettelkasten/issues";
  let pluginVersion: string;
  let notebookOptions: IOptions;
  let databaseOptions: IOptions;
  let dbSearchDialogOptions: IOptions;

  // 设定数据
  // 基本设定变量
  let cardStorageNotebook: string;
  let cardStoragePath: string;
  let database: string;
  let useItemKey: boolean;
  let autoReplace: boolean;
  let deleteUserDataWithoutConfirm: boolean;
  // 思源模板设定变量
  let titleTemplate: string;
  let noteTemplate: string;
  let linkTemplate: string;
  let customCiteText: boolean;
  let useDynamicRefLink: boolean;
  let nameTemplate: string;
  // Zotero模板设定变量
  let zoteroLinkTitleTemplate: string;
  let zoteroTagTemplate: string;
  // debug-bridge变量
  let dbPassword: string;
  let dbSearchDialogType: string;

  // 设定数据的默认值
  let defaultSettingData;

  let panel_focus_key = 1;
  const panels: IPanel[] = [
    {
      key: 1,
      text: plugin.i18n.settingTab.basic.title,
      name: "citation-setting-basic",
      icon: "#iconSettings",
    },
    // {
    //   key: 2,
    //   text: plugin.i18n.settingTab.templates.title,
    //   name: "citation-setting-templates",
    //   icon: "#iconEdit",
    // },
    // {
    //   key: 3,
    //   text: plugin.i18n.settingTab.debug_bridge.title,
    //   name: "citation-setting-debug-bridge",
    //   icon: "#iconPlugin",
    // },
  ];
  let displayPanels: ITab[] = [];
  let template_tab_focus_key = 1;
  let template_tabs = [
    {
      key: 1,
      text: plugin.i18n.settingTab.templates.siyuan.title,
      name: "citation-setting-template-siyuan",
      icon: "",
    },
    {
      key: 2,
      text: plugin.i18n.settingTab.templates.zotero.title,
      name: "citation-setting-template-zotero",
      icon: "",
    },
  ];

  $: isDebugBridge = _checkDebugBridge(database);

  const dispatcher = createEventDispatcher();

  function generatePanels(panels: any[]) {
    return panels.reduce((acc, panel) => {
      if (
        !panel.supportDatabase ||
        panel.supportDatabase.indexOf(database) != -1
      ) {
        return [
          ...acc,
          {
            key: panel.key,
            text: panel.text,
            name: panel.name,
            icon: panel.icon,
          },
        ];
      } else {
        return acc;
      }
    }, []);
  }

  async function initializeData() {
    // 数据提前处理
    // 笔记本选择选项
    const notebooksRequest = await lsNotebooks();
    const data = notebooksRequest;
    let notebooks = data.notebooks ?? [];
    // 没有必要把所有笔记本都列出来
    notebooks = notebooks.filter(
      (notebook) => !notebook.closed && !hiddenNotebook.has(notebook.name)
    );
    notebookOptions = notebooks.map((notebook) => {
      return {
        key: notebook.id,
        text: notebook.name,
      };
    });
    // 数据库类型选项
    databaseOptions = databaseType.map((database) => {
      return {
        key: database,
        text: database,
      };
    });
    // 搜索面板类型选项
    dbSearchDialogOptions = dbSearchDialogTypes.map((type) => {
      return {
        key: type,
        text: type
      }
    })

    // 设置默认数据
    defaultSettingData = {
      cardStorageNotebook: notebooks[0].id,
      cardStoragePath: defaultCardStoragePath,
      database: databaseType[0],
      titleTemplate: defaultTitleTemplate,
      noteTemplate: defaultNoteTemplate,
      linkTemplate: defaultLinkTemplate,
      nameTemplate: "",
      customCiteText: false,
      useItemKey: false,
      autoReplace: false,
      deleteUserDataWithoutConfirm: false,
      useDynamicRefLink: false,
      zoteroLinkTitleTemplate: "",
      zoteroTagTemplate: "",
      dbPassword: defaultDBPassword,
      dbSearchDialogType: dbSearchDialogTypes[0]
    }
    // 默认笔记本为第一个打开的笔记本
    cardStorageNotebook = plugin.data[STORAGE_NAME]?.cardStorageNotebook ?? defaultSettingData.cardStorageNotebook;
    // 默认文献库路径为"/References/"
    cardStoragePath = plugin.data[STORAGE_NAME]?.cardStoragePath ?? defaultSettingData.cardStoragePath;
    // 使用itemKey默认关闭
    useItemKey = plugin.data[STORAGE_NAME]?.useItemKey ?? defaultSettingData.useItemKey;
    // 默认会自动替换zotero链接
    autoReplace = plugin.data[STORAGE_NAME]?.autoReplace ?? defaultSettingData.autoReplace;
    // 默认在删除用户数据时会弹出提示
    deleteUserDataWithoutConfirm = plugin.data[STORAGE_NAME]?.deleteUserDataWithoutConfirm ?? defaultSettingData.deleteUserDataWithoutConfirm;
    // 数据库类型默认为第一种
    database = plugin.data[STORAGE_NAME]?.database ?? defaultSettingData.database;
    // 默认标题模板
    titleTemplate = plugin.data[STORAGE_NAME]?.titleTemplate ?? defaultSettingData.titleTemplate;
    // 默认文献内容模板
    noteTemplate = plugin.data[STORAGE_NAME]?.noteTemplate ?? defaultSettingData.noteTemplate;
    // 默认不开启自定义引用
    customCiteText = plugin.data[STORAGE_NAME]?.customCiteText ?? defaultSettingData.customCiteText;
    // 默认使用静态锚文本（不使用动态锚文本）
    useDynamicRefLink = plugin.data[STORAGE_NAME]?.useDynamicRefLink ?? defaultSettingData.useDynamicRefLink;
    // 默认不更新命名
    nameTemplate = plugin.data[STORAGE_NAME]?.nameTemplate ?? defaultSettingData.nameTemplate;
    // 默认引用链接模板
    linkTemplate = plugin.data[STORAGE_NAME]?.linkTemplate ?? defaultSettingData.linkTemplate;
    // 默认Zotero链接标题模板
    zoteroLinkTitleTemplate = plugin.data[STORAGE_NAME]?.zoteroLinkTitleTemplate ?? defaultSettingData.zoteroLinkTitleTemplate;
    // 默认Zotero标签模板
    zoteroTagTemplate = plugin.data[STORAGE_NAME]?.zoteroTagTemplate ?? defaultSettingData.zoteroTagTemplate;
    // 默认debug-bridge密码
    dbPassword = plugin.data[STORAGE_NAME]?.dbPassword ?? defaultSettingData.dbPassword;
    // 默认搜索面板类型
    dbSearchDialogType = plugin.data[STORAGE_NAME]?.dbSearchDialogType ?? defaultSettingData.dbSearchDialogType;

    displayPanels = generatePanels(panels);
  }

  function _checkDebugBridge(dtype): boolean {
    if (["Zotero (debug-bridge)", "Juris-M (debug-bridge)"].indexOf(dtype) != -1) return true;
    else return false;
  }

  onMount(async () => {
    const fs = window.require("fs");
    const path = window.require("path");
    const file = JSON.parse(
      await fs.readFileSync(
        path.join(dataDir, "./plugins/siyuan-plugin-zettelkasten/plugin.json")
      )
    );
    pluginVersion = file.version;

    await initializeData();
  });

  onDestroy(() => {
    if (isDev) logger.info("关闭设置界面");
    const settingData = {
      cardStorageNotebook,
      cardStoragePath,
      database,
      titleTemplate,
      noteTemplate,
      linkTemplate,
      nameTemplate,
      customCiteText,
      useItemKey,
      autoReplace,
      deleteUserDataWithoutConfirm,
      useDynamicRefLink,
      zoteroLinkTitleTemplate,
      zoteroTagTemplate,
      dbPassword,
      dbSearchDialogType
    };
    plugin.data[STORAGE_NAME] = settingData;
    plugin.saveData(STORAGE_NAME, settingData).then(() => {
      if (isDev) logger.info("数据保存成功, settingData=>", settingData);
    });
  });
</script>

<Panels panels={displayPanels} focus={panel_focus_key} let:focus={panel_focus}>
  <Panel display={panels[0].key === panel_focus}>
    <Item>
      <h4 slot="title">
        {plugin.i18n.settingTab.settingTabTitle.replace(
          "${version}",
          pluginVersion
        )}
      </h4>
      <span slot="text">
        {@html plugin.i18n.settingTab.settingTabDescription
          .replaceAll("${e-mail}", eMail)
          .replace("${issuesURL}", issuesURL)}
      </span>
    </Item>

    <!-- 选择笔记本 -->
    <Item
      block={false}
      title={plugin.i18n.settingTab.basic.notebookSelectorTitle}
      text={plugin.i18n.settingTab.basic.databaseSelectorDescription}
    >
      <Input
        slot="input"
        block={false}
        normal={true}
        type={ItemType.select}
        settingKey="Select"
        settingValue={cardStorageNotebook}
        options={notebookOptions}
        on:changed={(event) => {
          if (isDev)
            logger.info(
              `Select changed: ${event.detail.key} = ${event.detail.value}`
            );
          cardStorageNotebook = event.detail.value;
        }}
      />
    </Item>

    <!-- 设置文献库路径 -->
    <Item
      block={false}
      title={plugin.i18n.settingTab.basic.cardStoragePathInputTitle}
      text={plugin.i18n.settingTab.basic.cardStoragePathInputDescription}
    >
      <Input
        slot="input"
        block={false}
        normal={true}
        type={ItemType.text}
        settingKey="Text"
        settingValue={cardStoragePath}
        placeholder="Input the path"
        on:changed={(event) => {
          if (isDev)
            logger.info(
              `Input changed: ${event.detail.key} = ${event.detail.value}`
            );
          cardStoragePath = event.detail.value;
        }}
      />
    </Item>

    <!-- 删除数据 -->
    <Item
      block={false}
      title={plugin.i18n.settingTab.basic.deleteDataBtnTitle}
      text={plugin.i18n.settingTab.basic.deleteDataBtnDescription}
    >
      <Input
        slot="input"
        block={false}
        normal={true}
        type={ItemType.button}
        settingKey="Button"
        settingValue={plugin.i18n.settingTab.basic.deleteDataBtnText}
        on:clicked={() => {
          if (isDev) logger.info("Button clicked");
          confirm(
            "⚠️",
            plugin.i18n.settingTab.basic.confirmRemove.replace(
              "${name}",
              plugin.name
            ),
            () => {
              plugin.removeData(STORAGE_NAME).then(async () => {
                await initializeData()
                plugin.data[STORAGE_NAME] = defaultSettingData;
                plugin.noticer.info(`[${plugin.name}]: ${plugin.i18n.removedData}`);
              });
            }
          );
        }}
      />
    </Item>
  </Panel>
  
</Panels>
