const ABOUTCONFIG = {
  animCanvas: -250,
  StartAnim: "top top",
  StartAnimPixel: "top top",
  endAnim: "+=30%"
};

if (window.innerWidth <= 820) {
  ABOUTCONFIG.animCanvas = -50;
  ABOUTCONFIG.StartAnim = "top center";
  ABOUTCONFIG.StartAnimPixel = "+=30%";
  ABOUTCONFIG.endAnim = "+=30%";
}

gsap.to('.about-parallax', {
  y: ABOUTCONFIG.animCanvas,
  scrollTrigger: {
    trigger: ".about",
    start: ABOUTCONFIG.StartAnim,
    end: "bottom center",
    scrub: 2,
    ease: "sine.inOut"
  }
});

gsap.to('.ab_dec1', {
  y: 0,
  opacity: 1,
  scrollTrigger: {
    trigger: ".about",
    start: '-=60%',
    end: "-=20%",
    scrub: 2,
    ease: "sine.inOut",
  }
});

gsap.to('.ab_dec2', {
  y: 0,
  opacity: 1,
  scrollTrigger: {
    trigger: ".about",
    start: '-=20%',
    end: "+=40%",
    scrub: 2,
    ease: "sine.inOut"
  }
});

gsap.to('.ab_dec3', {
  y: 0,
  opacity: 1,
  scrollTrigger: {
    trigger: ".about",
    start: '+=10%',
    end: "+=30%",
    scrub: 2,
    ease: "sine.inOut"
  }
});

