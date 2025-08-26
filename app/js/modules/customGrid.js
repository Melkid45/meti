class BodyGrid {
  /**
   * @param {Object} [options]
   * @param {string|Element|null} [options.scrollContainer]
   * @param {string} [options.zonesSelector]
   */
  constructor(options = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.settings = {
      baseSizeRem: 54, 
      activationRadiusRem: 120,
      trailLifetime: 100,
      gridColor: { r: 39, g: 39, b: 39 },
      borderWidthRem: 1, 
      disappearChance: 0.25
    };

    this.zonesSelector = options.zonesSelector || '.feedback, footer';
    this.scrollEl = this.resolveScrollEl(options.scrollContainer);

    this.cells = new Map();
    this.mouse = { xRem: -1000, yRem: -1000, inside: false, lastClientX: 0, lastClientY: 0 };
    this.lastMouseMoveTime = performance.now();
    this.idleTimeout = 100;

    this.updateRemSize();
    this.initCanvas();
    this.addEvents();
    this.animate();
  }

  resolveScrollEl(scrollContainer) {
    if (!scrollContainer) return window;
    if (scrollContainer instanceof Element) return scrollContainer;
    const el = document.querySelector(scrollContainer);
    return el || window;
  }

  updateRemSize() {
    this.remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  getScrollXpx() {
    if (this.scrollEl === window) return window.scrollX || 0;
    return this.scrollEl.scrollLeft || 0;
  }
  getScrollYpx() {
    if (this.scrollEl === window) return window.scrollY || 0;
    return this.scrollEl.scrollTop || 0;
  }
  getScrollXRem() { return this.getScrollXpx() / this.remPx; }
  getScrollYRem() { return this.getScrollYpx() / this.remPx; }

  getViewWidthPx() {
    if (this.scrollEl === window) return window.innerWidth;
    return this.scrollEl.clientWidth;
  }
  getViewHeightPx() {
    if (this.scrollEl === window) return window.innerHeight;
    return this.scrollEl.clientHeight;
  }
  getViewWidthRem() { return this.getViewWidthPx() / this.remPx; }
  getViewHeightRem() { return this.getViewHeightPx() / this.remPx; }

  initCanvas() {
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "-1";
    document.body.appendChild(this.canvas);

    this.resizeCanvas();
    window.addEventListener("resize", () => {
      this.updateRemSize();
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.pixelRatio = dpr;
  }

  addEvents() {
    const onMouseMove = (e) => {
      this.lastMouseMoveTime = performance.now();
      this.mouse.lastClientX = e.clientX;
      this.mouse.lastClientY = e.clientY;

      const xPagePx = e.clientX + this.getScrollXpx();
      const yPagePx = e.clientY + this.getScrollYpx();
      this.mouse.xRem = xPagePx / this.remPx;
      this.mouse.yRem = yPagePx / this.remPx;
      this.mouse.inside = true;

      this.updateHoverColorAtPoint(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    const onScroll = () => {
      if (!this.mouse.inside) return;

      const scrollY = this.getScrollYpx();
      const cursorY = this.mouse.lastClientY + scrollY;
      let inZone = false;

      document.querySelectorAll(this.zonesSelector).forEach(zone => {
        const rect = zone.getBoundingClientRect();
        const zoneTop = rect.top + scrollY;
        const zoneBottom = rect.bottom + scrollY;

        if (cursorY >= zoneTop && cursorY <= zoneBottom) {
          inZone = true;
        }
      });

      this.settings.gridColor = inZone
        ? { r: 90, g: 69, b: 199 }  
        : { r: 39, g: 39, b: 39 }; 
    };

    if (this.scrollEl === window) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      this.scrollEl.addEventListener("scroll", onScroll, { passive: true });
    }

    document.addEventListener("mouseout", () => {
      this.mouse.xRem = -1000;
      this.mouse.yRem = -1000;
      this.mouse.inside = false;
      this.settings.gridColor = { r: 39, g: 39, b: 39 };
    }, { passive: true });
  }

  updateHoverColorAtPoint(clientX, clientY) {
    if (!this.mouse.inside) {
      this.settings.gridColor = { r: 39, g: 39, b: 39 };
      return;
    }
    const elements = document.elementsFromPoint(clientX, clientY);
    let inZone = elements.some(el => el.closest(this.zonesSelector));
    if (!inZone) {
      const scrollY = this.getScrollYpx();
      const cursorY = clientY + scrollY;
      document.querySelectorAll(this.zonesSelector).forEach(zone => {
        const rect = zone.getBoundingClientRect();
        const zoneTop = rect.top + scrollY;
        const zoneBottom = rect.bottom + scrollY;

        if (cursorY >= zoneTop && cursorY <= zoneBottom) {
          inZone = true;
        }
      });
    }

    this.settings.gridColor = inZone
      ? { r: 90, g: 69, b: 199 } 
      : { r: 39, g: 39, b: 39 }; 
  }


  isIdle() {
    return performance.now() - this.lastMouseMoveTime > this.idleTimeout;
  }

  updateCells() {
    const now = performance.now();
    const radius = this.settings.activationRadiusRem;
    const baseSize = this.settings.baseSizeRem;

    if (this.mouse.inside && !this.isIdle()) {
      const mx = this.mouse.xRem;
      const my = this.mouse.yRem;
      const startX = Math.floor((mx - radius) / baseSize);
      const endX = Math.floor((mx + radius) / baseSize);
      const startY = Math.floor((my - radius) / baseSize);
      const endY = Math.floor((my + radius) / baseSize);

      for (let gy = startY; gy <= endY; gy++) {
        for (let gx = startX; gx <= endX; gx++) {
          const cx = gx * baseSize;
          const cy = gy * baseSize;
          const dx = mx - (cx + baseSize / 2);
          const dy = my - (cy + baseSize / 2);
          if (dx * dx + dy * dy <= radius * radius) {
            const key = `${gx}_${gy}`;
            this.cells.set(key, { lastActive: now, life: this.settings.trailLifetime });
          }
        }
      }
    }

    for (let [key, cell] of this.cells) {
      cell.life -= 16;
      if (cell.life <= 0) {
        if (Math.random() < this.settings.disappearChance) {
          this.cells.delete(key);
        } else {
          cell.life = 50 + Math.random() * 50;
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const baseSizeRem = this.settings.baseSizeRem;

    const scrollXRem = this.getScrollXRem();
    const scrollYRem = this.getScrollYRem();
    const viewWidthRem = this.getViewWidthRem();
    const viewHeightRem = this.getViewHeightRem();

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = `rgb(${this.settings.gridColor.r},${this.settings.gridColor.g},${this.settings.gridColor.b})`;
    ctx.lineWidth = (this.settings.borderWidthRem * this.remPx) / this.pixelRatio;

    const startX = Math.floor(scrollXRem / baseSizeRem) - 1;
    const endX = Math.floor((scrollXRem + viewWidthRem) / baseSizeRem) + 1;
    const startY = Math.floor(scrollYRem / baseSizeRem) - 1;
    const endY = Math.floor((scrollYRem + viewHeightRem) / baseSizeRem) + 1;

    const remToPx = this.remPx;

    for (let gy = startY; gy <= endY; gy++) {
      for (let gx = startX; gx <= endX; gx++) {
        const key = `${gx}_${gy}`;
        if (!this.cells.has(key)) continue;

        const xPx = (gx * baseSizeRem - scrollXRem) * remToPx;
        const yPx = (gy * baseSizeRem - scrollYRem) * remToPx;
        const sPx = baseSizeRem * remToPx;

        ctx.strokeRect(xPx, yPx, sPx, sPx);
      }
    }
  }

  animate() {
    this.updateCells();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

if (window.innerWidth > 750) {
  document.addEventListener("DOMContentLoaded", () => {
    new BodyGrid({
      zonesSelector: '.feedback, footer'
    });
  });
}
