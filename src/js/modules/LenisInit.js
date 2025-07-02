import Lenis from '@studio-freight/lenis';
import { gsap, ScrollTrigger } from './ScrollTriggerInit.js';

export const lenis = new Lenis({
  smooth: true,
  lerp: 0.1,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: false,
});

// GSAP <-> Lenis proxy for ScrollTrigger
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.body.style.transform ? 'transform' : 'fixed',
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
