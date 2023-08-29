import SiYuanPluginCitation from "../index";
import { 
  dataDir,
  isDev,
  STORAGE_NAME
} from "./constants";
import { createLogger } from "./simple-logger";
import { type INoticer } from "./noticer";
const fs = window.require("fs");
const path = window.require("path");

/**
 * Reading the given directory and 
 * search all the .json and .bib file
 */
export async function fileSearch(dirPath: string, noticer: INoticer): Promise<string[]> {
  const absStoragePath = path.resolve(dataDir, "./storage/petal/siyuan-plugin-citation");
  const absDirPath = path.join(absStoragePath, dirPath);
  // TODO 如果没有这个文件夹就新建
  const files = await fsReadDir(absDirPath).catch((error: Error) => {
    if (error.message.split(":")[0] === "ENOENT") {
      //ENOENT错误说明没有文件夹，新建references文件夹
      fs.mkdirSync(absDirPath);
    } else {
      // 如果是其它错误就报错
      noticer.error(error.message);
      return null;
    }
    return [];
  });
  if (!files) return null;
  const promises = files.map(file => {
    return fsStat(path.join(absDirPath, file));
  });
  const datas = await Promise.all(promises).then(stats => {
    for (let i = 0; i < files.length; i += 1) files[i] = path.join(absDirPath, files[i]);
    return { stats, files };
  });
  const returnp = datas.stats.map(fileStat => {
    const isFile = fileStat.isFile();
    const isDir = fileStat.isDirectory();
    if (isDir) {
      return fileSearch(datas.files[datas.stats.indexOf(fileStat)], noticer);
    }
    if (isFile) {
      const filePath = datas.files[datas.stats.indexOf(fileStat)];
      const typePos = filePath.split(".").length - 1;
      if (filePath.split(".")[typePos] == "json" || filePath.split(".")[typePos] == "bib") {
        return [filePath];
      } else {
        return [];
      }
    }
  });
  return await Promise.all(returnp).then(finalRes => {
    const filePath: string[] = [];
    finalRes.forEach(fileList => {
      filePath.push(...fileList);
    });
    return filePath;
  });
}

// 读取文件的逻辑拉出
function fsReadDir(dir: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(dir, (err: any, files: string[] | PromiseLike<string[]>) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

// 获取fs.stats的逻辑拉出
function fsStat(path: string) {
  return new Promise<any>((resolve, reject) => {
    fs.stat(path, (err: any, stat: any) => {
      if (err) reject(err);
      resolve(stat);
    });
  });
}