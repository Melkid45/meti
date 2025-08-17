class BodyGrid {
  /**
   * @param {Object} [options]
   * @param {string|Element|null} [options.scrollContainer] - селектор или элемент кастомного скролл-контейнера. По умолчанию window.
   * @param {string} [options.zonesSelector] - селекторы зон, где цвет меняется.
   */
  constructor(options = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Все размеры в rem
    this.settings = {
      baseSizeRem: 54,        // 54px / 16
      activationRadiusRem: 120,  // 120px / 16
      trailLifetime: 100,        // ms
      gridColor: { r: 39, g: 39, b: 39 },
      borderWidthRem: 1,    // 1px / 16
      disappearChance: 0.25
    };

    // Настройки
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

  // Определяем реальный скролл-элемент
  resolveScrollEl(scrollContainer) {
    if (!scrollContainer) return window;
    if (scrollContainer instanceof Element) return scrollContainer;
    const el = document.querySelector(scrollContainer);
    return el || window;
  }

  // 1rem в CSS-пикселях
  updateRemSize() {
    this.remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  }

  // Утилиты скролла и размеров в rem
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
    this.canvas.style.pointerEvents = "none"; // важно для elementFromPoint
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
    // Канвас покрывает вьюпорт
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

      // переводим координаты в "мировые" rem (учитываем скролл нужного контейнера)
      const xPagePx = e.clientX + this.getScrollXpx();
      const yPagePx = e.clientY + this.getScrollYpx();
      this.mouse.xRem = xPagePx / this.remPx;
      this.mouse.yRem = yPagePx / this.remPx;
      this.mouse.inside = true;

      this.updateHoverColorAtPoint(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });

    // При прокрутке нужно «перепроверить» зону под курсором,
    // т.к. относительно вьюпорта всё сдвигается
    const onScroll = () => {
      if (!this.mouse.inside) return;

      // Проверяем, находится ли курсор внутри зоны .feedback или footer
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
        ? { r: 90, g: 69, b: 199 }  // #5A45C7
        : { r: 39, g: 39, b: 39 };  // дефолт
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
      this.settings.gridColor = { r: 39, g: 39, b: 39 }; // вернуть дефолт на выход
    }, { passive: true });
  }

  // Меняем цвет, если курсор над нужной зоной (через elementFromPoint + closest)
  updateHoverColorAtPoint(clientX, clientY) {
    // Если курсор не внутри viewport, сбрасываем в дефолт
    if (!this.mouse.inside) {
      this.settings.gridColor = { r: 39, g: 39, b: 39 };
      return;
    }

    // Получаем все элементы под курсором (включая перекрытые)
    const elements = document.elementsFromPoint(clientX, clientY);
    let inZone = elements.some(el => el.closest(this.zonesSelector));

    // Если не нашли через elementFromPoint, проверяем координаты
    if (!inZone) {
      const scrollY = this.getScrollYpx();
      const cursorY = clientY + scrollY;

      // Проверяем, находится ли курсор внутри зоны .feedback или footer
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
      ? { r: 90, g: 69, b: 199 }  // #5A45C7
      : { r: 39, g: 39, b: 39 };  // дефолт
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
      cell.life -= 16; // ~кадр
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

    // Скролл и размер видимой области — в rem
    const scrollXRem = this.getScrollXRem();
    const scrollYRem = this.getScrollYRem();
    const viewWidthRem = this.getViewWidthRem();
    const viewHeightRem = this.getViewHeightRem();

    // Очистка в CSS-пикселях (мы уже масштабировали контекст на dpr)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = `rgb(${this.settings.gridColor.r},${this.settings.gridColor.g},${this.settings.gridColor.b})`;
    ctx.lineWidth = (this.settings.borderWidthRem * this.remPx) / this.pixelRatio;

    const startX = Math.floor(scrollXRem / baseSizeRem) - 1;
    const endX = Math.floor((scrollXRem + viewWidthRem) / baseSizeRem) + 1;
    const startY = Math.floor(scrollYRem / baseSizeRem) - 1;
    const endY = Math.floor((scrollYRem + viewHeightRem) / baseSizeRem) + 1;

    const remToPx = this.remPx; // в CSS px

    for (let gy = startY; gy <= endY; gy++) {
      for (let gx = startX; gx <= endX; gx++) {
        const key = `${gx}_${gy}`;
        if (!this.cells.has(key)) continue;

        // Переводим координаты из rem в CSS-пиксели
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

// Автозапуск (можно убрать условие, если нужно на мобилках)
if (window.innerWidth > 750) {
  document.addEventListener("DOMContentLoaded", () => {
    new BodyGrid({
      // Пример: если у вас основной скролл внутри <main class="scrollable">
      // scrollContainer: '.scrollable',
      zonesSelector: '.feedback, footer'
    });
  });
}
