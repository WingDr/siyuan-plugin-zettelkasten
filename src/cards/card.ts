import { STORAGE_NAME } from "@/utils/constants";
import PluginZettelkasten from "..";
import { createDocWithMd, getBlockByID, removeDoc, renameDoc } from "@/api";
import { checkEmptyDoc, sleep } from "@/utils/util";

export class Card {
  private notebook: string;
  private cardsDir: string;
  private blockID: string;
  private block: Block;

  constructor(private plugin: PluginZettelkasten) {}

  public async new(): Promise<string> {
    await this.plugin.loadData(STORAGE_NAME);
    this.notebook = this.plugin.data[STORAGE_NAME].cardStorageNotebook;
    this.cardsDir = this.plugin.data[STORAGE_NAME].cardStoragePath;
    const time = Date.now();
    this.blockID = await createDocWithMd(this.notebook, `${this.cardsDir}/${time.toString()}`, "")
    return this.blockID;
  }

  public async rename() {
    if (!this.block) await this.waitForBlock();
    return await renameDoc(this.block.box, this.block.path, this.block.id);
  }

  public async delete() {
    if (!this.block) await this.waitForBlock();
    return await removeDoc(this.block.box, this.block.path)
  }

  public async closeEdit() {
    const isEmpty = await checkEmptyDoc(this.blockID);
    if (isEmpty) {
      return await this.delete()
    }
  }

  private async waitForBlock(): Promise<Block> {
    let block = await getBlockByID(this.blockID);
    while (!block) {
      block = await getBlockByID(this.blockID);
      sleep(200);
    }
    this.block = block;
    return block;
  }

}