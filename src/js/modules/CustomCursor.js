import { gsap } from 'gsap';

export default class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('js-cursor');
    this.dot = this.cursor?.querySelector('.u-cursor__dot');

    if (!this.cursor || !this.dot) return;

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.init();
  }

  init() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e) {
    gsap.to(this.cursor, {
      duration: 0.3,
      x: e.clientX,
      y: e.clientY,
      ease: 'power3.out',
    });
  }
}