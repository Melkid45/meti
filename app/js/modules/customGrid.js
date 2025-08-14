class BodyGrid {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.settings = {
      baseSize: 54, // px
      activationRadius: 120, // px
      trailLifetime: 100, // ms
      gridColor: { r: 39, g: 39, b: 39 },
      borderWidth: 1,
      disappearChance: 0.25 // шанс исчезновения
    };

    this.cells = new Map();
    this.mouse = { x: -1000, y: -1000, inside: false };
    this.lastMouseMoveTime = performance.now();
    this.idleTimeout = 100;

    this.initCanvas();
    this.addEvents();
    this.animate();
  }

  initCanvas() {
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "2";
    document.body.appendChild(this.canvas);

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
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
    document.addEventListener("mousemove", (e) => {
      this.lastMouseMoveTime = performance.now();
      this.mouse.x = e.clientX + window.scrollX;
      this.mouse.y = e.clientY + window.scrollY;
      this.mouse.inside = true;
    });

    document.addEventListener("mouseout", () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.inside = false;
    });

    window.addEventListener("scroll", () => {}, { passive: true });
  }

  isIdle() {
    return performance.now() - this.lastMouseMoveTime > this.idleTimeout;
  }

  updateCells() {
    const now = performance.now();
    const radius = this.settings.activationRadius;
    const baseSizePx = this.settings.baseSize;

    if (this.mouse.inside && !this.isIdle()) {
      const mx = this.mouse.x;
      const my = this.mouse.y;
      const startX = Math.floor((mx - radius) / baseSizePx);
      const endX = Math.floor((mx + radius) / baseSizePx);
      const startY = Math.floor((my - radius) / baseSizePx);
      const endY = Math.floor((my + radius) / baseSizePx);

      for (let gy = startY; gy <= endY; gy++) {
        for (let gx = startX; gx <= endX; gx++) {
          const cx = gx * baseSizePx;
          const cy = gy * baseSizePx;
          const dx = mx - (cx + baseSizePx / 2);
          const dy = my - (cy + baseSizePx / 2);
          if (dx * dx + dy * dy <= radius * radius) {
            const key = `${gx}_${gy}`;
            this.cells.set(key, { lastActive: now, life: this.settings.trailLifetime });
          }
        }
      }
    }

    for (let [key, cell] of this.cells) {
      cell.life -= 16; // примерно кадр
      if (cell.life <= 0) {
        if (Math.random() < this.settings.disappearChance) {
          this.cells.delete(key);
        } else {
          // Продлеваем жизнь на 50–100мс
          cell.life = 50 + Math.random() * 50;
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const baseSizePx = this.settings.baseSize;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = `rgb(${this.settings.gridColor.r},${this.settings.gridColor.g},${this.settings.gridColor.b})`;
    ctx.lineWidth = this.settings.borderWidth / this.pixelRatio;

    const startX = Math.floor(scrollX / baseSizePx) - 1;
    const endX = Math.floor((scrollX + viewWidth) / baseSizePx) + 1;
    const startY = Math.floor(scrollY / baseSizePx) - 1;
    const endY = Math.floor((scrollY + viewHeight) / baseSizePx) + 1;

    for (let gy = startY; gy <= endY; gy++) {
      for (let gx = startX; gx <= endX; gx++) {
        const key = `${gx}_${gy}`;
        if (this.cells.has(key)) {
          ctx.strokeRect(
            gx * baseSizePx - scrollX,
            gy * baseSizePx - scrollY,
            baseSizePx,
            baseSizePx
          );
        }
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
    new BodyGrid();
  });
}
