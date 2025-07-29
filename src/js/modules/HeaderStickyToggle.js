export default class HeaderStickyToggle {
  constructor(selector = '.js-header-sticky', threshold = 100, throttleDelay = 100, tolerance = 5) {
    this.header = document.querySelector(selector);
    if (!this.header) return;

    this.threshold = threshold;
    this.tolerance = tolerance;
    this.lastScroll = window.scrollY;

    this.onScroll = this.onScroll.bind(this);
    this.handleScroll = this.throttle(this.onScroll, throttleDelay);

    window.addEventListener('scroll', this.handleScroll);

    this.onScroll();
  }

  throttle(func, delay) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        func(...args);
      }
    };
  }

  onScroll() {
    const currentScroll = window.scrollY;

    const scrollDiff = Math.abs(currentScroll - this.lastScroll);

    if (scrollDiff <= this.tolerance) return;

    if (currentScroll < this.threshold) {
      this.header.classList.remove('is-hidden');
    } else if (currentScroll > this.lastScroll) {
      this.header.classList.add('is-hidden');
    } else {
      this.header.classList.remove('is-hidden');
    }

    this.lastScroll = currentScroll;
  }
}
