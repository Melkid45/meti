export default class GridRhythmAlign {
  constructor({ gridSize = null, lenis = null } = {}) {
    if (gridSize === null) {
      const rootStyles = getComputedStyle(document.documentElement);
      const cssGridSize = rootStyles.getPropertyValue('--grid-size').trim();

      this.gridSize = cssGridSize ? parseFloat(cssGridSize) : 55;
    } else {
      this.gridSize = gridSize;
    }

    this.lenis = lenis;
    this.blocks = Array.from(document.querySelectorAll('.js-rhythm-xy'));
    this.rafId = null;

    if (!this.blocks.length) return;

    this.update = this.update.bind(this);
    this._rafUpdate = this._rafUpdate.bind(this);
    this.onResize = this.onResize.bind(this);

    this.alignGridsDebounced = this._debounce(this.update, 50);

    this.resizeObserver = null;

    this._init();
  }

  _init() {
    this.update();
    this._setupListeners();
    this._setupResizeObserver();
  }

  update() {
    this.blocks.forEach(block => {
      const rect = block.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      const offsetLeft = rect.left + scrollX;
      const offsetTop = rect.top + scrollY;

      const offsetX = (-offsetLeft % this.gridSize + this.gridSize) % this.gridSize;
      const offsetY = (-offsetTop % this.gridSize + this.gridSize) % this.gridSize;

      block.style.setProperty('--bg-pos-x', `${offsetX}rem`);
      block.style.setProperty('--bg-pos-y', `${offsetY}rem`);
    });
  }

  _setupListeners() {
    if (this.lenis && typeof this.lenis.on === 'function') {
      this.lenis.on('scroll', this._rafUpdate);
    } else {
      window.addEventListener('scroll', this._rafUpdate, { passive: true });
    }
    window.addEventListener('resize', this.onResize);
  }

  _rafUpdate() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.update();
      this.rafId = null;
    });
  }

  onResize() {
    this.alignGridsDebounced();
  }

  _setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.alignGridsDebounced());
      this.blocks.forEach(block => this.resizeObserver.observe(block));
    }
  }

  destroy() {
    if (this.lenis && typeof this.lenis.off === 'function') {
      this.lenis.off('scroll', this._rafUpdate);
    } else {
      window.removeEventListener('scroll', this._rafUpdate);
    }
    window.removeEventListener('resize', this.onResize);

    if (this.resizeObserver) {
      this.blocks.forEach(block => this.resizeObserver.unobserve(block));
      this.resizeObserver.disconnect();
    }
  }

  _debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
}