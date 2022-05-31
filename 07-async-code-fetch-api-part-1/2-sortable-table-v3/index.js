import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    url = '',
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc',
    },
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = headerConfig;
    this.isSortLocally = (url == '');
    this.sorted = sorted;
    this.data = this.loadData();

    this.render();
    this.update();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.data = await this.loadData();
    this.initEventListeners();
  }
  
  update() {
    // this.subElements.emptyPlaceholder.styles.display = this.data.length == 0 ? 'block' : 'none';
    this.subElements.body.innerHTML = this.getBodyCells();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortHandler);
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getBody()}
        ${this.getLoadingState()}
        ${this.getNoDataState()}
      </div>
    `;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;
      
      return result;
    }, {});
  }

  getLoadingState() {
    return '<div data-element="loading" class="loading-line sortable-table__loading-line"></div>';
  }

  getNoDataState() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCells()}
      </div>
    `;
  }

  getHeaderCells() {
    return [...this.headerConfig].reduce((htmlString, cell) => {
      return htmlString += `
        <div class="sortable-table__cell" data-id="${cell.id}" data-sortable="${cell.sortable}">
          <span>${cell.title}</span>
        </div>
      `;
    }, '');
  }
  
  getArrow() {
    const sortArrowWrapper = document.createElement('div');
    sortArrowWrapper.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    return sortArrowWrapper.firstElementChild;
  }

  getBody() {
    return `
      <div data-element="body" class="sortable-table__body"></div>
    `;
  }

  getBodyCells() {
    let htmlString = '';
console.log('this.data', this.data);
    this.data.forEach((item) => {
      htmlString += `<a href="/products/${item.id}" class="sortable-table__row">`;

      this.headerConfig.forEach((cellConfig) => {
        htmlString += cellConfig.template ? cellConfig.template(item[cellConfig.id]) : '<div class="sortable-table__cell">' + item[cellConfig.id] + '</div>';
      });

      htmlString += '</a>';
    });

    return htmlString;
  }

  sortHandler = (event) => {
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

  sort () {
    if (!this.sorted?.id) {
      return;
    }
    
    this.subElements.loading.style.display = 'block';

    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      this.sortOnServer(this.sorted.id, this.sorted.order);
    }

    this.subElements.loading.style.display = 'none';
    this.attachArrow();
  }

  async loadData() {
    return await fetchJson(this.url);
  }

  sortOnServer (id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    
    this.data = this.loadData();

    this.update();
  }

  sortOnClient(id, order) {
    const directions = {
      asc: 1,
      desc: -1
    };
  
    const direction = directions[order];

    if (!direction) {
      return;
    }

    let fieldConfig = this.headerConfig.find((cfg) => cfg.id === id);
    if (!fieldConfig || !fieldConfig.sortable) {
      return;
    }

    const sortedData = [...this.data];
    sortedData.sort((prev, current) => {
      switch (fieldConfig.sortType) {
      case 'number':
        return (prev[id] - current[id]) * direction;
      case 'string':
        return prev[id].localeCompare(current[id], ['ru-RU', 'en-EN'], { caseFirst: 'upper' }) * direction;
      default:
        return 0;
      }
    });

    this.data = sortedData;

    this.update();
  }

  attachArrow() {
    if (!this.sorted.id) {
      return;
    }

    const headerCell = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);
    headerCell.dataset.order = this.sorted.order;
    headerCell.append(this.subElements.arrow);
  }

  destroy() {
    this.element.remove();
    this.subElements.header.removeEventListener('pointerdown', this.sortHandler);
  }
}
