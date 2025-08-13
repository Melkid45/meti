class SectionGrid {
  constructor(section, gridSystem) {
    this.section = section;
    this.gridSystem = gridSystem;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cellPool = [];
    this.mouse = { x: -1000, y: -1000, inside: false };
    this.rafId = null;
    this.isActive = true;
    this.sectionTop = 0;

    this.settings = {
      baseSize: 54,
      spacing: 0,
      activationRadius: 120,
      trailLifetime: 200,
      fadeScaleStart: 1.0,
      fadeScaleEnd: 0.0,
      hoverScale: 1.35,
      rotationSpeed: 0,
      gridColor: { r: 140, g: 140, b: 140 },
      cursorColor: { r: 39, g: 39, b: 39 },
      borderWidth: 1,
      offsetX: 0,
      offsetY: 0
    };

    if (section.classList.contains('services__new')) {
      this.settings.offsetX = 1;
      this.settings.offsetY = -23.5;
    }
    if (section.classList.contains('client')) {
      this.settings.offsetX = 0;
      this.settings.offsetY = 11;
    }
    if (section.classList.contains('main')) {
      this.settings.offsetX = 13;
      this.settings.offsetY = 8;
    }
    if (section.classList.contains('feedback')) {
      this.settings.offsetX = 27;
      this.settings.offsetY = -24;
    }
    this.init();
  }

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
    this.canvas.style.zIndex = '0';
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
    this.canvas.width = Math.max(1, Math.floor(this.rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(this.rect.height * dpr));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    const baseSizePx = this.remToPx(this.settings.baseSize);

    this.gridCols = Math.ceil(this.rect.width / baseSizePx);
    this.gridRows = Math.ceil(this.rect.height / baseSizePx);
  }

  initPool() {
    this.cellPool = [];
    const baseSizePx = this.remToPx(this.settings.baseSize);
    const offsetXPx = this.remToPx(this.settings.offsetX);
    const offsetYPx = this.remToPx(this.settings.offsetY);
    const startX = (this.rect.width - (this.gridCols * baseSizePx)) / 2 + offsetXPx;
    const startY = (this.rect.height - (this.gridRows * baseSizePx)) / 2 + offsetYPx;

    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        this.cellPool.push({
          x: startX + x * baseSizePx,
          y: startY + y * baseSizePx,
          width: baseSizePx,
          height: baseSizePx,
          rotation: 0,
          alpha: 1,
          visible: false,
          age: Infinity,
          lastActiveTime: 0,
          borderWidth: Math.max(1, Math.floor(this.remToPx(this.settings.borderWidth))),
          scale: 0
        });
      }
    }
  }

  updateMousePosition(x, y) {
    const rect = this.section.getBoundingClientRect();
    if (rect.top <= y && rect.bottom >= y && rect.left <= x && rect.right >= x) {
      this.mouse.x = x - rect.left;
      this.mouse.y = y - rect.top;
      this.mouse.inside = true;
    } else {
      this.leaveMouse();
    }
  }

  leaveMouse() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
    this.mouse.inside = false;
  }

  updateCells() {
    const now = performance.now();
    const activationRadiusPx = this.remToPx(this.settings.activationRadius);
    const activationRadiusSq = activationRadiusPx * activationRadiusPx;

    let nearest = null;
    let nearestDistSq = Infinity;

    for (let cell of this.cellPool) {
      if (cell.visible && now - cell.lastActiveTime > this.settings.trailLifetime) {
        cell.visible = false;
      }

      if (this.mouse.inside && !this.gridSystem.isIdle()) {
        const cx = cell.x + cell.width / 2;
        const cy = cell.y + cell.height / 2;
        const dx = this.mouse.x - cx;
        const dy = this.mouse.y - cy;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < activationRadiusSq) {
          cell.visible = true;
          cell.lastActiveTime = now;
        }

        if (distanceSq < nearestDistSq) {
          nearestDistSq = distanceSq;
          nearest = cell;
        }
      }
    }

    if (this.mouse.inside && nearest && !this.gridSystem.isIdle()) {
      this.cursorCell = nearest;
      nearest.visible = true;
      nearest.lastActiveTime = now;
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.rect.width, this.rect.height);
    this.ctx.imageSmoothingEnabled = false;

    for (let cell of this.cellPool) {
      if (!cell.visible) continue;

      const size = cell.width;
      const x = Math.floor(cell.x);
      const y = Math.floor(cell.y);

      this.ctx.save();
      this.ctx.translate(x + size / 2, y + size / 2);

      if (cell === this.cursorCell) {
        this.ctx.strokeStyle = 'rgb(39,39,39, 1)';
      } else {
        this.ctx.strokeStyle = 'rgb(39,39,39, 1)';
      }

      this.ctx.lineWidth = cell.borderWidth;
      this.ctx.strokeRect(-size / 2, -size / 2, size, size);

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

class GridSystem {
  constructor() {
    this.sectionGrids = [];
    this.mouse = { x: -1000, y: -1000 };
    this.scrollY = window.scrollY;
    this.lastScrollY = window.scrollY;
    this.lastMouseMoveTime = performance.now();
    this.idleTimeout = 200; // время бездействия в мс
    this.init();
  }

  init() {
    const sections = document.querySelectorAll('[data-grid="true"]');
    sections.forEach(section => {
      this.sectionGrids.push(new SectionGrid(section, this));
    });

    document.addEventListener('mousemove', (e) => {
      this.lastMouseMoveTime = performance.now();
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.sectionGrids.forEach(grid => {
        const rect = grid.section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          grid.updateMousePosition(e.clientX, e.clientY);
        } else {
          grid.leaveMouse();
        }
      });
    });

    document.addEventListener('mouseout', () => {
      this.sectionGrids.forEach(grid => grid.leaveMouse());
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
        grid.initPool();
      });
    });
  }

  isIdle() {
    return performance.now() - this.lastMouseMoveTime > this.idleTimeout;
  }
}

if (window.innerWidth > 750) {
  document.addEventListener('DOMContentLoaded', () => {
    new GridSystem();
  });
}
