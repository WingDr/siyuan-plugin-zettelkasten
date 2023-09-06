import dragula from "dragula";

const moveHandler = ["grid-item-title", "grid-item__move-handler"];

export class EasyGrid {
  private container: HTMLElement;
  private items: NodeListOf<HTMLElement>;
  private column: number;
  private columnWidth: number;
  private columns: HTMLElement[];

  private docIndexStart = 0;
  private docIndexEnd = 0;

  public drake: dragula.Drake;
  
  constructor(private config: {
    containerSelector: string,
    orgainizerSelector: string,
    storagerSelector: string,
    itemSelector: string,
    columnClass: string,
    maxWidth: number,
    minWidth: number,
    dropCallback: (
      el:HTMLElement, 
      target:HTMLElement, 
      source:HTMLElement, 
      sibling:HTMLElement
      ) => any,
    cloneCallback?: (clone: HTMLElement, original: HTMLElement, type: "mirror" | "copy") => any
  }) {
    this.container = document.querySelector(config.containerSelector) as HTMLElement;
    this.items = this.container.querySelectorAll(config.itemSelector);
  }

  public getItems() {
    return this.items;
  }

  public getColumns() {
    return this.columns;
  }

  public refreshItems() {
    this.container = document.querySelector(this.config.containerSelector) as HTMLElement;
    this.items = this.container.querySelectorAll(this.config.itemSelector);
  }

  public refreshItemIndex() {
    const organizeColumn = document.querySelector(this.config.orgainizerSelector);
    const storageColumn = document.querySelector(this.config.storagerSelector);
    let index = 0
    for (let node of organizeColumn.children) {
      node.setAttribute("data-block-index", index.toString());
      index += 1;
    }
    index = 0
    for (let node of storageColumn.children) {
      node.setAttribute("data-block-index", index.toString());
      index += 1;
    }
  }

  public layout() {
    this.calculateColumn();
    this.container.innerHTML = "";
    const columns: HTMLDivElement[] = [];
    // 创建列
    for (let i = 0; i < this.column; i++) {
      const columeElement = document.createElement("div");
      columeElement.className = this.config.columnClass;
      columeElement.style.width = `${this.columnWidth}%`
      columeElement.setAttribute("data-index", i.toString());
      this.container.appendChild(columeElement);
      columns.push(columeElement);
    }
    let index = 0;
    const heights = columns.map(() => 0);
    while (index < this.items.length) {
      const appendColumnIndex = heights.indexOf(Math.min(...heights));
      const appendColumn = columns[appendColumnIndex];
      appendColumn.appendChild(this.items[index]);
      heights[appendColumnIndex] += this.items[index].getBoundingClientRect().height;
      index++;
    }
    this.columns = columns;
    this.enableDrag(columns);
  }

  private calculateColumn() {
    const elems = this.items;
    if (elems.length) {
      const gridContainer = this.container;
      const totalWidth = gridContainer.getBoundingClientRect().width;
      if (totalWidth <= this.config.minWidth) {
        this.column = 1;
        this.columnWidth = 95;
      } else {
        const minColumn = Math.ceil(totalWidth / this.config.maxWidth);
        const maxColumn = Math.floor(totalWidth / this.config.minWidth);
        this.column = minColumn;
        if (minColumn >= maxColumn) {
          this.column = maxColumn;
        }
        this.columnWidth = (100-10)/this.column;
      }
    }
  }

  private async enableDrag(columns: HTMLElement[]) {
    const _this = this;
    const organizeColumn = document.querySelector(this.config.orgainizerSelector);
    const storageColumn = document.querySelector(this.config.storagerSelector);
    this.drake = dragula([organizeColumn, storageColumn, ...columns], {
      moves: (_el, _container, handle) => {
        for (let handlerClass of moveHandler) {
          if (handle.classList.contains(handlerClass)) return true;
        }
        return false;
      },
      accepts: (_el, target:HTMLElement, source: HTMLElement, _sibling) => {
        if (source == organizeColumn) {
          if (target == organizeColumn) {
            return true;
          }
          else return false;
        } else if ([organizeColumn, storageColumn].indexOf(target) != -1) return true
        return false;
      },
      copy(_el, source:HTMLElement) {
          return [..._this.columns, storageColumn].indexOf(source) != -1;
      },
      revertOnSpill: true
    })
    this.drake.on("drop", this.config.dropCallback);
    this.drake.on("cloned", this.config.cloneCallback);
  }
}