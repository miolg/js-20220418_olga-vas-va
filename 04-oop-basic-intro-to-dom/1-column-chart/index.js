export default class ColumnChart {
  chartHeight = 50;

  constructor({ data = [], label = "", value = "", link = "", formatHeading = (val) => val } = {}) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <div class="column-chart${data.length ? '' : ' column-chart_loading'}" --chart-height: ${this.chartHeight}>
        <div class="column-chart__title">
          Total ${label}
          ${link ? '<a class="column-chart__link" href="' + link + '">View all</a>' : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          ${formatHeading(value)}
          </div>
      </div>
    `;

    const chartWrapper = document.createElement('div');
    chartWrapper.innerHTML = `
      <div data-element="body" class="column-chart__chart">
        ${this.createDataHTML(data)}
      </div>
    `;


    this.element = wrapper.firstElementChild;
    this.chart = chartWrapper.firstElementChild;
    this.element.append(this.chart);
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
    this.chart.innerHTML = this.createDataHTML(newData);
  }

  destroy() {
    this.element.remove();
  }

  remove() {
    this.element.remove();
  }

}
