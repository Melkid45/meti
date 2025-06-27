// GSAP scroll animation for elements with [data-animate]

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const initScrollTriggers = () => {
  ScrollTrigger.refresh();

  const animatedElements = document.querySelectorAll('[data-animate]');
  animatedElements.forEach(el => {
    const animationType = el.dataset.animate;
    const delay = parseFloat(el.dataset.delay) || 0;
    const duration = parseFloat(el.dataset.duration) || 1;

    const animationSettings = {
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: false,
      },
    };

    if (animationType === 'fade-up') animationSettings.y = 50;
    if (animationType === 'fade-in') animationSettings.y = 0;

    gsap.from(el, animationSettings);
  });
};