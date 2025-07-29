import { gsap } from 'gsap';

export default class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('js-cursor');
    this.dot = this.cursor?.querySelector('.u-cursor__dot');

    if (!this.cursor || !this.dot) return;

    this.xTo = gsap.quickTo(this.cursor, "x", { duration: 0.3, ease: "power3.out" });
    this.yTo = gsap.quickTo(this.cursor, "y", { duration: 0.3, ease: "power3.out" });

    this.onMouseMove = (e) => {
      this.xTo(e.clientX);
      this.yTo(e.clientY);
    };

    document.addEventListener('mousemove', this.onMouseMove, { passive: true });

    this.simulateInitialMouseMove();
  }

  simulateInitialMouseMove() {
    const event = new MouseEvent('mousemove', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
    });

    document.dispatchEvent(event);
  }
}
