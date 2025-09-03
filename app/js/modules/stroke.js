function updateMarqueeAnimation() {
    const marqueeContainer = document.getElementById('marqueeContainer');
    const strokeItems = document.querySelectorAll('.stoke__item');

    if (!marqueeContainer || strokeItems.length === 0) return;

    // Берем ширину первого элемента
    const itemWidth = strokeItems[0].scrollWidth;
    const containerWidth = marqueeContainer.parentElement.offsetWidth;

    // Рассчитываем точное смещение
    // Для двух одинаковых элементов смещаем ровно на ширину одного
    const translateValue = -(itemWidth / containerWidth * 100);

    let style = document.getElementById('dynamic-marquee');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dynamic-marquee';
        document.head.appendChild(style);
    }

    style.innerHTML = `
        @keyframes animFooter {
            0% { transform: translateX(0%); }
            100% { transform: translateX(${translateValue - 0.5}%); }
        }
    `;
}

// Функция с задержкой для оптимизации
let resizeTimeout;
function debouncedUpdate() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateMarqueeAnimation, 250);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    // Даем время на загрузку шрифтов и стилей
    setTimeout(updateMarqueeAnimation, 100);
});

window.addEventListener('resize', debouncedUpdate);