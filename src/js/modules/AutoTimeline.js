// Auto GSAP timeline from grouped [data-timeline] elements

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export const AutoTimeline = () => {
  const groups = {};

  // Group elements by data-timeline name
  document.querySelectorAll('[data-timeline]').forEach(el => {
    const groupName = el.dataset.timeline;
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(el);
  });

  // Create GSAP timeline per group
  Object.entries(groups).forEach(([groupName, elements]) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });

    elements.forEach(el => {
      const animationType = el.dataset.animate || 'fade-up';
      const delay = parseFloat(el.dataset.delay) || 0;
      const duration = parseFloat(el.dataset.duration) || 1;

      let animProps = {
        opacity: 0,
        duration,
        ease: 'power2.out',
      };

      // Set direction
      if (animationType === 'fade-up') animProps.y = 50;
      else if (animationType === 'fade-in') animProps.y = 0;
      else if (animationType === 'fade-left') animProps.x = -50;
      else if (animationType === 'fade-right') animProps.x = 50;

      // Add to timeline
      tl.from(el, animProps, `+=${delay}`);
    });
  });
};