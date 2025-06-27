// Hover scale effect for animated buttons

import gsap from 'gsap';

export const initHoverAnimations = () => {
  const buttons = document.querySelectorAll('.btn-animated');
  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.1, duration: 0.2 });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.2 });
    });
  });
};