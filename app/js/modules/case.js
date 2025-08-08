document.addEventListener('DOMContentLoaded', () => {
  const controller = new ScrollMagic.Controller();
  const isFullEffect = window.innerWidth > 750;

  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  class CombinedImageEffect {
    constructor(media) {
      this.media = media;
      this.img = media.querySelector('img');
      this.canvas = media.querySelector('.grid-canvas-case');
      this.ctx = this.canvas.getContext('2d');

      this.pixelSize = 20;
      this.pixelCanvas = document.createElement('canvas');
      this.pixelCtx = this.pixelCanvas.getContext('2d');

      this.isGridActive = false;
      this.mouse = { x: -1000, y: -1000 };
      this.originalCanvas = null;
      this.originalCtx = null;
      this.blurCanvas = null;
      this.blurCtx = null;

      this.rafId = null;
      this.isInitialized = false;
      this.isBlurWorking = false;
      this.isBlurDone = false;
      this.settings = {
        cellSize: 54,
        effectRadius: 120,
        blurRadius: 30,
        fillColor: 'rgba(244,244,244,0.9)'
      };

      this.visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            this.visibilityObserver.unobserve(this.media);
            if (this.img.complete) {
              this.init();
            } else {
              this.img.addEventListener('load', () => this.init(), { once: true });
            }
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '400px'
      });
      const rect = this.media.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400 && rect.bottom > -400 && this.img.complete) {
        this.init();
      } else {
        this.visibilityObserver.observe(this.media);
      }
      this._onResize = debounce(() => {
        if (!this.isInitialized) return;
        this.resizeCanvas();
        this.originalCanvas.width = this.canvas.width;
        this.originalCanvas.height = this.canvas.height;
        this.originalCtx.drawImage(this.img, 0, 0, this.originalCanvas.width, this.originalCanvas.height);
        if (isFullEffect) {
          this.blurCanvas.width = this.canvas.width;
          this.blurCanvas.height = this.canvas.height;
          this.blurCtx.drawImage(this.originalCanvas, 0, 0);
          this.applyBlur();
        }
        this.requestRender();
      }, 200);

      window.addEventListener('resize', this._onResize);
    }

    resizeCanvas() {
      this.canvas.width = this.media.offsetWidth;
      this.canvas.height = this.media.offsetHeight;
    }

    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;
      this.resizeCanvas();
      this.originalCanvas = document.createElement('canvas');
      this.originalCanvas.width = this.canvas.width;
      this.originalCanvas.height = this.canvas.height;
      this.originalCtx = this.originalCanvas.getContext('2d');
      this.originalCtx.drawImage(this.img, 0, 0, this.originalCanvas.width, this.originalCanvas.height);
      if (isFullEffect) {
        this.blurCanvas = document.createElement('canvas');
        this.blurCanvas.width = this.canvas.width;
        this.blurCanvas.height = this.canvas.height;
        this.blurCtx = this.blurCanvas.getContext('2d');
        this.blurCtx.drawImage(this.originalCanvas, 0, 0);
        this.applyBlur();
      }

      this.setupEvents();

      this.requestRender();
    }

    setupEvents() {
      if (!isFullEffect) return;
      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.isGridActive = true;
        this.requestRender();
      };

      this._onMouseLeave = () => {
        this.isGridActive = false;
        this.requestRender();
      };

      this.media.addEventListener('mousemove', this._onMouseMove);
      this.media.addEventListener('mouseleave', this._onMouseLeave);
    }

    applyBlur() {
      if (!this.blurCtx || !this.originalCtx) return;
      if (this.isBlurWorking) return;
      this.isBlurWorking = true;
      this.isBlurDone = false;

      const width = this.blurCanvas.width;
      const height = this.blurCanvas.height;
      const radius = Math.max(0, Math.floor(this.settings.blurRadius));
      const srcImageData = this.originalCtx.getImageData(0, 0, width, height);
      const src = srcImageData.data;
      const W = width, H = height;
      const iw = W + 1;
      const ih = H + 1;
      this.blurCtx.putImageData(srcImageData, 0, 0);
      if (radius === 0) {
        this.isBlurWorking = false;
        this.isBlurDone = true;
        return;
      }
      const len = iw * ih;
      const integralR = new Float64Array(len);
      const integralG = new Float64Array(len);
      const integralB = new Float64Array(len);
      let buildY = 1;
      const buildRowsPerChunk = Math.max(8, Math.floor(200000 / W));

      const buildStep = () => {
        const endY = Math.min(H, buildY + buildRowsPerChunk - 1);
        for (let y = buildY; y <= endY; y++) {
          let rowSumR = 0, rowSumG = 0, rowSumB = 0;
          const srcRowOffset = (y - 1) * W * 4;
          for (let x = 1; x <= W; x++) {
            const sIdx = srcRowOffset + (x - 1) * 4;
            rowSumR += src[sIdx];
            rowSumG += src[sIdx + 1];
            rowSumB += src[sIdx + 2];
            const idx = y * iw + x;
            const idxAbove = (y - 1) * iw + x;
            integralR[idx] = integralR[idxAbove] + rowSumR;
            integralG[idx] = integralG[idxAbove] + rowSumG;
            integralB[idx] = integralB[idxAbove] + rowSumB;
          }
        }
        buildY = endY + 1;
        if (buildY <= H) {
          setTimeout(buildStep, 0);
        } else {
          computeBlurRows(0);
        }
      };
      const rectSum = (intArr, x0, y0, x1, y1) => {
        const A = y0 * iw + x0;
        const B = y0 * iw + (x1 + 1);
        const C = (y1 + 1) * iw + x0;
        const D = (y1 + 1) * iw + (x1 + 1);
        return intArr[D] - intArr[B] - intArr[C] + intArr[A];
      };
      const dstImageData = this.blurCtx.createImageData(W, H);
      const dst = dstImageData.data;

      const computeRowsPerChunk = Math.max(4, Math.floor(100000 / W));
      const self = this;

      function computeBlurRows(startRow) {
        const endRow = Math.min(H - 1, startRow + computeRowsPerChunk - 1);
        for (let y = startRow; y <= endRow; y++) {
          for (let x = 0; x < W; x++) {
            const x0 = Math.max(0, x - radius);
            const x1 = Math.min(W - 1, x + radius);
            const y0 = Math.max(0, y - radius);
            const y1 = Math.min(H - 1, y + radius);

            const count = (x1 - x0 + 1) * (y1 - y0 + 1);

            const rSum = rectSum(integralR, x0, y0, x1, y1);
            const gSum = rectSum(integralG, x0, y0, x1, y1);
            const bSum = rectSum(integralB, x0, y0, x1, y1);

            const idx = (y * W + x) * 4;
            dst[idx] = Math.round(rSum / count);
            dst[idx + 1] = Math.round(gSum / count);
            dst[idx + 2] = Math.round(bSum / count);
            dst[idx + 3] = src[(y * W + x) * 4 + 3];
          }
        }
        try {
          self.blurCtx.putImageData(dstImageData, 0, 0, 0, startRow, W, endRow - startRow + 1);
        } catch (err) {
          self.blurCtx.putImageData(dstImageData, 0, 0);
        }

        if (endRow < H - 1) {
          setTimeout(() => computeBlurRows(endRow + 1), 0);
        } else {
          self.isBlurWorking = false;
          self.isBlurDone = true;
        }
      }
      setTimeout(buildStep, 0);
    }
    renderPixelated(pixelSize) {
      const ctx = this.ctx;
      const canvas = this.canvas;

      if (!this.originalCanvas) {
        if (this.img) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
        }
        return;
      }
      const smallW = Math.max(1, Math.floor(canvas.width / Math.max(1, pixelSize)));
      const smallH = Math.max(1, Math.floor(canvas.height / Math.max(1, pixelSize)));
      if (this.pixelCanvas.width !== smallW || this.pixelCanvas.height !== smallH) {
        this.pixelCanvas.width = smallW;
        this.pixelCanvas.height = smallH;
      }
      this.pixelCtx.clearRect(0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
      this.pixelCtx.drawImage(this.originalCanvas, 0, 0, this.originalCanvas.width, this.originalCanvas.height, 0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.pixelCanvas, 0, 0, this.pixelCanvas.width, this.pixelCanvas.height, 0, 0, canvas.width, canvas.height);
    }

    drawGrid() {
      if (!isFullEffect) return;
      if (!this.blurCanvas) return;

      const { cellSize, effectRadius } = this.settings;
      const cx = this.mouse.x;
      const cy = this.mouse.y;
      if (!this.isGridActive) return;

      const startCol = Math.max(0, Math.floor((cx - effectRadius) / cellSize));
      const endCol = Math.min(Math.ceil(this.canvas.width / cellSize), Math.ceil((cx + effectRadius) / cellSize));
      const startRow = Math.max(0, Math.floor((cy - effectRadius) / cellSize));
      const endRow = Math.min(Math.ceil(this.canvas.height / cellSize), Math.ceil((cy + effectRadius) / cellSize));

      const radiusSq = effectRadius * effectRadius;
      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const centreX = cellX + cellSize / 2;
          const centreY = cellY + cellSize / 2;
          const distSq = (centreX - cx) * (centreX - cx) + (centreY - cy) * (centreY - cy);

          if (distSq < radiusSq) {
            this.ctx.drawImage(this.blurCanvas, cellX, cellY, cellSize, cellSize, cellX, cellY, cellSize, cellSize);

            const dist = Math.sqrt(distSq);
            const alpha = 0.01 * (1 - dist / effectRadius);
            this.ctx.fillStyle = `rgba(244,244,244,${alpha.toFixed(3)})`;
            this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }
        }
      }
    }
    requestRender() {
      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => this.animate());
    }

    animate() {
      this.renderPixelated(this.pixelSize);

      if (isFullEffect) this.drawGrid();

      this.rafId = null;
    }

    stop() {
      window.removeEventListener('resize', this._onResize);
      if (this.media && this._onMouseMove) {
        this.media.removeEventListener('mousemove', this._onMouseMove);
        this.media.removeEventListener('mouseleave', this._onMouseLeave);
      }
      if (this.visibilityObserver) this.visibilityObserver.disconnect();
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    setPixelSize(size) {
      this.pixelSize = size;
      this.requestRender();
    }
  }

  const items = document.querySelectorAll('.case__soft .item');
  const effects = [];
  let loadedCount = 0;

  items.forEach((item, idx) => {
    const media = item.querySelector('.media');
    const effect = new CombinedImageEffect(media);
    effects.push(effect);

    const img = effect.img;
    const onLoadCounter = () => {
      loadedCount++;
      img.removeEventListener('load', onLoadCounter);
      if (loadedCount === items.length) {
        initScrollAnimation();
      }
    };
    img.addEventListener('load', onLoadCounter);

    if (img.complete) {
      setTimeout(() => {
        if (img) {
          try { img.removeEventListener('load', onLoadCounter); } catch (e) {}
        }
        loadedCount++;
        if (loadedCount === items.length) initScrollAnimation();
      }, 0);
    }
  });

  function initScrollAnimation() {
  function getSceneDuration() {
    return (items.length * window.innerHeight) + 200;
  }

  const masterTl = gsap.timeline();

  effects.forEach((effect, i) => {
    const item = items[i];
    const duration = isFullEffect ? 1 : 1.5;
    const pixelDur = isFullEffect ? 0.4 : 0.3;
    const stagger = isFullEffect ? 0.2 : 0.5;

    const tl = gsap.timeline()
      .fromTo(item, { y: 0, opacity: 1 }, { top: '-95%', opacity: 1, duration })
      .to({ size: 20 }, {
        size: 1,
        duration: pixelDur,
        ease: "power2.out",
        onUpdate() {
          const newSize = this.targets()[0].size;
          if (effect && typeof effect.setPixelSize === 'function') {
            effect.setPixelSize(newSize);
          }
        }
      }, 0);

    masterTl.add(tl, i * stagger);
  });

  const scene = new ScrollMagic.Scene({
    triggerElement: ".case",
    triggerHook: "onLeave",
    duration: getSceneDuration(),
    offset: 0
  })
    .setPin(".case")
    .setTween(masterTl)
    .addTo(controller);

  window.addEventListener('resize', () => {
    scene.duration(getSceneDuration());
  });
}


  window.addEventListener('beforeunload', () => {
    effects.forEach(e => e.stop && e.stop());
  });
});
