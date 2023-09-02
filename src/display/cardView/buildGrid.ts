import dragula from "dragula";

export class EasyGrid {
  private container: HTMLElement;
  private items: NodeListOf<HTMLElement>;
  private column: number;
  private columnWidth: number;
  private columns: HTMLElement[];

  public drake: dragula.Drake;
  
  constructor(private config: {
    containerSelector: string,
    orgainizerSelector: string,
    storagerSelector: string,
    itemSelector: string,
    columnClass: string,
    maxWidth: number,
    minWidth: number
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
    const docColumn = document.querySelector(this.config.orgainizerSelector);
    const storageColumn = document.querySelector(this.config.storagerSelector);
    this.drake = dragula([docColumn, storageColumn, ...columns], {
      moves: (el, container, handle) => {
        return handle.classList.contains("grid-item-title");
      },
      accepts: () => {return true},
      revertOnSpill: true
    })
  }
}