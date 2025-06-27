import Popup from '../helpers/Popup.js';

class PopupManager extends Popup {
  constructor(options = {}) {
    super();

    const defaultOptions = {
      isOpenClass: 'is-open',
      buttonCloseName: 'js-button-close',
    };

    this.options = Object.assign(defaultOptions, options);

    this.init();
    this.addEventListeners();
  }

  init() {
    this.popups.forEach((popup) => {
      popup.setAttribute('aria-hidden', 'true');
    });
  }

  addEventListeners() {
    document.addEventListener('click', this.togglePopup.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  togglePopup({ target }) {
    const modalButton = target.closest('[data-modal]');
    if (modalButton) {
      event.preventDefault();

      const popup = this.getPopupBySelector(modalButton.dataset.modal);

      this.isOpenElements.forEach((modal) => this.closePopup(modal));
      this.openPopup(popup);
      this.toggleBodyLock(true);
    }

    if (
      target.hasAttribute('data-close-overlay') ||
      target.closest(`.${this.options.buttonCloseName}`)
    ) {
      this.closePopup(target.closest('[data-popup]'));
      this.toggleBodyLock(false);
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      const openModal = document.querySelector(`.${this.options.isOpenClass}`);
      if (openModal) {
        this.closePopup(openModal);
        this.toggleBodyLock(false);
      }
    }
  }

  getPopupBySelector(popupName) {
    return document.querySelector(`[data-popup="${popupName}"]`);
  }

  get popups() {
    return document.querySelectorAll('[data-popup]');
  }

  get isOpenElements() {
    return document.querySelectorAll(`.${this.options.isOpenClass}`);
  }

  openPopup(popup) {
    popup.classList.add(this.options.isOpenClass);
    popup.setAttribute('aria-hidden', 'false');
  }

  closePopup(popup) {
    popup.classList.remove(this.options.isOpenClass);
    popup.setAttribute('aria-hidden', 'true');
  }
}

export default PopupManager;