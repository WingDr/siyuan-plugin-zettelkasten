import { STORAGE_NAME } from "@/utils/constants";
import PluginZettelkasten from "..";
import { createDocWithMd, getBlockByID, removeDoc, renameDoc } from "@/utils/api";
import { checkEmptyDoc, sleep } from "@/utils/util";
import { ILogger, createLogger } from "@/utils/simple-logger";

export class Card {
  private notebook: string;
  private cardsDir: string;
  private blockID: string;
  private block: Block;
  private logger: ILogger;

  constructor(private plugin: PluginZettelkasten) {
    this.logger = createLogger("card");
  }

  public async new(): Promise<string> {
    await this.plugin.loadData(STORAGE_NAME);
    this.notebook = this.plugin.data[STORAGE_NAME].cardStorageNotebook;
    this.cardsDir = this.plugin.data[STORAGE_NAME].cardStoragePath;
    const time = Date.now();
    this.blockID = await createDocWithMd(this.notebook, `${this.cardsDir}/${time.toString()}`, "")
    this.logger.info("新建卡片")
    return this.blockID;
  }

  public async rename() {
    if (!this.block) await this.waitForBlock();
    return await renameDoc(this.block.box, this.block.path, this.block.id);
  }

  public async delete() {
    if (!this.block) await this.waitForBlock();
    this.logger.info("获取到块，进行删除操作")
    return await removeDoc(this.block.box, this.block.path)
  }

  public async closeEdit(root: HTMLElement) {
    this.logger.info("获得protyle根节点, protyle=>", root)
    const isEmpty = await checkEmptyDoc(root);
    if (isEmpty) {
      this.logger.info("检测到为空文档");
      return await this.delete()
    }
  }

  private async waitForBlock(): Promise<Block> {
    let block = await getBlockByID(this.blockID);
    while (!block) {
      this.logger.info("未获取到块："+ this.blockID);
      block = await getBlockByID(this.blockID);
      sleep(200);
    }
    this.block = block;
    this.logger.info("获取到块："+ this.block);
    return block;
  }

}