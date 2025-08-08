


const wrapper = document.querySelector('.wrapper');
const wrapperImages = document.querySelectorAll('.wrapper img');
const itemsLine = document.querySelector('.items__line');
const items = document.querySelectorAll('.items__line .item');

// Настройки анимации
const ANIMATION_SETTINGS = {
  startOffset: 0.16, // Начало анимации (10% от высоты элемента)
  endOffset: 0.84    // Конец анимации (90% от высоты элемента)
};

// Инициализация
gsap.set(wrapperImages, { clipPath: 'inset(100% 0 0 0)' });
gsap.set(wrapperImages[0], { clipPath: 'inset(0% 0 0 0)' });

// Основной ScrollTrigger
ScrollTrigger.create({
  trigger: ".services__new",
  start: "top -=5.5%",
  end: `+=${(items.length - 1) * 100}%`,
  pin: true,
  scrub: 1,
  onUpdate: self => {
    const progress = self.progress;
    
    // Анимация линии
    gsap.to(itemsLine, {
      top: `-${self.progress * 100 * (items.length - 1)}%`,
      ease: "none"
    });
    
    // Анимация clip-path для каждого элемента
    items.forEach((item, index) => {
      if (index === 0) return;
      
      const img = wrapperImages[index];
      const itemRect = item.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      
      // Расчет пересечения
      const intersectionStart = wrapperRect.bottom - itemRect.top;
      const intersectionEnd = wrapperRect.top - itemRect.bottom;
      
      // Прогресс анимации (0-1)
      let animProgress = 0;
      
      if (intersectionStart > 0 && intersectionEnd < 0) {
        // Элемент пересекает wrapper
        const visibleHeight = wrapperRect.height * ANIMATION_SETTINGS.endOffset - 
                             wrapperRect.height * ANIMATION_SETTINGS.startOffset;
        animProgress = (intersectionStart - wrapperRect.height * ANIMATION_SETTINGS.startOffset) / visibleHeight;
        animProgress = Math.min(1, Math.max(0, animProgress));
      }
      
      // Применяем анимацию
      gsap.to(img, {
        clipPath: `inset(${100 - animProgress * 100}% 0 0 0)`,
        duration: 0.1,
        overwrite: true
      });
    });
  }
});