import { gsap, ScrollTrigger } from './ScrollTriggerInit.js';

export const AnimateOnScroll = () => {
  const groups = {};

  document.querySelectorAll('[data-timeline]').forEach(el => {
    const group = el.dataset.timeline;
    if (!groups[group]) groups[group] = [];
    groups[group].push(el);
  });

  Object.entries(groups).forEach(([_, elements]) => {
    const first = elements[0];

    const stagger = parseFloat(first.dataset.stagger) || 0.1;
    const animationType = first.dataset.animate || 'fade-up';
    const duration = parseFloat(first.dataset.duration) || 0.8;
    const delay = parseFloat(first.dataset.delay) || 0;

    const base = {
      'fade-up': { y: 50, x: 0 },
      'fade-in': { y: 0, x: 0 },
      'fade-left': { y: 0, x: -50 },
      'fade-right': { y: 0, x: 50 },
    };

    gsap.set(elements, { opacity: 0, ...base[animationType] });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: first,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true,
      },
      delay: delay,
    });

    tl.to(elements, {
      opacity: 1,
      x: 0,
      y: 0,
      stagger,
      duration,
      ease: 'power2.out',
      clearProps: 'all',
    });
  });
};
