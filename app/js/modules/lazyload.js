document.addEventListener('DOMContentLoaded', function() {
  class SimpleLazyLoader {
    constructor() {
      this.images = [];
      this.observer = null;
      this.init();
    }

    init() {
      // Находим все изображения с data-src
      this.images = document.querySelectorAll('img[data-src]');
      
      if (this.images.length === 0) return;

      // Если IntersectionObserver не поддерживается - грузим все сразу
      if (!('IntersectionObserver' in window)) {
        this.loadAllImages();
        return;
      }

      this.setupObserver();
    }

    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '100px 0px',
        threshold: 0.01
      });

      // Наблюдаем за каждым изображением
      this.images.forEach(img => {
        this.observer.observe(img);
      });
    }

    loadImage(img) {
      const src = img.getAttribute('data-src');
      if (!src) return;

      // Создаем временное изображение для предзагрузки
      const tempImage = new Image();
      
      tempImage.onload = () => {
        // Заменяем src и добавляем класс для плавного появления
        img.src = src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
        
        // Удаляем placeholder если есть
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('lazy-placeholder')) {
          setTimeout(() => {
            placeholder.remove();
          }, 300);
        }
      };

      tempImage.onerror = () => {
        console.error('Ошибка загрузки изображения:', src);
        img.classList.add('loaded'); // Все равно показываем
      };

      tempImage.src = src;
    }

    loadAllImages() {
      this.images.forEach(img => {
        this.loadImage(img);
      });
    }
  }

  // Инициализация lazy load
  new SimpleLazyLoader();
});

// Для фоновых изображений (если нужно)
class BackgroundLazyLoader {
  constructor() {
    this.elements = document.querySelectorAll('[data-bg]');
    this.init();
  }

  init() {
    if (this.elements.length === 0) return;
    
    if (!('IntersectionObserver' in window)) {
      this.loadAllBackgrounds();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadBackground(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '150px 0px',
      threshold: 0.01
    });

    this.elements.forEach(el => {
      observer.observe(el);
    });
  }

  loadBackground(el) {
    const bgUrl = el.getAttribute('data-bg');
    if (!bgUrl) return;

    const tempImg = new Image();
    tempImg.onload = () => {
      el.style.backgroundImage = `url('${bgUrl}')`;
      el.removeAttribute('data-bg');
    };
    tempImg.src = bgUrl;
  }

  loadAllBackgrounds() {
    this.elements.forEach(el => {
      this.loadBackground(el);
    });
  }
}
