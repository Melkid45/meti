document.addEventListener('DOMContentLoaded', () => {

  const controller = new ScrollMagic.Controller();
  const isFullEffect = window.innerWidth > 750;
  const isMobile = window.innerWidth <= 750;
  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function drawImageCover(ctx, img, canvasWidth, canvasHeight) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  class CombinedImageEffect {
    constructor(media) {
      this.media = media;
      this.img = media.querySelector('img');
      this.canvas = media.querySelector('.grid-canvas-case');
      this.ctx = this.canvas.getContext('2d');

      this.pixelSize = 40;
      this.pixelCanvas = document.createElement('canvas');
      this.pixelCtx = this.pixelCanvas.getContext('2d');

      this.isGridActive = false;
      this.mouse = { x: -1000, y: -1000 };
      this.originalCanvas = document.createElement('canvas');
      this.originalCtx = this.originalCanvas.getContext('2d');
      this.blurCanvas = document.createElement('canvas');
      this.blurCtx = this.blurCanvas.getContext('2d');
      this.zoomCanvas = document.createElement('canvas');
      this.zoomCtx = this.zoomCanvas.getContext('2d');

      this.rafId = null;
      this.isInitialized = false;
      this.isBlurWorking = false;
      this.isBlurDone = false;

      this.settings = {
        cellSize: 54,
        effectRadius: 120,
        blurRadius: 120,
        fillColor: 'rgba(244,244,244,0.9)',
        zoomFactor: 5,
        zoomRadius: 120,
        zoomTransition: 0.25
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
        drawImageCover(this.originalCtx, this.img, this.originalCanvas.width, this.originalCanvas.height);

        if (isFullEffect) {
          this.blurCanvas.width = this.canvas.width;
          this.blurCanvas.height = this.canvas.height;
          this.zoomCanvas.width = this.canvas.width;
          this.zoomCanvas.height = this.canvas.height;
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

      this.originalCanvas.width = this.canvas.width;
      this.originalCanvas.height = this.canvas.height;
      drawImageCover(this.originalCtx, this.img, this.originalCanvas.width, this.originalCanvas.height);

      if (isFullEffect) {
        this.blurCanvas.width = this.canvas.width;
        this.blurCanvas.height = this.canvas.height;
        this.zoomCanvas.width = this.canvas.width;
        this.zoomCanvas.height = this.canvas.height;
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
      this.pixelCtx.drawImage(
        this.originalCanvas,
        0, 0, this.originalCanvas.width, this.originalCanvas.height,
        0, 0, this.pixelCanvas.width, this.pixelCanvas.height
      );

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        this.pixelCanvas,
        0, 0, this.pixelCanvas.width, this.pixelCanvas.height,
        0, 0, canvas.width, canvas.height
      );
    }

    drawGrid() {
      if (!isFullEffect) return;
      if (!this.blurCanvas || !this.isBlurDone) return;

      const { cellSize, effectRadius, zoomFactor, zoomRadius, zoomTransition } = this.settings;
      const cx = this.mouse.x;
      const cy = this.mouse.y;

      const startCol = Math.max(0, Math.floor((cx - effectRadius) / cellSize));
      const endCol = Math.min(Math.ceil(this.canvas.width / cellSize), Math.ceil((cx + effectRadius) / cellSize));
      const startRow = Math.max(0, Math.floor((cy - effectRadius) / cellSize));
      const endRow = Math.min(Math.ceil(this.canvas.height / cellSize), Math.ceil((cy + effectRadius) / cellSize));

      const effectRadiusSq = effectRadius * effectRadius;
      const zoomRadiusSq = zoomRadius * zoomRadius;

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const centreX = cellX + cellSize / 2;
          const centreY = cellY + cellSize / 2;
          const distSq = (centreX - cx) * (centreX - cx) + (centreY - cy) * (centreY - cy);

          if (distSq < effectRadiusSq) {
            this.ctx.drawImage(
              this.blurCanvas,
              cellX, cellY, cellSize, cellSize,
              cellX, cellY, cellSize, cellSize
            );

            const dist = Math.sqrt(distSq);
            const alpha = 0.01 * (1 - dist / effectRadius);
            this.ctx.fillStyle = `rgba(244,244,244,${alpha.toFixed(3)})`;
            this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }
        }
      }

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const centreX = cellX + cellSize / 2;
          const centreY = cellY + cellSize / 2;
          const distSq = (centreX - cx) * (centreX - cx) + (centreY - cy) * (centreY - cy);

          if (distSq < zoomRadiusSq) {
            const dist = Math.sqrt(distSq);
            const zoomStrength = 1 - dist / zoomRadius;
            const currentZoom = 1 + (zoomFactor - 1) * zoomStrength;

            const srcSize = cellSize / currentZoom;
            const destSize = cellSize;

            const srcCenterX = cellX + cellSize / 2 - (cx - (cellX + cellSize / 2)) * (currentZoom - 1);
            const srcCenterY = cellY + cellSize / 2 - (cy - (cellY + cellSize / 2)) * (currentZoom - 1);

            const srcX = srcCenterX - srcSize / 2;
            const srcY = srcCenterY - srcSize / 2;

            const safeSrcX = Math.max(0, Math.min(this.originalCanvas.width - srcSize, srcX));
            const safeSrcY = Math.max(0, Math.min(this.originalCanvas.height - srcSize, srcY));

            this.zoomCtx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);

            this.zoomCtx.drawImage(
              this.originalCanvas,
              safeSrcX, safeSrcY, srcSize, srcSize,
              cellX, cellY, destSize, destSize
            );

            const transitionAlpha = Math.min(1, zoomStrength / zoomTransition);
            this.ctx.globalAlpha = transitionAlpha;
            this.ctx.drawImage(
              this.zoomCanvas,
              cellX, cellY, destSize, destSize,
              cellX, cellY, destSize, destSize
            );
            this.ctx.globalAlpha = 1.0;
          }
        }
      }
    }

    requestRender() {
      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => {
        this.renderPixelated(this.pixelSize);
        if (isFullEffect && this.isGridActive) {
          this.drawGrid();
        }
        this.rafId = null;
      });
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

  const container = document.querySelector('.case__soft');
  const allItems = Array.from(container.querySelectorAll('.item'));
  const loadMoreBtn = document.querySelector('.load-more');

  const ITEMS_PER_PAGE = 3;
  let visibleItemsCount = ITEMS_PER_PAGE;

  function initItemsVisibility() {
    if (isMobile) {
      allItems.forEach((item, index) => {
        if (index < visibleItemsCount) {
          item.classList.add('item--visible');
          item.style.display = 'flex';
        } else {
          item.classList.remove('item--visible');
          item.style.display = 'none';
        }
      });

      if (visibleItemsCount >= allItems.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'flex';
      }
    } else {
      allItems.forEach((item, index) => {
        item.classList.add('item--visible');
        item.style.display = 'flex';
      });
      loadMoreBtn.style.display = 'none';
    }
  }

  initItemsVisibility();

  const effects = [];
  let loadedCount = 0;
  let ShadowItems;
  function initAllEffects() {
    const visibleItems = container.querySelectorAll('.item--visible');
    ShadowItems = allItems.length - visibleItemsCount
    $('.case-count').text(`[${ShadowItems}]`)
    visibleItems.forEach(item => {
      const media = item.querySelector('.media');
      if (!media._effectInitialized) {
        const effect = new CombinedImageEffect(media);
        effects.push(effect);
        media._effectInitialized = true;

        const img = effect.img;
        const onLoadCounter = () => {
          loadedCount++;
          img.removeEventListener('load', onLoadCounter);
          if (loadedCount === visibleItems.length) {
            initScrollAnimation();
          }
        };

        if (img.complete) {
          setTimeout(() => onLoadCounter(), 0);
        } else {
          img.addEventListener('load', onLoadCounter);
        }
      }
    });
  }

  let masterTl = null;

  function initScrollAnimation() {
    const visibleItems = container.querySelectorAll('.item--visible');

    if (masterTl) {
      masterTl.scrollTrigger.kill();
      masterTl.kill();
      masterTl = null;
    }

    masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".case",
        start: "top top",
        end: () => `+=${window.innerHeight * (visibleItems.length - 1)}`,
        scrub: 0.5,
        pin: true,
        onUpdate: (self) => {
          if (self.progress >= 0.6 && self.progress < 0.9) {
            loadMoreBtn.classList.add('animate');
          } else {
            loadMoreBtn.classList.remove('animate');
          }
        }
      }
    });
    setTimeout(() => {
      Position = masterTl.scrollTrigger.end;
    }, 100);
    visibleItems.forEach((item, i) => {
      const effect = effects.find(e => e.media === item.querySelector('.media'));
      // if (!effect || effect.isAnimated) return;

      // effect.isAnimated = true;
      let moveY = 0;
      if (item.classList.contains('small_case')) {
        moveY = -260;
      }else {
        moveY = -220;
      }
      const duration = 1;
      const pixelDur = 0.5;
      const stagger = isFullEffect ? 0.2 : 0.3;

      if (!isFullEffect) moveY = -240;
      if (window.innerWidth < 500) moveY = -250;

      let lastSize = null;

      const tl = gsap.timeline()
        .fromTo(item,
          { yPercent: 0, opacity: 1 },
          { yPercent: moveY, opacity: 1, duration }
        )
        .to({ size: 40 }, {
          size: 1,
          duration: pixelDur,
          ease: "power2.out",
          onUpdate() {
            const newSize = Math.round(this.targets()[0].size);
            if (newSize !== lastSize) {
              lastSize = newSize;
              effect.pixelSize = newSize;
              effect.requestRender();
            }
          }
        }, 0);

      masterTl.add(tl, i * stagger);
    });
  }

  function refreshScrollAnimation() {
    if (masterTl && masterTl.scrollTrigger) {
      masterTl.scrollTrigger.refresh();
    }
  }
  let lastScrollPosition = 0;
  let Position = 0;
  let count = 0;
  loadMoreBtn.addEventListener('click', () => {
    count++;
    if (isMobile) {
      // Сохраняем текущую позицию скролла ДО добавления элементов
      const currentScroll = lenis.scroll;

      visibleItemsCount += ITEMS_PER_PAGE;
      initItemsVisibility();
      initAllEffects();

      lenis.emit();
      lenis.resize();
      lenis.raf(0);
      const visibleItems = container.querySelectorAll('.item--visible');
      const firstNewItemIndex = visibleItemsCount - ITEMS_PER_PAGE;
      const firstNewItem = visibleItems[firstNewItemIndex];
      if (firstNewItem) {
        const itemRect = firstNewItem.getBoundingClientRect();
        const scrollToPosition = currentScroll + itemRect.top - 100;
        lenis.scrollTo(scrollToPosition, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  });

  window.addEventListener('resize', debounce(() => {
    const newIsMobile = window.innerWidth <= 750;
    if (newIsMobile !== isMobile) {
      window.location.reload();
    } else {
      refreshScrollAnimation();
    }
  }, 250));

  initAllEffects();

  window.addEventListener('beforeunload', () => {
    effects.forEach(e => e.stop && e.stop());
  });

  const VIEWBOX = 130;
  let TEXT_ELEMENTS = Array.from(document.querySelectorAll('[data-circular-text]'));

  const OPTIONS = {
    size: 12,
    radius: 53,
    showPath: true,
    spread: true,
    inside: false,
    texts: []
  };

  const updateAllElements = () => {
    TEXT_ELEMENTS.forEach((el, index) => {
      OPTIONS.texts[index] = el.dataset.circularText || 'Your text • ';

      const path = el.querySelector('.circlePath');
      if (path) {
        path.id = `circlePath${index}`;

        const textPath = el.querySelector('.textPath');
        if (textPath) {
          textPath.setAttribute('href', `#${path.id}`);
          textPath.textContent = OPTIONS.texts[index];
        }
      }
    });

    TEXT_ELEMENTS.forEach((element, index) => {
      const circlePath = element.querySelector('.circlePath');
      const textPath = element.querySelector('.textPath');

      if (!circlePath || !textPath) return;

      const startX = VIEWBOX * 0.5 - OPTIONS.radius;
      const startY = VIEWBOX * 0.5;
      const path = `
        M ${startX}, ${startY}
        a ${OPTIONS.radius},${OPTIONS.radius} 0 1,${OPTIONS.inside ? 0 : 1} ${OPTIONS.radius * 2},0
        a ${OPTIONS.radius},${OPTIONS.radius} 0 1,${OPTIONS.inside ? 0 : 1} -${OPTIONS.radius * 2},0
      `;

      circlePath.setAttribute('d', path);
      textPath.textContent = OPTIONS.texts[index];
      circlePath.style.setProperty('--show', OPTIONS.showPath ? 1 : 0);

      if (OPTIONS.spread) {
        textPath.setAttribute('textLength', Math.PI * 2 * OPTIONS.radius * 0.95);
      } else {
        textPath.removeAttribute('textLength');
      }
    });
  };

  updateAllElements();
});