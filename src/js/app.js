/**
 * !(i)
 * The code is included in the final file only when a function is called, for example: FLSFunctions.spollers();
 * Or when the entire file is imported, for example: import "files/script.js";
 * Unused code does not end up in the final file.
 */

// Base utilities
import { SetVH } from './modules/SetVH.js';
import BaseHelpers from './helpers/BaseHelpers.js';

// Scroll and animation
import { lenis } from './modules/LenisInit.js';
import { initScrollTriggers } from './modules/ScrollTriggers.js';
import { initHoverAnimations } from './modules/GSAPAnimations.js';
import { AutoTimeline } from './modules/AutoTimeline.js';

// UI effects
import CustomCursor from './modules/CustomCursor.js';

// UI controls
import HeaderBtnToggle from './modules/HeaderBtnToggle.js';
import PopupManager from './modules/PopupManager.js';

// Preloader
import { Preloader } from './modules/Preloader.js';

document.addEventListener('DOMContentLoaded', () => {
  const preloaderCanvas = document.getElementById('js-preloader-canvas');
  if (preloaderCanvas) {
    const preloader = new Preloader({
      squareSizeMobile: 60,
      squareSizeDesktop: 80,
      color: '#ffffff',
      minLoadingTime: 1200,
      holdFullScreenTime: 1500,
      maxPercent: 99,
      fadeDuration: 300,
      fadeOutDuration: 1200,
    });
    preloader.init();
  }

  SetVH();
  BaseHelpers.checkWebpSupport();
  BaseHelpers.addTouchClass();
  // Не викликаємо BaseHelpers.addLoadedClass(); — прелоадер зробить це сам

  initHoverAnimations();
  initScrollTriggers();
  AutoTimeline();

  new CustomCursor();
  new HeaderBtnToggle();
  new PopupManager();
});

window.addEventListener('load', () => {
  lenis.resize();
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 300);
});