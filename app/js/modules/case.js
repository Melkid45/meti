document.addEventListener('DOMContentLoaded', () => {
  const width = window.innerWidth;
  const controller = new ScrollMagic.Controller();
  const isFullEffect = width > 750;

  class CombinedImageEffect {
    constructor(media) {
      this.media = media;
      this.img = media.querySelector('img');
      this.canvas = media.querySelector('.grid-canvas-case');
      this.ctx = this.canvas.getContext('2d');

      this.pixelSize = 20;
      this.isGridActive = false;
      this.mouse = { x: -1000, y: -1000 };

      if (isFullEffect) {
        this.blurCanvas = document.createElement('canvas');
        this.blurCtx = this.blurCanvas.getContext('2d');
      }

      this.settings = {
        cellSize: 54,
        effectRadius: 120,
        blurRadius: 10,
        fillColor: 'rgba(244,244,244,0.9)'
      };

      this.img.onload = () => this.init();
      if (this.img.complete) this.init();

      this.setupEvents();
    }

    init() {
      this.resizeCanvas();

      // Оригинальный canvas для рендера без эффектов
      this.originalCanvas = document.createElement('canvas');
      this.originalCanvas.width = this.canvas.width;
      this.originalCanvas.height = this.canvas.height;
      this.originalCtx = this.originalCanvas.getContext('2d');
      this.originalCtx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

      if (isFullEffect) {
        this.blurCanvas.width = this.canvas.width;
        this.blurCanvas.height = this.canvas.height;
        this.blurCtx.drawImage(this.originalCanvas, 0, 0);
        this.applyBlur();
      }

      this.startAnimation();
    }

    resizeCanvas() {
      this.canvas.width = this.media.offsetWidth;
      this.canvas.height = this.media.offsetHeight;
    }

    setupEvents() {
      if (!isFullEffect) return;

      this.media.addEventListener('mousemove', e => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.isGridActive = true;
      });

      this.media.addEventListener('mouseleave', () => {
        this.isGridActive = false;
      });
    }

    applyBlur() {
      const { width, height } = this.blurCanvas;
      const radius = this.settings.blurRadius;
      const ctx = this.blurCtx;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const originalData = new Uint8ClampedArray(data);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, count = 0;

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const pos = (ny * width + nx) * 4;
                r += originalData[pos];
                g += originalData[pos + 1];
                b += originalData[pos + 2];
                count++;
              }
            }
          }

          const pos = (y * width + x) * 4;
          data[pos] = r / count;
          data[pos + 1] = g / count;
          data[pos + 2] = b / count;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    renderPixelated(pixelSize) {
      const ctx = this.ctx;
      const canvas = this.canvas;
      const img = this.originalCanvas;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pixelSize <= 1) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return;
      }

      const smallW = Math.floor(canvas.width / pixelSize);
      const smallH = Math.floor(canvas.height / pixelSize);

      ctx.drawImage(img, 0, 0, smallW, smallH);
      ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
    }

    drawGrid() {
      if (!isFullEffect || !this.isGridActive) return;

      const { cellSize, effectRadius } = this.settings;
      const cx = this.mouse.x;
      const cy = this.mouse.y;

      const startCol = Math.max(0, Math.floor((cx - effectRadius) / cellSize));
      const endCol = Math.min(Math.ceil(this.canvas.width / cellSize), Math.ceil((cx + effectRadius) / cellSize));
      const startRow = Math.max(0, Math.floor((cy - effectRadius) / cellSize));
      const endRow = Math.min(Math.ceil(this.canvas.height / cellSize), Math.ceil((cy + effectRadius) / cellSize));

      const radiusSq = effectRadius * effectRadius;

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const distSq = (cellX + cellSize / 2 - cx) ** 2 + (cellY + cellSize / 2 - cy) ** 2;

          if (distSq < radiusSq) {
            this.ctx.drawImage(this.blurCanvas, cellX, cellY, cellSize, cellSize, cellX, cellY, cellSize, cellSize);
            const dist = Math.sqrt(distSq);
            const alpha = 0.4 * (1 - dist / effectRadius);
            this.ctx.fillStyle = `rgba(244,244,244,${alpha.toFixed(3)})`;
            this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }
        }
      }
    }

    startAnimation() {
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => this.animate());
      }
    }

    animate() {
      this.renderPixelated(this.pixelSize);

      if (isFullEffect) this.drawGrid();

      this.rafId = requestAnimationFrame(() => this.animate());
    }

    stopAnimation() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    setPixelSize(size) {
      this.pixelSize = size;
    }
  }

  const items = document.querySelectorAll('.case__soft .item');
  const effects = [];
  let loadedCount = 0;

  items.forEach((item, idx) => {
    const media = item.querySelector('.media');
    const effect = new CombinedImageEffect(media);
    effects.push(effect);

    effect.img.onload = () => {
      loadedCount++;
      if (loadedCount === items.length) initScrollAnimation();
    };

    if (effect.img.complete) {
      loadedCount++;
      if (loadedCount === items.length) initScrollAnimation();
    }
  });

  function initScrollAnimation() {
    const sceneDuration = items.length * 150 + '%';
    const masterTl = gsap.timeline();

    effects.forEach((effect, i) => {
      const item = items[i];
      const duration = isFullEffect ? 1 : 1.5;
      const pixelDur = isFullEffect ? 0.6 : 0.8;
      const stagger = isFullEffect ? 0.2 : 0.5;

      const tl = gsap.timeline()
        .fromTo(item, { y: 0, opacity: 1 }, { top: '-95%', opacity: 1, duration })
        .to({ size: 20 }, {
          size: 1,
          duration: pixelDur,
          ease: "power2.out",
          onUpdate() {
            effect.setPixelSize(this.targets()[0].size);
          }
        }, 0);

      masterTl.add(tl, i * stagger);
    });

    new ScrollMagic.Scene({
      triggerElement: ".case",
      triggerHook: "onLeave",
      duration: sceneDuration,
      offset: 0
    })
      .setPin(".case")
      .setTween(masterTl)
      .addTo(controller);
  }
});
