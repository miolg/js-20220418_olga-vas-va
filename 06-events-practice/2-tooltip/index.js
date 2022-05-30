class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    const tooltipWrapper = document.createElement(`div`);
    tooltipWrapper.innerHTML = `<div class="tooltip"></div>`;
    this.element = tooltipWrapper.firstElementChild;

    Tooltip.instance = this;
  }

  initialize () {
    document.addEventListener('pointerover', this.show);
    document.addEventListener('pointerout', this.hide);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  show = ({ target }) => {
    let tooltipText = target.dataset.tooltip;
    if (!tooltipText) {
      return;
    }
    this.render(tooltipText);
    
  }

  render(text) {
    this.element.textContent = text;
    document.body.append(this.element);
  }

  hide = ({ target }) => {
    let tooltipText = target.dataset.tooltip;
    if (!tooltipText) {
      return;
    }

    this.element.textContent = '';
    this.element.remove();
  }

  onMouseMove = ({ target, offsetX, offsetY }) => {
    let tooltipText = target.dataset.tooltip;
    if (!tooltipText) {
      return;
    }
    const tooltipOffset = 15;
    this.element.style.left = `${offsetX + tooltipOffset}px`;
    this.element.style.top = `${offsetY + tooltipOffset}px`;
  }

  destroy() {
    document.removeEventListener('pointerover', this.show);
    document.removeEventListener('pointerout', this.hide);
    document.removeEventListener('mousemove', this.onMouseMove);
    this.element.remove();
  }
}

export default Tooltip;
