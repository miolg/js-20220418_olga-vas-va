export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.data = data;
    this.headerConfig = headerConfig;

    const table = document.createElement('div');
    table.className = 'sortable-table';

    const headerWrapper = document.createElement('div');
    headerWrapper.innerHTML = `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.buildHeader(headerConfig)}
      </div>
    `;
    this.subElements = { header: headerWrapper.firstElementChild };
    table.append(headerWrapper.firstElementChild);

    const bodyWrapper = document.createElement('div');
    bodyWrapper.innerHTML = `
      <div data-element="body" class="sortable-table__body">
        ${this.buildBody(data)}
      </div>
    `;
    this.subElements.body = bodyWrapper.firstElementChild;
    table.append(bodyWrapper.firstElementChild);

    const sortArrowWrapper = document.createElement('div');
    sortArrowWrapper.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    this.subElements.sortArrow = sortArrowWrapper.firstElementChild;

    this.element = table;
  }

  buildHeader(header) {
    let htmlString = '';
    header.forEach((cell) => {
      htmlString += `
        <div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
          <span>${cell.title}</span>
        </div>
      `;
    });

    return htmlString;
  }

  buildBody(data) {
    let htmlString = '';
    data.forEach((item) => {
      htmlString += `<a href="/products/${item.id}" class="sortable-table__row">`;
      this.headerConfig.forEach((cellCfg) => {
        htmlString += cellCfg.template ? cellCfg.template(item[cellCfg.id]) : '<div class="sortable-table__cell">' + item[cellCfg.id] + '</div>';
      });
      htmlString += '</a>';
    });

    return htmlString;
  }

  sort(field, order) {
    const direction = {
      asc: 1,
      desc: -1
    };
    if (!direction[order]) {
      return;
    }

    let fieldCfg = this.headerConfig.find((cfg) => cfg.id === field);
    if (!fieldCfg || !fieldCfg.sortable) {
      return;
    }

    const sortedData = [...this.data];
    sortedData.sort((prev, current) => {
      switch (fieldCfg.sortType) {
        case 'number':
          return prev[field] > current[field] ? direction[order] : direction[order] * -1;
        case 'string':
          return prev[field].localeCompare(current[field], ['ru-RU', 'en-EN'], { caseFirst: 'upper' }) * direction[order];
        default:
          return 0;
      }
    });

    this.subElements.body.innerHTML = this.buildBody(sortedData);
    const headerCell = this.subElements.header.querySelector(`[data-id="${field}"]`);
    headerCell.dataset.order = order;
    headerCell.append(this.subElements.sortArrow);
  }

  destroy() {
    this.element.remove();
  }
}

