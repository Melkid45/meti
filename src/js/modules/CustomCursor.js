// Custom cursor tracking mouse position smoothly

export default class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('js-cursor');
    this.dot = this.cursor?.querySelector('.u-cursor__dot');

    if (!this.cursor || !this.dot) return;

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: this.pos.x, y: this.pos.y };

    this.init();
  }

  init() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.raf();
  }

  onMouseMove(e) {
    this.target.x = e.clientX;
    this.target.y = e.clientY;
  }

  raf() {
    this.pos.x += (this.target.x - this.pos.x) * 0.15;
    this.pos.y += (this.target.y - this.pos.y) * 0.15;

    this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;

    requestAnimationFrame(this.raf.bind(this));
  }
}