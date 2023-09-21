export async function sleep(time:number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(time);
    }, time);
  })
}

// 从前端判断是否存在输入，从后端判断的话因为有些人的电脑延迟过高所以会误删
export async function checkEmptyDoc(root: HTMLElement): Promise<boolean> {
  const protyle = root.querySelector("#protyle .protyle-wysiwyg");
  const childs = protyle.children;
  console.log("获取文档子块：", childs);
  // 本身就没有
  if (!childs || !childs.length) {
    console.log("文档不存在子块");
    return true;
  }
  // 只有一个空的第一行
  if (childs.length == 1 && childs[0].className == "p") {
    // 判断条件为：只有一个块，块为段落块，段落块内容为空
    console.log("第一段内容为：", childs[0].children[0].textContent)
    if (!childs[0].children[0].textContent.length) return true
  }
  return false;
}