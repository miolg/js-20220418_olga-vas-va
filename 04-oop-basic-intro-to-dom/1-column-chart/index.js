export default class ColumnChart {
  constructor({ data = [], label = "", value = "", link = "", formatHeading = (val) => val } = {}) {
    this.chartHeight = 50;

    this.element = document.createElement('div');
    this.element.className = `column-chart${data.length ? '' : ' column-chart_loading'}`;
    this.element.style = `--chart-height: ${this.chartHeight}`;

    this.element.innerHTML = `
      <div class="column-chart__title">
        Total ${label}
        ${link ? '<a class="column-chart__link" href="' + link + '">View all</a>' : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
        ${formatHeading(value)}
        </div>
      <div data-element="body" class="column-chart__chart">
        ${this.createDataHTML(data)}
      </div>
    `;
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

  update(newData = []) {
    this.element.querySelector('.column-chart__chart').innerHTML = this.createDataHTML(newData);
  }

  destroy() {
    this.element.remove();
  }

  remove() {
    this.element.remove();
  }

}
