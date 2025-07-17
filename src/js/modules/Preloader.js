import { lenis } from './LenisInit.js';

export const PreloaderDefaults = {
  squareSizeMobile: 60,
  squareSizeDesktop: 80,
  color: '#ffffff',
  minLoadingTime: 1200,
  holdFullScreenTime: 1500,
  maxPercent: 99,
  fadeDuration: 300,
  fadeOutDuration: 600,
};

export class Preloader {
  constructor(options = {}) {
    const settings = { ...PreloaderDefaults, ...options };

    this.onBeforeDepixelize = settings.onBeforeDepixelize || null;
    this.squareSize = window.innerWidth < 480 ? settings.squareSizeMobile : settings.squareSizeDesktop;
    this.squareColor = settings.color;
    this.minLoadingTime = settings.minLoadingTime;
    this.holdFullScreenTime = settings.holdFullScreenTime;
    this.maxPercent = settings.maxPercent;
    this.fadeDuration = settings.fadeDuration;
    this.fadeOutDuration = settings.fadeOutDuration;

    this.canvas = document.getElementById('js-preloader-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cursorProgress = document.querySelector('#js-cursor-progress span');
    this.cursorWrapper = document.getElementById('js-cursor-progress');
    this.overlay = document.getElementById('js-preloader');

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.maxXCount = 0;
    this.maxYCount = 0;
    this.totalSquaresFull = 0;
    this.availablePositions = [];
    this.squares = [];

    this.loadedPercent = 1;
    this.startTime = null;
    this.loadingFinished = false;
    this.depixelizeStart = null;
    this.calledFinalCallback = false;
    this.lastFrame = 0;

    this.FRAME_INTERVAL = 1000 / 60;

    this.externalProgress = 0;
    this.isExternallyControlled = false;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame((ts) => this.updateLoading(ts));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.maxXCount = Math.floor(this.width / this.squareSize);
    this.maxYCount = Math.floor(this.height / this.squareSize);

    const extraCol = this.width % this.squareSize > 0 ? 1 : 0;
    const extraRow = this.height % this.squareSize > 0 ? 1 : 0;
    this.totalSquaresFull = (this.maxXCount + extraCol) * (this.maxYCount + extraRow);

    this.initAvailablePositions(this.maxXCount + extraCol, this.maxYCount + extraRow);
    this.squares.length = 0;
  }

  initAvailablePositions(cols, rows) {
    this.availablePositions = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.availablePositions.push({ x: x * this.squareSize, y: y * this.squareSize });
      }
    }
  }

  generateSquare(timestamp) {
    if (this.availablePositions.length === 0) return;
    const idx = Math.floor(Math.random() * this.availablePositions.length);
    const pos = this.availablePositions.splice(idx, 1)[0];
    this.squares.push({
      x: pos.x,
      y: pos.y,
      bornTime: timestamp + Math.random() * 300,
      opacity: 0,
      removing: false,
      removeStart: null,
    });
  }

  drawSquares(timestamp) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = this.squares.length - 1; i >= 0; i--) {
      const sq = this.squares[i];
      if (timestamp < sq.bornTime) continue;
      const age = timestamp - sq.bornTime;

      if (!sq.removing) {
        sq.opacity = age >= this.fadeDuration ? 1 : age / this.fadeDuration;
      } else if (sq.removeStart !== null) {
        const fadeOutAge = timestamp - sq.removeStart;
        const fadeOutProgress = fadeOutAge / this.fadeOutDuration;
        if (fadeOutProgress >= 1) {
          this.squares.splice(i, 1);
          continue;
        } else if (fadeOutProgress > 0) {
          sq.opacity = 1 - this.easeInOutQuad(fadeOutProgress);
        }
      }

      this.ctx.fillStyle = `rgba(0,0,255,${sq.opacity.toFixed(2)})`;
      this.ctx.fillRect(sq.x, sq.y, this.squareSize, this.squareSize);
    }
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  setProgress(percent) {
    this.isExternallyControlled = true;
    this.externalProgress = Math.min(100, Math.max(0, percent));
  }

  updateLoading(timestamp) {
    if (timestamp - this.lastFrame < this.FRAME_INTERVAL) {
      requestAnimationFrame((ts) => this.updateLoading(ts));
      return;
    }
    this.lastFrame = timestamp;

    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;

    if (!this.loadingFinished) {
      let progress = this.isExternallyControlled
        ? Math.min(this.externalProgress / 100, 1)
        : Math.min(1, Math.max(
            this.squares.length / (this.totalSquaresFull * 0.99),
            elapsed / this.minLoadingTime
          ));

      const percent = Math.floor(progress * 100);
      this.loadedPercent = Math.max(1, Math.min(percent, this.isExternallyControlled ? 100 : this.maxPercent));
      if (this.cursorProgress) {
        this.cursorProgress.textContent = `${this.loadedPercent < 10 ? '0' : ''}${this.loadedPercent}%`;
      }

      if (!this.isExternallyControlled) {
        const toAdd = Math.floor(progress * this.totalSquaresFull) - this.squares.length;
        for (let i = 0; i < toAdd; i++) {
          this.generateSquare(timestamp);
        }
      }

      this.drawSquares(timestamp);

      if (progress >= 1) {
        this.loadingFinished = true;
        this.depixelizeStart = null;
      }
    } else {
      if (!this.depixelizeStart) {
        if (typeof this.onBeforeDepixelize === 'function') {
          this.onBeforeDepixelize();
        }
        while (this.availablePositions.length > 0) {
          this.generateSquare(timestamp);
        }
        this.drawSquares(timestamp);
        this.depixelizeStart = timestamp + this.holdFullScreenTime;

        if (this.overlay) this.overlay.classList.add('is-hide');
      } else {
        if (timestamp < this.depixelizeStart) {
          this.drawSquares(timestamp);
        } else {
          if (this.cursorWrapper) this.cursorWrapper.classList.add('is-hide');
          const remaining = this.squares.filter(sq => !sq.removing);
          const toRemove = Math.min(20, remaining.length);
          for (let i = 0; i < toRemove; i++) {
            const sq = remaining[Math.floor(Math.random() * remaining.length)];
            sq.removing = true;
            sq.removeStart = timestamp;
          }

          this.drawSquares(timestamp);

          if (!this.calledFinalCallback && this.squares.every(sq => sq.removing && (timestamp - sq.removeStart) > this.fadeOutDuration)) {
            this.canvas.classList.add('is-hide');
            this.calledFinalCallback = true;
            this.onComplete();
          }
        }
      }
    }

    requestAnimationFrame((ts) => this.updateLoading(ts));
  }

  onComplete() {
    if (typeof lenis !== 'undefined') {
      lenis.start();
    }
    document.body.style.overflow = '';
    document.documentElement.classList.add('is-loaded');
  }
}