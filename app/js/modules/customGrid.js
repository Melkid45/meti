class SectionGrid {
  constructor(section) {
    this.section = section;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cellPool = [];
    this.mouse = { x: -1000, y: -1000 };
    this.rafId = null;
    this.isActive = true;
    this.sectionTop = 0;

    // Конфигурация в rem (1rem = 100vw/1920)
    this.settings = {
      baseSize: 54,       // 54px = 54rem
      sizeVariation: 0,
      spacing: 0,
      activationRadius: 120, // 120px = 120rem
      fadeSpeed: 0.01,
      maxRotation: 0.0,
      rotationSpeed: 0,
      borderColor: { r: 244, g: 244, b: 244, a: 0.24 },
      fillColor: { r: 0, g: 0, b: 0, a: 0 },
      borderWidth: 1,      // 1px = 1rem
      offsetX: 0,
      offsetY: 0
    };

    // Кастомные смещения для секции services
    if (section.classList.contains('services')) {
      this.settings.offsetX = -1; // -15rem
      this.settings.offsetY = -25; // -29rem
    }
    if (section.classList.contains('client')) {
      this.settings.offsetX = 0; // -15rem
      this.settings.offsetY = 11; // -29rem
    }
    if (section.classList.contains('main')) {
      this.settings.offsetX = 27; // -15rem
      this.settings.offsetY = -27; // -29rem
    }
    this.init();
  }

  // Конвертация rem в пиксели (1rem = 100vw/1920)
  remToPx(rem) {
    return rem * (window.innerWidth / 1920);
  }
  init() {
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.imageRendering = 'pixelated';
    this.section.style.position = 'relative';
    this.section.appendChild(this.canvas);

    this.updateSectionPosition();
    this.resize();
    this.initPool();
    this.startAnimation();
  }

  updateSectionPosition() {
    this.rect = this.section.getBoundingClientRect();
    this.sectionTop = this.rect.top + window.scrollY;
  }

  resize() {
    this.rect = this.section.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = this.rect.width + 'px';
    this.canvas.style.height = this.rect.height + 'px';
    this.canvas.width = this.rect.width * dpr;
    this.canvas.height = this.rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    const baseSizePx = this.remToPx(this.settings.baseSize);
    const spacingPx = this.remToPx(this.settings.spacing);

    this.gridCols = Math.ceil(this.rect.width / baseSizePx);
    this.gridRows = Math.ceil(this.rect.height / baseSizePx);
  }

  initPool() {
    this.cellPool = [];
    const baseSizePx = this.remToPx(this.settings.baseSize);
    const offsetXPx = this.remToPx(this.settings.offsetX);
    const offsetYPx = this.remToPx(this.settings.offsetY);

    // Новый алгоритм позиционирования без накопления ошибок
    const startX = (this.rect.width - (this.gridCols * baseSizePx)) / 2 + offsetXPx;
    const startY = (this.rect.height - (this.gridRows * baseSizePx)) / 2 + offsetYPx;

    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        this.cellPool.push({
          x: startX + x * baseSizePx,
          y: startY + y * baseSizePx,
          width: baseSizePx,
          height: baseSizePx, // Гарантируем квадраты
          rotation: 0,
          targetRotation: 0,
          alpha: 0,
          active: false,
          lastActiveTime: 0,
          borderWidth: Math.floor(this.remToPx(this.settings.borderWidth))
        });
      }
    }
  }

  // Остальные методы без изменений
  updateMousePosition(x, y) {
    const rect = this.section.getBoundingClientRect();
    this.mouse.x = x - rect.left;
    this.mouse.y = y - rect.top;
  }

  updateCells() {
    const activationRadiusPx = this.remToPx(this.settings.activationRadius);
    const activationRadiusSq = activationRadiusPx * activationRadiusPx;
    const now = performance.now();

    for (let cell of this.cellPool) {
      const dx = this.mouse.x - (cell.x + cell.width / 2);
      const dy = this.mouse.y - (cell.y + cell.height / 2);
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < activationRadiusSq) {
        cell.active = true;
        cell.lastActiveTime = now;
        cell.targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
        cell.alpha = Math.min(1, 1 - (distanceSq / activationRadiusSq));
      } else {
        if (cell.active && now - cell.lastActiveTime > 300) {
          cell.active = false;
        }
        cell.alpha = Math.max(0, cell.alpha - this.settings.fadeSpeed);
        cell.targetRotation = 0;
      }

      cell.rotation += (cell.targetRotation - cell.rotation) * this.settings.rotationSpeed;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = false;

    // Сначала фон
    this.ctx.fillStyle = `rgba(${this.settings.fillColor.r}, ${this.settings.fillColor.g}, ${this.settings.fillColor.b}, ${this.settings.fillColor.a})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Затем ячейки
    for (let cell of this.cellPool) {
      if (cell.alpha <= 0) continue;

      const x = Math.floor(cell.x);
      const y = Math.floor(cell.y);
      const size = cell.width; // Гарантированно ровный размер

      this.ctx.save();
      this.ctx.translate(
        x + size / 2,
        y + size / 2
      );
      this.ctx.rotate(cell.rotation);

      // Заливка
      this.ctx.fillStyle = `rgba(
        ${this.settings.fillColor.r}, 
        ${this.settings.fillColor.g}, 
        ${this.settings.fillColor.b}, 
        ${this.settings.fillColor.a * cell.alpha}
      )`;
      this.ctx.fillRect(
        -size / 2,
        -size / 2,
        size,
        size
      );

      // Border
      this.ctx.strokeStyle = `rgba(
        ${this.settings.borderColor.r}, 
        ${this.settings.borderColor.g}, 
        ${this.settings.borderColor.b}, 
        ${this.settings.borderColor.a * cell.alpha}
      )`;
      this.ctx.lineWidth = cell.borderWidth;
      this.ctx.strokeRect(
        -size / 2,
        -size / 2,
        size,
        size
      );

      this.ctx.restore();
    }
  }

  startAnimation() {
    if (!this.rafId) {
      this.animate();
    }
  }

  animate() {
    this.updateCells();
    this.draw();
    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// GridSystem остается без изменений
class GridSystem {
  constructor() {
    this.sectionGrids = [];
    this.mouse = { x: -1000, y: -1000 };
    this.scrollY = window.scrollY;
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    const sections = document.querySelectorAll('[data-grid="true"]');
    sections.forEach(section => {
      this.sectionGrids.push(new SectionGrid(section));
    });

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.sectionGrids.forEach(grid => {
        const rect = grid.section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          grid.updateMousePosition(e.clientX, e.clientY);
        }
      });
    });

    document.addEventListener('mouseout', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    window.addEventListener('scroll', () => {
      this.lastScrollY = this.scrollY;
      this.scrollY = window.scrollY;
      this.sectionGrids.forEach(grid => {
        grid.updateSectionPosition();
      });
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.sectionGrids.forEach(grid => {
        grid.resize();
        grid.updateSectionPosition();
      });
    });
  }
}
if (width > 750) {
  document.addEventListener('DOMContentLoaded', () => {
    new GridSystem();
  });
}
