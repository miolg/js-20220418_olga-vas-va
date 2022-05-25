export default class DoubleSlider {
  constructor({ min = 0, max = 100,
    selected = {
      from: min,
      to: max
    },
    formatValue = value => value
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.element = this.getElement();
    this.element.ondragstart = () => false;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  getElement() {
    const wrapper = document.createElement('div');
    const position = this.getPosition();
    wrapper.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress" style="left: ${position.left}%; right: ${position.right}%"></span>
        <span data-element="leftSlider" class="range-slider__thumb-left" style="left: ${position.left}%;"></span>
        <span data-element="rightSlider" class="range-slider__thumb-right" style="right: ${position.right}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;

    return wrapper.firstElementChild;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }
    
    return result;
  }

  getPosition() {
    return { 
      left: Math.floor((this.selected.from - this.min) / (this.max - this.min) * 100),
      right: Math.floor((this.max - this.selected.to) / (this.max - this.min) * 100)
    };
  }

  initEventListeners() {
    this.subElements.leftSlider.addEventListener('pointerdown', this.onMouseDown);
    this.subElements.rightSlider.addEventListener('pointerdown', this.onMouseDown);
  }

  onMouseDown = event => {
    const { clientX, target } = event;
    event.preventDefault();

    if (target == this.leftSlider) {
      this.shiftX = clientX - target.getBoundingClientRect().left;
    } else {
      this.shiftX = clientX - target.getBoundingClientRect().right;
    }
    
    this.movingSlider = target;    
    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onMouseUp);
  }

  onPointerMove = event => {
    const { clientX } = event;
    event.preventDefault();

    const {
      left: innerLeft,
      right: innerRight,
      width: innerWidth
    } = this.subElements.inner.getBoundingClientRect();

    if (this.movingSlider == this.subElements.leftSlider) {
      let newLeftPosition = (clientX - innerLeft - this.shiftX) / innerWidth * 100;
      const rightSliderPosition = parseFloat(this.subElements.rightSlider.style.right);

      if (newLeftPosition < 0) {
        newLeftPosition = 0;
      }

      if (newLeftPosition + rightSliderPosition > 100) {
        newLeftPosition = 100 - rightSliderPosition;
      }

      this.movingSlider.style.left = this.subElements.progress.style.left = newLeftPosition + '%';
    } else {
      let newRightPosition = (innerRight - clientX + this.shiftX) / innerWidth * 100;
      const leftSliderPosition = parseFloat(this.subElements.leftSlider.style.left);
      
      if (newRightPosition < 0) {
        newRightPosition = 0;
      }

      if (newRightPosition + leftSliderPosition > 100) {
        newRightPosition = 100 - leftSliderPosition;
      }

      this.movingSlider.style.right = this.subElements.progress.style.right = newRightPosition + '%';
    }

    this.updateValues();
  }

  onMouseUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onMouseUp);
    this.movingSlider = null;
    this.shiftX = 0;

    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: this.selected,
        bubbles: true,
      })
    );
  }

  updateValues() {
    this.selected.from = Math.round(this.min + (this.max - this.min) * parseFloat(this.subElements.leftSlider.style.left) * 0.01);
    this.selected.to = Math.round(this.max - (this.max - this.min) * parseFloat(this.subElements.rightSlider.style.right) * 0.01);
    this.subElements.from.textContent = this.formatValue(this.selected.from);
    this.subElements.to.textContent = this.formatValue(this.selected.to);
  }

  destroy() {
    this.subElements.leftSlider.removeEventListener('pointerdown', this.onMouseDown);
    this.subElements.rightSlider.removeEventListener('pointerdown', this.onMouseDown);
    this.element.remove();
  }
}