gsap.to('.benefits__decor--1', {
  y: 0,
  opacity: 1,
  scrollTrigger: {
    trigger: ".benefits",
    start: '-=50%',
    end: "+=30%",
    scrub: 2,
    ease: "sine.inOut"
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const isFullEffect = window.innerWidth > 820;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // Функция для принудительного запуска видео
  async function forceVideoPlay(video) {
    try {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;

      // Сначала ставим на паузу и сбрасываем
      video.pause();
      video.currentTime = 0;

      // Ждем немного и пытаемся запустить
      await new Promise(resolve => setTimeout(resolve, 100));

      const playPromise = video.play();

      if (playPromise !== undefined) {
        await playPromise;
        return true;
      }
      return true;
    } catch (error) {

      // Создаем фиктивное событие клика для обхода ограничений
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(clickEvent);

      // Пробуем еще раз после симуляции события
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        await video.play();
        return true;
      } catch (e) {
        console.error('Final video play error:', e);
        return false;
      }
    }
  }

  class PixelationEffect {
    constructor(mediaElement) {
      this.media = mediaElement;
      this.video = mediaElement.querySelector('video');
      this.canvas = mediaElement.querySelector('.grid-canvas-case');
      this.ctx = this.canvas.getContext('2d');

      this.isVideo = this.video && this.video.src.toLowerCase().match(/\.(mp4|webm|ogg)$/);
      this.currentVideoFrame = null;

      this.pixelSize = { value: 40 };
      this.isPixelationComplete = false;

      this.originalCanvas = document.createElement('canvas');
      this.originalCtx = this.originalCanvas.getContext('2d');

      this.pixelCanvas = document.createElement('canvas');
      this.pixelCtx = this.pixelCanvas.getContext('2d');

      this.blurCanvas = document.createElement('canvas');
      this.blurCtx = this.blurCanvas.getContext('2d');
      this.zoomCanvas = document.createElement('canvas');
      this.zoomCtx = this.zoomCanvas.getContext('2d');

      this.isGridActive = false;
      this.mouse = { x: -1000, y: -1000 };
      this.settings = {
        cellSize: 54,
        effectRadius: 120,
        blurRadius: 120,
        fillColor: 'rgba(244,244,244,0.9)',
        zoomFactor: 5,
        zoomRadius: 120,
        zoomTransition: 0.25
      };

      this.isInitialized = false;
      this.isBlurWorking = false;
      this.isBlurDone = false;

      this.lastVideoUpdate = 0;
      this.videoFrameRate = 1000 / 30;
      this.isVideoPlaying = false;

      if (this.isVideo) {
        this.initVideo();
      } else {
        console.error('Video element not found');
      }

      this._onResize = debounce(() => {
        if (!this.isInitialized) return;
        this.resizeAll();
        this.updateOriginalCanvas();
        if (isFullEffect && !isTouchDevice) {
          this.blurCtx.drawImage(this.originalCanvas, 0, 0);
          this.applyBlur();
        }
      }, 200);
      window.addEventListener('resize', this._onResize);
    }

    async initVideo() {
      this.video.muted = true;
      this.video.loop = true;
      this.video.playsInline = true;
      this.video.setAttribute('preload', 'auto');
      this.video.setAttribute('autoplay', 'true');

      // Ждем когда видео будет готово к воспроизведению
      this.video.addEventListener('loadeddata', () => {
        this.startVideoPlayback();
      });

      this.video.addEventListener('canplay', () => {
        this.startVideoPlayback();
      });

      this.video.addEventListener('play', () => {
        this.isVideoPlaying = true;
        this.init();
        this.startVideoAnimation();
      });

      this.video.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
      });

      // Предзагрузка видео
      this.video.load();

      // Принудительно пытаемся запустить сразу
      await this.startVideoPlayback();
    }

    async startVideoPlayback() {
      if (this.isVideoPlaying) return;

      const success = await forceVideoPlay(this.video);
      if (success) {
        this.isVideoPlaying = true;
        this.init();
        this.startVideoAnimation();
      }
    }

    updateVideoFrame() {
      if (!this.video || this.video.readyState < 2) return;

      try {
        this.drawImageCover(this.originalCtx, this.video, this.originalCanvas.width, this.originalCanvas.height);

        if (isFullEffect && this.isBlurDone && !isTouchDevice) {
          this.blurCtx.drawImage(this.originalCanvas, 0, 0);
          this.applyBlur();
        }
      } catch (error) {
        console.log('Error drawing video frame:', error);
      }
    }

    updateOriginalCanvas() {
      if (this.isVideo && this.video.readyState >= 2) {
        this.drawImageCover(this.originalCtx, this.video, this.originalCanvas.width, this.originalCanvas.height);
      } else {
        // Fallback: черный фон
        this.originalCtx.fillStyle = '#000000';
        this.originalCtx.fillRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
      }
    }

    resizeAll() {
      this.canvas.width = this.media.offsetWidth;
      this.canvas.height = this.media.offsetHeight;

      this.originalCanvas.width = this.canvas.width;
      this.originalCanvas.height = this.canvas.height;

      this.pixelCanvas.width = Math.max(1, Math.floor(this.canvas.width / Math.max(1, this.pixelSize.value)));
      this.pixelCanvas.height = Math.max(1, Math.floor(this.canvas.height / Math.max(1, this.pixelSize.value)));

      this.blurCanvas.width = this.canvas.width;
      this.blurCanvas.height = this.canvas.height;

      this.zoomCanvas.width = this.canvas.width;
      this.zoomCanvas.height = this.canvas.height;
    }

    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      this.resizeAll();
      this.updateOriginalCanvas();

      if (isFullEffect && !isTouchDevice) {
        this.blurCtx.drawImage(this.originalCanvas, 0, 0);
        this.applyBlur();
      }

      this.setupEvents();
      this.setupScrollAnimation();
      this.render();
    }

    startVideoAnimation() {
      if (!this.isVideo) return;

      const animate = (timestamp) => {
        if (this.isVideoPlaying && timestamp - this.lastVideoUpdate > this.videoFrameRate) {
          this.lastVideoUpdate = timestamp;
          this.updateVideoFrame();
        }
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }

    drawImageCover(ctx, media, canvasWidth, canvasHeight) {
      const mediaRatio = media.videoWidth / media.videoHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > mediaRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / mediaRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * mediaRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(media, offsetX, offsetY, drawWidth, drawHeight);
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
      const canvas = this.canvas;
      const ctx = this.ctx;

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
      if (!isFullEffect && isTouchDevice) return;
      if (!this.blurCanvas || !this.isBlurDone) return;

      const { cellSize, effectRadius, zoomFactor, zoomRadius } = this.settings;
      const cx = this.mouse.x;
      const cy = this.mouse.y;

      // Полностью очищаем canvas перед каждой отрисовкой
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Сначала рисуем основное пикселизированное изображение
      this.renderPixelated(this.pixelSize.value);

      const startCol = Math.max(0, Math.floor((cx - effectRadius) / cellSize));
      const endCol = Math.min(Math.ceil(this.canvas.width / cellSize), Math.ceil((cx + effectRadius) / cellSize));
      const startRow = Math.max(0, Math.floor((cy - effectRadius) / cellSize));
      const endRow = Math.min(Math.ceil(this.canvas.height / cellSize), Math.ceil((cy + effectRadius) / cellSize));

      const effectRadiusSq = effectRadius * effectRadius;
      const zoomRadiusSq = zoomRadius * zoomRadius;

      // Рисуем размытые области
      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const centreX = cellX + cellSize / 2;
          const centreY = cellY + cellSize / 2;
          const distSq = (centreX - cx) * (centreX - cx) + (centreY - cy) * (centreY - cy);

          if (distSq < effectRadiusSq) {
            // Рисуем размытую область
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(
              this.blurCanvas,
              cellX, cellY, cellSize, cellSize,
              cellX, cellY, cellSize, cellSize
            );
            this.ctx.restore();

            // Добавляем свечение
            const dist = Math.sqrt(distSq);
            const alpha = 0.05 * (1 - dist / effectRadius);
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'lighten';
            this.ctx.fillStyle = `rgba(244,244,244,${Math.max(0.02, alpha)})`;
            this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
            this.ctx.restore();
          }
        }
      }

      // Рисуем zoom области поверх всего
      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          const cellX = x * cellSize;
          const cellY = y * cellSize;
          const centreX = cellX + cellSize / 2;
          const centreY = cellY + cellSize / 2;
          const distSq = (centreX - cx) * (centreX - cx) + (centreY - cy) * (centreY - cy);

          if (distSq < zoomRadiusSq) {
            const dist = Math.sqrt(distSq);
            const zoomStrength = Math.max(0, 1 - dist / zoomRadius);
            const currentZoom = 1 + (zoomFactor - 1) * zoomStrength;

            const srcSize = cellSize / currentZoom;
            const destSize = cellSize;

            const srcCenterX = cellX + cellSize / 2 - (cx - (cellX + cellSize / 2)) * (currentZoom - 1);
            const srcCenterY = cellY + cellSize / 2 - (cy - (cellY + cellSize / 2)) * (currentZoom - 1);

            const srcX = srcCenterX - srcSize / 2;
            const srcY = srcCenterY - srcSize / 2;

            const safeSrcX = Math.max(0, Math.min(this.originalCanvas.width - srcSize, srcX));
            const safeSrcY = Math.max(0, Math.min(this.originalCanvas.height - srcSize, srcY));

            // Рисуем увеличенную область
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.drawImage(
              this.originalCanvas,
              safeSrcX, safeSrcY, srcSize, srcSize,
              cellX, cellY, destSize, destSize
            );
            this.ctx.restore();
          }
        }
      }
    }

    render() {
      if (!this.isInitialized) return;

      if (this.isPixelationComplete) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.originalCanvas, 0, 0);

        // Если пикселизация завершена, рисуем сетку поверх
        if (isFullEffect && !isTouchDevice && this.isGridActive) {
          this.drawGrid();
        }
      } else {
        this.renderPixelated(this.pixelSize.value);

        // Если еще пикселизируется, рисуем сетку поверх пикселей
        if (isFullEffect && !isTouchDevice && this.isGridActive) {
          this.drawGrid();
        }
      }

      requestAnimationFrame(() => this.render());
    }

    setupScrollAnimation() {
      gsap.to(this.pixelSize, {
        value: 1,
        scrollTrigger: {
          trigger: ".about",
          start: ABOUTCONFIG.StartAnimPixel,
          end: ABOUTCONFIG.endAnim,
          scrub: 1,
          ease: "sine.inOut",
          onComplete: () => {
            this.isPixelationComplete = true;
          }
        }
      });
    }

    setupEvents() {
      if (!isFullEffect && isTouchDevice) return;

      this.media.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.isGridActive = true;
      });

      this.media.addEventListener('mouseleave', () => {
        this.isGridActive = false;
      });
    }
  }

  function initHeavyElements() {
    const mediaElements = document.querySelectorAll('.about_canva');
    mediaElements.forEach(media => {
      new PixelationEffect(media);
    });
  }

  // Запускаем сразу
  setTimeout(initHeavyElements, 500);
});