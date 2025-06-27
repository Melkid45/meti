import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const lenis = new Lenis({
  smooth: true,
  lerp: 0.1,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: false,
});

// GSAP <-> Lenis proxy
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll;
  },
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
  pinType: document.body.style.transform ? 'transform' : 'fixed',
});

// Sync Lenis scroll updates with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Use GSAP's ticker for smoother + synced raf
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // convert seconds → ms
});

gsap.ticker.lagSmoothing(0); // disable lag smoothing (optional but helpful for smoother frames)