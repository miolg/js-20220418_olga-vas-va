export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.data = data;
    this.headerConfig = headerConfig;
    this.isSortLocally = true;
    this.sorted = sorted;

    this.buildTable();
  }

  buildTable() {
    const table = document.createElement('div');
    table.className = 'sortable-table';

    const header = this.buildHeader();
    table.append(header);

    const body = this.buildBody();
    table.append(body);

    this.subElements = {
      header: header,
      body: body,
      sortArrow: this.buildArrow()
    };

    if (this.sorted.id) {
      this.sort();
    }

    this.element = table;
  }
  
  buildHeader() {
    const headerWrapper = document.createElement('div');
    headerWrapper.innerHTML = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCells()}
      </div>
    `;

    const header = headerWrapper.firstElementChild;
    header.addEventListener('pointerdown', this.sortHandler.bind(this));

    return header;
  }

  getHeaderCells() {
    let htmlString = '';
    this.headerConfig.forEach((cell) => {
      htmlString += `
        <div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
          <span>${cell.title}</span>
        </div>
      `;
    });

    return htmlString;
  }

  sortHandler(event) {
    const target = event.target.closest('.sortable-table__cell');
    if (!target || target.dataset.sortable === 'false') {
      return;
    }

    if (this.sorted.id === target.dataset.id) {
      this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sorted.order = 'desc';
    }
    this.sorted.id = target.dataset.id;
    this.sort();
  }

  buildArrow() {
    const sortArrowWrapper = document.createElement('div');
    sortArrowWrapper.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    return sortArrowWrapper.firstElementChild;
  }

  buildBody() {
    const bodyWrapper = document.createElement('div');
    bodyWrapper.innerHTML = `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyCells()}
      </div>
    `;
    return bodyWrapper.firstElementChild;
  }

  getBodyCells() {
    let htmlString = '';
    let bodyData = this.sorted.data || this.data;
    bodyData.forEach((item) => {
      htmlString += `<a href="/products/${item.id}" class="sortable-table__row">`;
      this.headerConfig.forEach((cellConfig) => {
        htmlString += cellConfig.template ? cellConfig.template(item[cellConfig.id]) : '<div class="sortable-table__cell">' + item[cellConfig.id] + '</div>';
      });
      htmlString += '</a>';
    });

    return htmlString;
  }

  sort () {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
    this.subElements.body.innerHTML = this.getBodyCells();
    this.attachArrow();
  }

  sortOnClient() {
    const direction = {
      asc: 1,
      desc: -1
    };
    const field = this.sorted.id;
    const order = this.sorted.order;

    if (!direction[order]) {
      return;
    }

    let fieldConfig = this.headerConfig.find((cfg) => cfg.id === field);
    if (!fieldConfig || !fieldConfig.sortable) {
      return;
    }

    const sortedData = [...this.data];
    sortedData.sort((prev, current) => {
      switch (fieldConfig.sortType) {
      case 'number':
        return (prev[field] - current[field]) * direction[order];
      case 'string':
        return prev[field].localeCompare(current[field], ['ru-RU', 'en-EN'], { caseFirst: 'upper' }) * direction[order];
      default:
        return 0;
      }
    });

    this.sorted.data = sortedData;
  }

  attachArrow() {
    if (!this.sorted.id) {
      return;
    }

    const headerCell = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);
    headerCell.dataset.order = this.sorted.order;
    headerCell.append(this.subElements.sortArrow);
  }

  destroy() {
    this.element.remove();
    this.subElements.header.removeEventListener('pointerdown', this.sortHandler);
  }
}
