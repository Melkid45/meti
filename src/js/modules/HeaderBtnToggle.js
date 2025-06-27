class HeaderBtnToggle {
  constructor() {
    this.burgerButton = document.querySelector('.js-header-toggle-open');
    this.closeButton = document.querySelector('.js-header-toggle-close');
    this.body = document.body;
    this.headerNav = document.querySelector('.header__aside');
    
    if (this.burgerButton) {
      this.burgerButton.addEventListener('click', () => this.toggleMenu());
    }
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closeMenu());
    }
  }
  
  toggleMenu() {
    this.burgerButton.classList.toggle('is-active');
    this.body.classList.toggle('is-menu-opened');
    this.headerNav.classList.toggle('is-show');
  }

  closeMenu() {
    if (this.burgerButton) {
      this.burgerButton.classList.remove('is-active');
    }
    this.body.classList.remove('is-menu-opened');
    this.headerNav.classList.remove('is-show');
  }
}

export default HeaderBtnToggle;