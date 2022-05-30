import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    value = 0,
    link = '',
    formatHeading = (val) => val
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    this.element = this.getElement();
    this.subElements = this.getSubElements();
  }

  getElement() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <div class="column-chart column-chart_loading" --chart-height: ${this.chartHeight}>
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? '<a class="column-chart__link" href="' + this.link + '">View all</a>' : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;

    return wrapper.firstElementChild;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  update = async (from, to) => {
    this.element.classList.add('column-chart_loading');
    this.range = { from, to };
    const data = await this.getData();

    this.updateChart(data);

    if (Object.values(data).length) {
      this.element.classList.remove('column-chart_loading');
    }

    return data;
  }

  getData = async () => {
    let url = `${BACKEND_URL}/${this.url}`;
    let data;

    if (this.range.from && this.range.to) {
      url += `?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`;
    }

    let promise = await fetch(url);

    if (promise.ok) {
      data = await promise.json();
    }

    return data;
  }

  updateChart(data) {
    const value = Object.values(data).reduce((accumulator, value) => {
      return accumulator + value;
    }, 0);
    this.subElements.body.innerHTML = this.createDataHTML(Object.values(data));
    this.subElements.header.innerHTML = this.formatHeading(value);
  }

  scaleData(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  createDataHTML(data) {
    let dataHTML = "";
    this.scaleData(data).forEach((item) => {
      dataHTML += `<div style="--value:${item.value}" data-tooltip="${item.percent}"></div>`;
    });

    return dataHTML;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

}
