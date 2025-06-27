import MobileChecker from './MobileChecker.js';

class BaseHelpers {
  static html = document.documentElement;
  static header = document.querySelector('.js-header-sticky');
  static firstScreen = document.querySelector('[data-observ]');

  /**
   * Check browser support for .webp images
   * (i) required for proper display of webp images in CSS
   */
  static checkWebpSupport() {
    /** Check for webp support */
    const testWebp = (callback) => {
      const webP = new Image();

      webP.onload = webP.onerror = () => callback(webP.height === 2);
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };

    /** Add class _webp or _no-webp to HTML */
    testWebp((support) => {
      const className = support ? 'webp' : 'no-webp';
      this.html.classList.add(className);

    });
  }

  /**
   * Add touch class to HTML if the browser is mobile
   */
  static addTouchClass() {
    if (MobileChecker.isAny) {
      this.html.classList.add('touch');
    }
  }

  /**
   * Add loaded class to HTML after the page is fully loaded
   */
  static addLoadedClass() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.html.classList.add('is-loaded');
      }, 10);
    });
  }

  /** Get the hash from the site's address */
  static get getHash() {
    return location.hash?.replace('#', '');
  }

  /** Set the hash in the site's address */
  static setHash(hash) {
    hash = hash ? `#${hash}` : location.href.split('#')[0];
    history.pushState('', '', hash);
  }

  /** Function for a Fixed Header on Scroll */
  static headerFixed() {
    const headerStickyObserver = new IntersectionObserver(([entry]) => {
      this.header.classList.toggle('is-sticky', !entry.isIntersecting);
    });

    if (this.firstScreen) {
      headerStickyObserver.observe(this.firstScreen);
    }
  }
}

export default BaseHelpers;
