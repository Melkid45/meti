/**
 * !(i)
 * The code is included in the final file only when a function is called, for example: FLSFunctions.spollers();
 * Or when the entire file is imported, for example: import "files/script.js";
 * Unused code does not end up in the final file.
 */

import { ScrollTrigger } from './modules/ScrollTriggerInit.js';

// Preloader
import { Preloader } from './modules/Preloader.js';

// Base
import { SetVH } from './modules/SetVH.js';
import BaseHelpers from './helpers/BaseHelpers.js';

// GSAP core (ScrollTrigger is registered here)

// Scroll
import { lenis } from './modules/LenisInit.js';
import { AnimateOnScroll } from './modules/AnimateOnScroll.js';

// UI
import CustomCursor from './modules/CustomCursor.js';
import HeaderBtnToggle from './modules/HeaderBtnToggle.js';
import PopupManager from './modules/PopupManager.js';
import Feedback from './modules/FeedbackOnScroll.js';
import Video from './modules/AnimateOnScrollVideo.js';
import Intro from './modules/AnimateonScrollIntro.js';
import About from './modules/AboutCursore.js';
import Services from './modules/AnimationServices.js';
// Sketch img effect
import Sketch from './modules/Sketch.js';

// Inline SVG
import { InlineSVG } from './modules/InlineSvg.js';

// align
import GridRhythmAlign from './modules/GridRhythmAlign.js';

document.addEventListener('DOMContentLoaded', () => {
  const preloaderCanvas = document.getElementById('js-preloader-canvas');
  if (preloaderCanvas) {
    const preloader = new Preloader({
      squareSizeMobile: 40,
      squareSizeDesktop: 40,
      color: '#ffffff',
      minLoadingTime: 1200,
      holdFullScreenTime: 1500,
      maxPercent: 99,
      fadeDuration: 300,
      fadeOutDuration: 1200,
      onBeforeDepixelize: () => {
      }
    });

    preloader.init();
  }

  new CustomCursor();

  SetVH();
  BaseHelpers.checkWebpSupport();
  BaseHelpers.addTouchClass();

  new HeaderBtnToggle();
  new PopupManager();

  document.querySelectorAll('.js-glsl-effect').forEach(container => {
    new Sketch({ dom: container });
  });

  AnimateOnScroll();

  InlineSVG.init({
    svgSelector: 'img.js-inlinesvg',
    // initClass: 'js-is-inlinesvg-loaded'
  }, () => {
  });

  new GridRhythmAlign({ lenis });
});

window.addEventListener('load', () => {
  lenis.resize();

  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 300);
});